import admin from "../firebaseAdmin.js";
const db = admin.firestore();

const dataHoraSP = () =>
  new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function handler(req, res) {

 
  if (req.method === "GET" && req.query.tipo === "dashboardHoje") {
    try {
     
      const estadoSnap = await db.collection("estadoBalanca").doc("atual").get();
      const estado = estadoSnap.exists ? estadoSnap.data() : {};

      const contagemAtiva = !!estado?.aberto;
      const inicioContagem = estado?.dataInicioTexto || null;

      let statusEstacao = "offline";
      const atualizadoEm = estado?.atualizadoEm?.toDate ? estado.atualizadoEm.toDate() : null;
      if (atualizadoEm) {
        const diffMs = Date.now() - atualizadoEm.getTime();
        statusEstacao = diffMs <= 2 * 60 * 1000 ? "online" : "offline";
      }

     
      const nowSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      const startSP = new Date(nowSP);
      startSP.setHours(0, 0, 0, 0);

      const regsSnap = await db
        .collection("registrosBalanca")
        .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startSP))
        .orderBy("timestamp", "asc")
        .get();

    
      let pessoasHoje = 0;
      let pesoHoje = 0;
      const porHora = {}; 

      regsSnap.docs.forEach((doc) => {
        const r = doc.data();
        const pesoPrato = Number(r.pesoPrato) || 0;
        if (pesoPrato <= 0) return;

        pessoasHoje += 1;
        pesoHoje += pesoPrato;

        const t = r.timestamp?.toDate ? r.timestamp.toDate() : null;
        if (!t) return;

        const hh = t.toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        }).slice(0, 2);

        const hora = `${hh}:00`;
        porHora[hora] = (porHora[hora] || 0) + 1;
      });

      const evolucaoHoraria = Object.keys(porHora)
        .sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)))
        .map((hora) => ({ hora, quantidade: porHora[hora] }));

      const pesoMedioHoje = pessoasHoje > 0 ? (pesoHoje / pessoasHoje) : 0;

      return res.status(200).json({
        sucesso: true,
        contagemAtiva,
        inicioContagem,
        statusEstacao,

        pessoasHoje,
        pesoHoje: Number(pesoHoje.toFixed(2)),
        pesoMedioHoje: Number(pesoMedioHoje.toFixed(3)),

        evolucaoHoraria,
      });
    } catch (e) {
      console.error("❌ [GET dashboardHoje] Falha:", e);
      return res.status(500).json({ erro: "Erro ao buscar dashboard de hoje" });
    }
  }

if (req.method === "GET" && req.query.tipo === "relatorio") {
  try {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
      return res.status(400).json({ erro: "Informe inicio e fim (YYYY-MM-DD)" });
    }

  
    const CUSTO_POR_REFEICAO = 8.5;

   
    const startSP = new Date(`${inicio}T00:00:00-03:00`);
    const endSP = new Date(`${fim}T23:59:59-03:00`);

    const regsSnap = await db
      .collection("registrosBalanca")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startSP))
      .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endSP))
      .orderBy("timestamp", "asc")
      .get();

    
    const porDia = {};

    regsSnap.docs.forEach((doc) => {
      const r = doc.data();
      const pesoPrato = Number(r.pesoPrato) || 0;

    
      if (pesoPrato <= 0) return;

      const t = r.timestamp?.toDate ? r.timestamp.toDate() : null;
      if (!t) return;

     
      const ymd = t.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      if (!porDia[ymd]) porDia[ymd] = { refeicoes: 0, pesoTotal: 0 };

      porDia[ymd].refeicoes += 1;
      porDia[ymd].pesoTotal += pesoPrato;
    });

    
    const diasOrdenados = Object.keys(porDia).sort();

    const detalhes = diasOrdenados.map((ymd) => {
      const d = porDia[ymd];
      const pesoMedio = d.refeicoes > 0 ? d.pesoTotal / d.refeicoes : 0;

    
      const [ano, mes, dia] = ymd.split("-");
      const dataCompleta = `${dia}/${mes}/${ano}`; 
      const dataGrafico = `${dia}/${mes}`;         

      return {
        ymd,
        data: dataCompleta,
        dataGrafico,
        refeicoes: d.refeicoes,
        pesoTotal: Number(d.pesoTotal.toFixed(2)),
        pesoMedio: Number(pesoMedio.toFixed(3)),
      };
    });

    const totalRefeicoes = detalhes.reduce((acc, d) => acc + d.refeicoes, 0);
    const totalKg = detalhes.reduce((acc, d) => acc + d.pesoTotal, 0);
    const pesoMedioGeral = totalRefeicoes > 0 ? totalKg / totalRefeicoes : 0;

    const resumo = {
      totalRefeicoes,
      totalKg: Number(totalKg.toFixed(2)),
      pesoMedio: Number(pesoMedioGeral.toFixed(3)),
      custoEstimado: Number((totalRefeicoes * CUSTO_POR_REFEICAO).toFixed(2)),
    };

    const grafico = detalhes.map((d) => ({
      data: d.dataGrafico,
      quantidade: d.refeicoes,
      peso: d.pesoTotal,
    }));

    return res.status(200).json({
      sucesso: true,
      resumo,
      grafico,
      detalhes: detalhes.map(({ ymd, data, refeicoes, pesoTotal, pesoMedio }) => ({
        data,
        refeicoes,
        pesoTotal,
        pesoMedio,
      })),
    });
  } catch (e) {
    console.error("❌ [GET relatorio] Falha:", e);
    return res.status(500).json({ erro: "Falha ao gerar relatório" });
  }
}

  if (req.method === "POST" && req.query.tipo === "cicloManual") {
    try {
      const ciclo = req.body;
      await db.collection("ciclosBalanca").add({
        ...ciclo,
        criadoManual: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ sucesso: true, ciclo });
    } catch (e) {
      console.error("❌ [MANUAL] Falha:", e);
      return res.status(500).json({ erro: "Falha ao salvar ciclo manual" });
    }
  }


  if (req.method === "POST") {
    const { pesoPrato = 0, pesoTotal = 0, pessoas = 0, acao = null } = req.body;
    const dataHora = dataHoraSP(); 

    const estadoRef = db.collection("estadoBalanca").doc("atual");

    
    if (acao === "START") {
      await estadoRef.set(
        {
          aberto: true,
          dataInicio: admin.firestore.FieldValue.serverTimestamp(),
          dataInicioTexto: dataHora, 
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(200).json({ sucesso: true, mensagem: "Contagem iniciada" });
    }

   
    if (acao === "STOP") {
      await estadoRef.set(
        {
          aberto: false,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(200).json({ sucesso: true, mensagem: "Contagem parada" });
    }

    try {
      const nPesoPrato = Number(pesoPrato) || 0;
      const nPesoTotal = Number(pesoTotal) || 0;
      const nPessoas = Number(pessoas) || 0;

    
      await db.collection("registrosBalanca").add({
        dataHora: dataHora, 
        pesoPrato: nPesoPrato,
        pesoTotal: nPesoTotal,
        pessoas: nPessoas,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

     
      if (nPesoTotal === 0 && nPessoas === 0) {
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(estadoRef);
          if (!snap.exists) return;

          const estado = snap.data();
          if (!estado.aberto) return;

          const dataFim = dataHora; 

          const ciclo = {
            dataInicio: estado.dataInicioTexto || dataFim,
            dataFim,
            totalPessoas: Number(estado.totalPessoas) || 0,
            pesoTotal: Number(estado.pesoTotal) || 0,
            criadoManual: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection("ciclosBalanca").add(ciclo);

          tx.set(
            estadoRef,
            {
              aberto: false,
              totalPessoas: 0,
              pesoTotal: 0,
              dataInicio: null,
              dataInicioTexto: null,
              atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        });

        return res.status(200).json({ sucesso: true, mensagem: "Ciclo encerrado" });
      }

     
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(estadoRef);

        if (!snap.exists || !snap.data().aberto) {
          tx.set(estadoRef, {
            aberto: true,
            dataInicio: admin.firestore.FieldValue.serverTimestamp(),
            dataInicioTexto: dataHora, 
            totalPessoas: 1,
            pesoTotal: nPesoPrato,
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          const estado = snap.data();
          tx.set(
            estadoRef,
            {
              totalPessoas: Number(estado.totalPessoas || 0) + 1,
              pesoTotal: Number(estado.pesoTotal || 0) + nPesoPrato,
              atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      });

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      console.error("❌ [POST] Falha:", error);
      return res.status(500).json({ erro: "Falha ao salvar no Firestore" });
    }
  }

  return res.status(405).json({ erro: "Método não permitido" });
}

import admin from "../firebaseAdmin.js";
const db = admin.firestore();
const parseRangeDate = (value, mode) => {

  if (!value) return null;

  const s = String(value).trim();

  if (s.includes("T") && (s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s))) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }


  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
    const d = new Date(`${s}:00-03:00`);
    return isNaN(d.getTime()) ? null : d;
  }


  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const suffix = mode === "start" ? "T00:00:00-03:00" : "T23:59:59-03:00";
    const d = new Date(`${s}${suffix}`);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const getDefaultSPRangeToday = () => {
  const nowSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const startSP = new Date(nowSP); startSP.setHours(0, 0, 0, 0);
  const endSP = new Date(nowSP);   endSP.setHours(23, 59, 59, 999);
  return { startSP, endSP };
};

const dataHoraSP = () =>
  new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function handler(req, res) {

 if (req.method === "GET" && req.query.tipo === "ciclosHoje") {
  try {
    const nowSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const startSP = new Date(nowSP); startSP.setHours(0, 0, 0, 0);
    const endSP = new Date(nowSP); endSP.setHours(23, 59, 59, 999);

   
    const snap = await db
      .collection("ciclosBalanca")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startSP))
      .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endSP))
      .orderBy("timestamp", "desc")
      .get();

    let pessoasManual = 0;
    let pesoManual = 0;

    const ciclos = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.criadoManual === true)
      .map((c) => {
        const totalPessoas = Number(c.totalPessoas || 0);
        const pesoTotal = Number(c.pesoTotal || 0);

        pessoasManual += totalPessoas;
        pesoManual += pesoTotal;

        return {
          id: c.id,
          dataInicio: c.dataInicio || "",
          dataFim: c.dataFim || "",
          totalPessoas,
          pesoTotal,
          criadoManual: true,
        };
      });

    const pesoMedioManual = pessoasManual > 0 ? (pesoManual / pessoasManual) : 0;

    return res.status(200).json({
      sucesso: true,
      resumoManual: {
        pessoasManual,
        pesoManual: Number(pesoManual.toFixed(2)),
        pesoMedioManual: Number(pesoMedioManual.toFixed(3)),
      },
      ciclos,
    });
  } catch (e) {
    console.error("❌ [GET ciclosHoje] Falha:", e);
    return res.status(500).json({ erro: String(e?.message || e) });
  }
}


 
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

  if (req.method === "GET" && req.query.tipo === "ciclosManuais") {
  try {
    const { inicio, fim } = req.query;

    const { startSP: defaultStart, endSP: defaultEnd } = getDefaultSPRangeToday();

    const startSP = parseRangeDate(inicio, "start") || defaultStart;
    const endSP = parseRangeDate(fim, "end") || defaultEnd;

    if (endSP.getTime() < startSP.getTime()) {
      return res.status(400).json({ erro: "fim não pode ser antes de inicio" });
    }

    const snap = await db
      .collection("ciclosBalanca")
      .where("criadoManual", "==", true)
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startSP))
      .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endSP))
      .orderBy("timestamp", "desc")
      .get();

    const ciclos = snap.docs.map((d) => {
      const c = d.data();
      return {
        id: d.id,
        dataInicio: c.dataInicio || "",
        dataFim: c.dataFim || "",
        totalPessoas: Number(c.totalPessoas || 0),
        pesoTotal: Number(Number(c.pesoTotal || 0).toFixed(3)),
        criadoManual: true,
        timestampISO: c.timestamp?.toDate ? c.timestamp.toDate().toISOString() : null,
      };
    });

    return res.status(200).json({
      sucesso: true,
      range: { inicio: startSP.toISOString(), fim: endSP.toISOString() },
      ciclos,
    });
  } catch (e) {
    console.error("❌ [GET ciclosManuais] Falha:", e);
    return res.status(500).json({ erro: String(e?.message || e) });
  }
}


if (req.method === "GET" && req.query.tipo === "relatorio") {
  try {
    const { inicio, fim, custoPorKg = "", custoPorRefeicao = "" } = req.query;

    if (!inicio || !fim) {
      return res.status(400).json({ erro: "Informe inicio e fim (YYYY-MM-DD)" });
    }

    const startSP = new Date(`${inicio}T00:00:00-03:00`);
    const endSP   = new Date(`${fim}T23:59:59-03:00`);

    
    const toNumber = (v) => {
      if (v === null || v === undefined) return null;
      const n = Number(String(v).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    const cpk = toNumber(custoPorKg);         
    const cpr = toNumber(custoPorRefeicao);   

    const calcCusto = (totalRefeicoes, totalKg) => {
      const tr = Number(totalRefeicoes || 0);
      const tk = Number(totalKg || 0);

      if (tr <= 0) return { custoTotal: 0, custoPorRefeicao: 0 };

     
      if (cpk !== null) {
        const custoTotal = tk * cpk;
        return {
          custoTotal: Number(custoTotal.toFixed(2)),
          custoPorRefeicao: Number((custoTotal / tr).toFixed(2)),
        };
      }

      if (cpr !== null) {
        const custoTotal = tr * cpr;
        return {
          custoTotal: Number(custoTotal.toFixed(2)),
          custoPorRefeicao: Number(cpr.toFixed(2)),
        };
      }

      return { custoTotal: 0, custoPorRefeicao: 0 };
    };

    
    const regsSnap = await db
      .collection("registrosBalanca")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startSP))
      .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endSP))
      .orderBy("timestamp", "desc")
      .get();

    const porDiaAuto = {};
    regsSnap.docs.forEach((doc) => {
      const r = doc.data();
      const pesoPrato = Number(r.pesoPrato) || 0;
      if (pesoPrato <= 0) return;

      const t = r.timestamp?.toDate ? r.timestamp.toDate() : null;
      if (!t) return;

      const ymd = t.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      if (!porDiaAuto[ymd]) porDiaAuto[ymd] = { refeicoesAuto: 0, kgAuto: 0 };

      porDiaAuto[ymd].refeicoesAuto += 1;
      porDiaAuto[ymd].kgAuto += pesoPrato;
    });

    const manSnap = await db
      .collection("ciclosBalanca")
      .where("criadoManual", "==", true)
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startSP))
      .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endSP))
      .orderBy("timestamp", "desc")
      .get();

    const porDiaManual = {};
    manSnap.docs.forEach((doc) => {
      const c = doc.data();
      const pessoas = Number(c.totalPessoas) || 0;
      const kg = Number(c.pesoTotal) || 0;
      if (pessoas <= 0) return;

      const t = c.timestamp?.toDate ? c.timestamp.toDate() : null;
      if (!t) return;

      const ymd = t.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      if (!porDiaManual[ymd]) porDiaManual[ymd] = { refeicoesManual: 0, kgManual: 0 };

      porDiaManual[ymd].refeicoesManual += pessoas;
      porDiaManual[ymd].kgManual += kg;
    });

    const dias = Array.from(new Set([...Object.keys(porDiaAuto), ...Object.keys(porDiaManual)])).sort();

    const detalhes = dias.map((ymd) => {
      const a = porDiaAuto[ymd] || { refeicoesAuto: 0, kgAuto: 0 };
      const m = porDiaManual[ymd] || { refeicoesManual: 0, kgManual: 0 };

      const refeicoesGeral = a.refeicoesAuto + m.refeicoesManual;
      const kgGeral = a.kgAuto + m.kgManual;

      const pesoMedioAuto = a.refeicoesAuto > 0 ? a.kgAuto / a.refeicoesAuto : 0;
      const pesoMedioManual = m.refeicoesManual > 0 ? m.kgManual / m.refeicoesManual : 0;
      const pesoMedioGeral = refeicoesGeral > 0 ? kgGeral / refeicoesGeral : 0;

      const [ano, mes, dia] = ymd.split("-");
      const data = `${dia}/${mes}/${ano}`;
      const dataGrafico = `${dia}/${mes}`;

      return {
        ymd,
        data,
        dataGrafico,
        refeicoesAuto: a.refeicoesAuto,
        kgAuto: Number(a.kgAuto.toFixed(2)),
        pesoMedioAuto: Number(pesoMedioAuto.toFixed(3)),
        refeicoesManual: m.refeicoesManual,
        kgManual: Number(m.kgManual.toFixed(2)),
        pesoMedioManual: Number(pesoMedioManual.toFixed(3)),
        refeicoesGeral,
        kgGeral: Number(kgGeral.toFixed(2)),
        pesoMedioGeral: Number(pesoMedioGeral.toFixed(3)),
      };
    });

    const totalAutoRefeicoes = detalhes.reduce((acc, d) => acc + d.refeicoesAuto, 0);
    const totalAutoKg        = detalhes.reduce((acc, d) => acc + d.kgAuto, 0);

    const totalManualRefeicoes = detalhes.reduce((acc, d) => acc + d.refeicoesManual, 0);
    const totalManualKg        = detalhes.reduce((acc, d) => acc + d.kgManual, 0);

    const totalGeralRefeicoes = totalAutoRefeicoes + totalManualRefeicoes;
    const totalGeralKg        = totalAutoKg + totalManualKg;

    const pesoMedioAuto  = totalAutoRefeicoes > 0 ? totalAutoKg / totalAutoRefeicoes : 0;
    const pesoMedioManual= totalManualRefeicoes > 0 ? totalManualKg / totalManualRefeicoes : 0;
    const pesoMedioGeral = totalGeralRefeicoes > 0 ? totalGeralKg / totalGeralRefeicoes : 0;

    
    const custoAuto  = calcCusto(totalAutoRefeicoes, totalAutoKg);
    const custoManual= calcCusto(totalManualRefeicoes, totalManualKg);
    const custoGeral = calcCusto(totalGeralRefeicoes, totalGeralKg);

    const resumo = {
      auto: {
        totalRefeicoes: totalAutoRefeicoes,
        totalKg: Number(totalAutoKg.toFixed(2)),
        pesoMedio: Number(pesoMedioAuto.toFixed(3)),
        custoTotal: custoAuto.custoTotal,
        custoPorRefeicao: custoAuto.custoPorRefeicao,
      },
      manual: {
        totalRefeicoes: totalManualRefeicoes,
        totalKg: Number(totalManualKg.toFixed(2)),
        pesoMedio: Number(pesoMedioManual.toFixed(3)),
        custoTotal: custoManual.custoTotal,
        custoPorRefeicao: custoManual.custoPorRefeicao,
      },
      geral: {
        totalRefeicoes: totalGeralRefeicoes,
        totalKg: Number(totalGeralKg.toFixed(2)),
        pesoMedio: Number(pesoMedioGeral.toFixed(3)),
        custoTotal: custoGeral.custoTotal,
        custoPorRefeicao: custoGeral.custoPorRefeicao,
      },
    };

    const grafico = detalhes.map((d) => ({
      data: d.dataGrafico,
      quantidadeAuto: d.refeicoesAuto,
      quantidadeManual: d.refeicoesManual,
    }));

    return res.status(200).json({
      sucesso: true,
      resumo,
      grafico,
      detalhes: detalhes.map((d) => ({
        data: d.data,
        refeicoesAuto: d.refeicoesAuto,
        refeicoesManual: d.refeicoesManual,
        refeicoesGeral: d.refeicoesGeral,
        pesoAuto: d.kgAuto,
        pesoManual: d.kgManual,
        pesoGeral: d.kgGeral,
        pesoMedioAuto: d.pesoMedioAuto,
        pesoMedioManual: d.pesoMedioManual,
        pesoMedioGeral: d.pesoMedioGeral,
      })),
    });
  } catch (e) {
    console.error("❌ [GET relatorio] Falha:", e);
    return res.status(500).json({ erro: "Falha ao gerar relatório" });
  }
}



if (req.method === "GET" && req.query.tipo === "registros") {
  try {
    const { q = "", inicio = "", fim = "" } = req.query;

   
    const parseRangeDate = (value, mode) => {
      
      if (!value) return null;

      const s = String(value).trim();

      
      if (s.includes("T") && (s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s))) {
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      }

     
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
        const d = new Date(`${s}:00-03:00`);
        return isNaN(d.getTime()) ? null : d;
      }

     
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const suffix = mode === "start" ? "T00:00:00-03:00" : "T23:59:59-03:00";
        const d = new Date(`${s}${suffix}`);
        return isNaN(d.getTime()) ? null : d;
      }

     
      return null;
    };

    const nowSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const defaultStart = new Date(nowSP); defaultStart.setHours(0, 0, 0, 0);
    const defaultEnd = new Date(nowSP);   defaultEnd.setHours(23, 59, 59, 999);

    const startDate = parseRangeDate(inicio, "start") || defaultStart;
    const endDate = parseRangeDate(fim, "end") || defaultEnd;

    if (endDate.getTime() < startDate.getTime()) {
      return res.status(400).json({ erro: "fim não pode ser antes de inicio" });
    }

    const snap = await db
      .collection("registrosBalanca")
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(startDate))
      .where("timestamp", "<=", admin.firestore.Timestamp.fromDate(endDate))
      .orderBy("timestamp", "desc")
      .limit(500)
      .get();

    const termo = String(q || "").trim().toLowerCase();

    const registros = snap.docs
      .map((d) => {
        const r = d.data();
        const ts = r.timestamp?.toDate ? r.timestamp.toDate() : null;

        return {
          id: d.id,
          dataHora: r.dataHora || (ts ? ts.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : ""),
          pesoPrato: Number(r.pesoPrato || 0),
          pesoTotal: Number(r.pesoTotal || 0),
          pessoas: Number(r.pessoas || 0),
          timestampISO: ts ? ts.toISOString() : null,
        };
      })
      .filter((r) => {
        if (!termo) return true;
        const hay = `${r.dataHora} ${r.pesoPrato} ${r.pesoTotal} ${r.pessoas}`.toLowerCase();
        return hay.includes(termo);
      });

    return res.status(200).json({
      sucesso: true,
      range: {
        inicio: startDate.toISOString(),
        fim: endDate.toISOString(),
      },
      registros,
    });
  } catch (e) {
    console.error("❌ [GET registros] Falha:", e);
    return res.status(500).json({ erro: String(e?.message || e) });
  }
}


if (req.method === "PUT" && req.query.tipo === "cicloManual") {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ erro: "Informe o id do ciclo" });

    const { dataInicio, dataFim, totalPessoas, pesoTotal } = req.body || {};

  
    if (!dataInicio || !dataFim) return res.status(400).json({ erro: "dataInicio e dataFim são obrigatórios" });

    const tp = Number(totalPessoas || 0);
    const pt = Number(pesoTotal || 0);
    if (!Number.isFinite(tp) || tp <= 0) return res.status(400).json({ erro: "totalPessoas inválido" });
    if (!Number.isFinite(pt) || pt <= 0) return res.status(400).json({ erro: "pesoTotal inválido" });

    await db.collection("ciclosBalanca").doc(id).set(
      {
        dataInicio,
        dataFim,
        totalPessoas: tp,
        pesoTotal: pt,
        criadoManual: true,
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ sucesso: true });
  } catch (e) {
    console.error("❌ [PUT cicloManual] Falha:", e);
    return res.status(500).json({ erro: String(e?.message || e) });
  }
}

if (req.method === "DELETE" && req.query.tipo === "cicloManual") {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ erro: "Informe o id do ciclo" });

    await db.collection("ciclosBalanca").doc(id).delete();
    return res.status(200).json({ sucesso: true });
  } catch (e) {
    console.error("❌ [DELETE cicloManual] Falha:", e);
    return res.status(500).json({ erro: String(e?.message || e) });
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

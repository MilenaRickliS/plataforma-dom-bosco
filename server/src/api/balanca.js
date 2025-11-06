
import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {

  if (req.method === "POST" && req.query.tipo === "cicloManual") {
    try {
      const ciclo = req.body;
      await db.collection("ciclosBalanca").add({
        ...ciclo,
        criadoManual: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("📦 [MANUAL] Ciclo salvo:", ciclo);
      return res.status(200).json({ sucesso: true, ciclo });
    } catch (e) {
      console.error("❌ [MANUAL] Falha:", e);
      return res.status(500).json({ erro: "Falha ao salvar ciclo manual" });
    }
  }

 
  if (req.method === "POST") {
    try {
      const { pesoPrato = 0, pesoTotal = 0, pessoas = 0 } = req.body;
      const dataHora = new Date().toLocaleString("pt-BR");
      const nPesoPrato = Number(pesoPrato) || 0;
      const nPesoTotal = Number(pesoTotal) || 0;
      const nPessoas = Number(pessoas) || 0;

 
      await db.collection("registrosBalanca").add({
        dataHora,
        pesoPrato: nPesoPrato,
        pesoTotal: nPesoTotal,
        pessoas: nPessoas,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("🧾 [REG] registro:", { dataHora, nPesoPrato, nPesoTotal, nPessoas });

      const estadoRef = db.collection("estadoBalanca").doc("atual");

      
      if (nPesoTotal === 0 && nPessoas === 0) {
        console.log("🔁 [RESET] recebido");
        await db.runTransaction(async (tx) => {
          const snap = await tx.get(estadoRef);
          if (!snap.exists) {
            console.log("ℹ️ [RESET] estado inexistente, nada a fechar");
            return;
          }
          const estado = snap.data();
          if (!estado.aberto) {
            console.log("ℹ️ [RESET] já fechado, ignorando");
            return;
          }

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
          console.log("✅ [CLOSE] ciclo salvo:", ciclo);

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
         
          console.log("🚀 [OPEN] abrindo ciclo");
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
          console.log("➕ [ADD] acumulando", {
            prevPessoas: estado.totalPessoas,
            prevPeso: estado.pesoTotal,
            add: nPesoPrato,
          });
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

  if (req.method === "GET" && req.query.tipo === "ciclos") {
    try {
      const snapshot = await db
        .collection("ciclosBalanca")
        .orderBy("timestamp", "desc")
        .get();
      const ciclos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ sucesso: true, ciclos });
    } catch (e) {
      console.error("❌ [GET ciclos] Falha:", e);
      return res.status(500).json({ erro: "Erro ao buscar ciclos" });
    }
  }

  
  if (req.method === "GET" && req.query.tipo === "relatorio") {
    try {
      const ciclosSnap = await db.collection("ciclosBalanca").get();
      const registrosSnap = await db.collection("registrosBalanca").get();

      const ciclos = ciclosSnap.docs.map((d) => d.data());
      const registros = registrosSnap.docs.map((d) => d.data());

      const totalCiclos = ciclos.length;
      const totalRegistros = registros.length;

      const pesoTotal = [
        ...ciclos.map((c) => Number(c.pesoTotal) || 0),
        ...registros.map((r) => Number(r.pesoPrato) || 0),
      ].reduce((a, b) => a + b, 0);

      const pessoasTotal = ciclos.reduce((a, c) => a + (Number(c.totalPessoas) || 0), 0);
      const mediaPeso = pesoTotal / (totalRegistros || 1);

      const dataset = ciclos.map((c) => ({
        data: c.dataFim || c.dataInicio,
        total: Number(c.totalPessoas) || 0,
        peso: Number(c.pesoTotal) || 0,
        tipo: c.criadoManual ? "Manual" : "Automático",
      }));

      return res.status(200).json({
        sucesso: true,
        dataset,
        estatisticas: {
          totalCiclos,
          totalRegistros,
          pesoTotal: Number(pesoTotal.toFixed(2)),
          pessoasTotal,
          mediaPeso: Number(mediaPeso.toFixed(2)),
        },
      });
    } catch (e) {
      console.error("❌ [GET relatorio] Falha:", e);
      return res.status(500).json({ erro: "Falha ao gerar relatório" });
    }
  }

  
  if (req.method === "GET") {
    try {
      const snapshot = await db
        .collection("registrosBalanca")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();
      const registros = snapshot.docs.map((doc) => doc.data());
      return res.status(200).json(registros);
    } catch (e) {
      console.error("❌ [GET registros] Falha:", e);
      return res.status(500).json({ erro: "Erro ao buscar dados" });
    }
  }

  return res.status(405).json({ erro: "Método não permitido" });
}

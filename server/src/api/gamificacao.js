import admin from "../firebaseAdmin.js";
const db = admin.firestore();

async function atualizarPontos(userId, delta, motivo = "") {
  const ref = db.collection("usuarios").doc(userId);
  const logRef = db.collection("gamificacao_logs").doc();

  return await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const dados = doc.exists ? doc.data() : {};
    const pontosAtuais = dados.pontos || 0;
    const nome = dados.nome || "Sem nome";
    const email = dados.email || "Sem email";
    const novosPontos = Math.max(0, pontosAtuais + delta);

    // Atualiza os pontos
    t.set(ref, { pontos: novosPontos }, { merge: true });

    // Cria log de histórico
    t.set(logRef, {
      userId,
      nome,
      email,
      tipo: delta > 0 ? "ganho" : "perda",
      valor: Math.abs(delta),
      motivo,
      pontosTotais: novosPontos,
      data: admin.firestore.FieldValue.serverTimestamp(),
    });

    return novosPontos;
  });
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        console.warn("⚠️ Corpo enviado não é JSON válido");
      }
    }

    if (method === "POST" && req.url.includes("/add")) {
      const { userId, valor, motivo } = body || {};
      if (!userId || valor === undefined)
        return res.status(400).json({ error: "userId e valor são obrigatórios" });

      const total = await atualizarPontos(userId, valor, motivo || "Adição de pontos");
      return res.status(200).json({ success: true, total });
    }

    if (method === "POST" && req.url.includes("/remove")) {
      const { userId, valor, motivo } = body || {};
      if (!userId || valor === undefined)
        return res.status(400).json({ error: "userId e valor são obrigatórios" });

      const total = await atualizarPontos(userId, -Math.abs(valor), motivo || "Remoção de pontos");
      return res.status(200).json({ success: true, total });
    }

    if (method === "GET") {
      const userId = req.query.userId || req.url.split("/").pop();
      if (!userId) return res.status(400).json({ error: "userId obrigatório" });

      const doc = await db.collection("usuarios").doc(userId).get();
      const pontos = doc.exists ? doc.data().pontos || 0 : 0;

      return res.status(200).json({ pontos });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("❌ Erro na rota gamificação:", err);
    return res.status(500).json({ error: err.message });
  }
}

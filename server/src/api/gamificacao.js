import admin from "../firebaseAdmin.js";

const db = admin.firestore();

async function atualizarPontos(userId, delta) {
  const ref = db.collection("usuarios").doc(userId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const pontosAtuais = doc.exists ? doc.data().pontos || 0 : 0;
    const novosPontos = Math.max(0, pontosAtuais + delta);
    t.set(ref, { pontos: novosPontos }, { merge: true });
  });
  return true;
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        console.warn("⚠️ Corpo enviado não é JSON válido (provavelmente vazio)");
      }
    }

    
    if (method === "POST" && req.url.includes("/add")) {
      const { userId, valor } = body || {};
      if (!userId || valor === undefined)
        return res.status(400).json({ error: "userId e valor são obrigatórios" });

      await atualizarPontos(userId, valor);
      return res.status(200).json({ success: true });
    }

    
    if (method === "POST" && req.url.includes("/remove")) {
      const { userId, valor } = body || {};
      if (!userId || valor === undefined)
        return res.status(400).json({ error: "userId e valor são obrigatórios" });

      await atualizarPontos(userId, -Math.abs(valor));
      return res.status(200).json({ success: true });
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
    console.error("❌ Erro na rota gamificacao:", err);
    return res.status(500).json({ error: err.message });
  }
}

import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const snapshot = await db.collection("depoimentos").orderBy("criadoEm", "desc").get();
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(lista);
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);
      res.status(500).json({ error: err.message });
    }
  }

  else if (req.method === "POST") {
    try {
      const { nome, telefone, empresa, mensagem } = req.body;
      if (!nome || !mensagem) {
        return res.status(400).json({ error: "Nome e mensagem são obrigatórios" });
      }

      const docRef = await db.collection("depoimentos").add({
        nome,
        telefone,
        empresa,
        mensagem,
        criadoEm: new Date(),
      });

      res.status(201).json({ id: docRef.id, nome, telefone, empresa, mensagem });
    } catch (err) {
      console.error("Erro ao salvar depoimento:", err);
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(405).json({ error: "Método não permitido" });
  }
}

import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    // Criar questão
    if (req.method === "POST") {
      const { avaliacaoId } = req.query;
      const dados = req.body;

      if (!avaliacaoId)
        return res.status(400).json({ error: "ID da avaliação é obrigatório" });

      const ref = await db
        .collection("publicacoes")
        .doc(avaliacaoId)
        .collection("questoes")
        .add({
          ...dados,
          criadaEm: new Date().toISOString(),
        });

      return res.status(201).json({ ok: true, id: ref.id });
    }

    // Listar questões de uma avaliação
    if (req.method === "GET") {
      const { avaliacaoId } = req.query;

      if (!avaliacaoId)
        return res.status(400).json({ error: "ID da avaliação é obrigatório" });

      const snap = await db
        .collection("publicacoes")
        .doc(avaliacaoId)
        .collection("questoes")
        .orderBy("ordem")
        .get();

      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(lista);
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (e) {
    console.error("Erro em /questoes:", e);
    res.status(500).json({ error: e.message });
  }
}

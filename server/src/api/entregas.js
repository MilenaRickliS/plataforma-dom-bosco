import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    if (method === "GET") {
      const { atividadeId, alunoId } = query;
      if (!atividadeId || !alunoId)
        return res.status(400).json({ error: "atividadeId e alunoId obrigatórios" });

      const snap = await db
        .collection("entregas")
        .where("atividadeId", "==", atividadeId)
        .where("alunoId", "==", alunoId)
        .get();

      const entregas = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(entregas);
    }

    if (method === "POST") {
      const { atividadeId, alunoId, anexos, enviadaEm } = body;
      if (!atividadeId || !alunoId)
        return res.status(400).json({ error: "Campos obrigatórios" });

      const ref = await db.collection("entregas").add({
        atividadeId,
        alunoId,
        anexos: anexos || [],
        enviadaEm: enviadaEm || new Date(),
      });
      return res.status(201).json({ id: ref.id, ok: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("Erro em /api/entregas:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

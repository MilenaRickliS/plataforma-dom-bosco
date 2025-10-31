import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { titulo, descricao, entrega, valor, anexos = [], usuarioId, turmaId } = req.body;

      if (!titulo || !entrega || !usuarioId || !turmaId)
        return res.status(400).json({ error: "Campos obrigatórios faltando" });

      const ref = await db.collection("publicacoes").add({
        tipo: "atividade",
        titulo,
        descricao,
        anexos,
        entrega: admin.firestore.Timestamp.fromDate(new Date(entrega)),
        valor: Number(valor) || 0,
        usuarioId,
        turmaId,
        criadaEm: new Date().toISOString(),
      });

      return res.status(201).json({ ok: true, id: ref.id });
    }

    if (req.method === "GET") {
      const { turmaId } = req.query;
      let queryRef = db.collection("publicacoes").where("tipo", "==", "atividade");

      if (turmaId) {
        queryRef = queryRef.where("turmaId", "==", turmaId);
      }

      const snap = await queryRef.orderBy("criadaEm", "desc").get();
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(lista);
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (e) {
    console.error("Erro em /atividades:", e);
    res.status(500).json({ error: e.message });
  }
}

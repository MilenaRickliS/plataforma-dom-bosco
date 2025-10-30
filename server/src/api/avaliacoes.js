import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { titulo, descricao, valor, usuarioId, turmaCodigo, configuracoes = {} } = req.body;

      if (!titulo || !usuarioId)
        return res.status(400).json({ error: "Campos obrigatórios faltando" });

      const ref = await db.collection("publicacoes").add({
        tipo: "avaliacao",
        titulo,
        descricao,
        valor: Number(valor) || 0,
        usuarioId,
        turmaCodigo: turmaCodigo || null,
        configuracoes,
        criadaEm: new Date().toISOString(),
      });

      return res.status(201).json({ ok: true, id: ref.id });
    }

    if (req.method === "GET") {
      const snap = await db
        .collection("publicacoes")
        .where("tipo", "==", "avaliacao")
        .orderBy("criadaEm", "desc")
        .get();

      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(lista);
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (e) {
    console.error("Erro em /avaliacoes:", e);
    res.status(500).json({ error: e.message });
  }
}

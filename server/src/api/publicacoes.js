import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const dados = req.body;
      if (!dados?.usuarioId || !dados?.titulo || !dados?.tipo)
        return res.status(400).json({ error: "Campos obrigatórios faltando" });

      const ref = await db.collection("publicacoes").add({
        ...dados,
        criadaEm: new Date().toISOString(),
      });

      return res.status(201).json({ ok: true, id: ref.id });
    }

    if (req.method === "GET") {
      const { tipo } = req.query;
      let ref = db.collection("publicacoes");
      if (tipo) ref = ref.where("tipo", "==", tipo);

      const snap = await ref.orderBy("criadaEm", "desc").get();
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(lista);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await db.collection("publicacoes").doc(id).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (e) {
    console.error("Erro em /publicacoes:", e);
    res.status(500).json({ error: e.message });
  }
}

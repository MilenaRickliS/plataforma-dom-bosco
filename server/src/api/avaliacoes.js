import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  try {
 
    if (req.method === "POST") {
      const {
        titulo,
        descricao,
        valor,
        usuarioId,
        turmaCodigo,
        configuracoes = {},
        entrega
      } = req.body;

      if (!titulo || !usuarioId)
        return res.status(400).json({ error: "Campos obrigatórios faltando" });

      const payload = {
        tipo: "avaliacao",
        titulo,
        descricao,
        valor: Number(valor) || 0,
        usuarioId,
         turmaId: req.body.turmaId || null,
         turmaCodigo: turmaCodigo || null,
        configuracoes: {
          respostasMultiplas: !!configuracoes?.respostasMultiplas,
          embaralharRespostas: !!configuracoes?.embaralharRespostas,
          permitirRepeticoes: !!configuracoes?.permitirRepeticoes,
          tentativasMax: configuracoes?.permitirRepeticoes
            ? Number(configuracoes?.tentativasMax || 1)
            : 1,
        },
        notasLiberadas: false, 
        criadaEm: new Date().toISOString(),
      };

      if (entrega) {
        payload.entrega = admin.firestore.Timestamp.fromDate(new Date(entrega));
      }

      const ref = await db.collection("publicacoes").add(payload);
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

   
    if (req.method === "PATCH") {
      const { id } = req.query;
      const { liberarNotas } = req.body;

      if (!id)
        return res.status(400).json({ error: "ID da avaliação é obrigatório" });

      await db.collection("publicacoes").doc(id).set(
        {
          notasLiberadas: !!liberarNotas,
          atualizadoEm: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      );

      return res.status(200).json({
        ok: true,
        message: liberarNotas
          ? "Notas liberadas para os alunos."
          : "Notas ocultadas novamente.",
      });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (e) {
    console.error("Erro em /avaliacoes:", e);
    res.status(500).json({ error: e.message });
  }
}

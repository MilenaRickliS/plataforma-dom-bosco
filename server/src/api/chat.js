import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    
    if (method === "POST") {
      const { codigoTurma, autorId, autorNome, texto } = body;
      if (!codigoTurma || !autorId || !texto)
        return res.status(400).json({ error: "Campos obrigatórios" });

      await db
        .collection("chats")
        .doc(codigoTurma)
        .collection("mensagens")
        .add({
          autorId,
          autorNome: autorNome || "Usuário desconhecido",
          texto,
          criadoEm: new Date(),
        });

      return res.status(201).json({ message: "Mensagem enviada!" });
    }

  
    if (method === "GET") {
      const { codigoTurma } = query;
      if (!codigoTurma)
        return res.status(400).json({ error: "codigoTurma é obrigatório" });

      const snap = await db
        .collection("chats")
        .doc(codigoTurma)
        .collection("mensagens")
        .orderBy("criadoEm", "asc")
        .get();

      const mensagens = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(mensagens);
    }

    
    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("❌ Erro na rota de chat:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

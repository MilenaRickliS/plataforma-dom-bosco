import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    if (method === "POST") {
      const { atividadeId, alunoId, autorId, autorNome, texto } = body;

      if (!atividadeId || !alunoId || !autorId || !texto)
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });

      const chatId = `${atividadeId}_${alunoId}`;

      await db.collection("chats_privados")
        .doc(chatId)
        .collection("mensagens")
        .add({
          atividadeId,
          alunoId,
          autorId,
          autorNome: autorNome || "Usuário",
          texto,
          criadoEm: new Date(),
        });

      return res.status(201).json({ message: "Mensagem salva com sucesso!" });
    }

    if (method === "GET") {
      const { atividadeId, alunoId } = query;
      if (!atividadeId || !alunoId)
        return res.status(400).json({ error: "atividadeId e alunoId são obrigatórios" });

      const chatId = `${atividadeId}_${alunoId}`;

      const snap = await db.collection("chats_privados")
        .doc(chatId)
        .collection("mensagens")
        .orderBy("criadoEm", "asc")
        .get();

      const mensagens = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      return res.status(200).json(mensagens);
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("❌ Erro no chat privado:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

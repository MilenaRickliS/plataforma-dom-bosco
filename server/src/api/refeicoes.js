import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { titulo, total } = req.body;

      if (!titulo || total === undefined) {
        return res
          .status(400)
          .json({ error: "Título e total são obrigatórios." });
      }

      const dataAtual = new Date();
      const dataFormatada = dataAtual.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      });

      const doc = {
        titulo,
        total,
        data: dataFormatada,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("refeicoes").add(doc);

      return res
        .status(200)
        .json({ success: true, message: "Registro salvo!", doc });
    } catch (error) {
      console.error("Erro ao salvar refeição:", error);
      return res
        .status(500)
        .json({ success: false, error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const snapshot = await db
        .collection("refeicoes")
        .orderBy("timestamp", "desc")
        .get();

      const registros = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({ success: true, registros });
    } catch (error) {
      console.error("Erro ao buscar refeições:", error);
      return res
        .status(500)
        .json({ success: false, error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Método não permitido." });
  }
}

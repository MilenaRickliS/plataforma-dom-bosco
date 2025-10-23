import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  const refeicoesRef = db.collection("refeicoes");

  if (req.method === "POST") {
    try {
      const { titulo, total } = req.body;
      if (!titulo || total === undefined) {
        return res.status(400).json({ error: "Título e total são obrigatórios." });
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

      await refeicoesRef.add(doc);
      return res.status(200).json({ success: true, message: "Registro salvo!", doc });
    } catch (error) {
      console.error("Erro ao salvar refeição:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const snapshot = await refeicoesRef.orderBy("timestamp", "desc").get();
      const registros = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ success: true, registros });
    } catch (error) {
      console.error("Erro ao buscar refeições:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, titulo, total, data } = req.body;
      if (!id) return res.status(400).json({ error: "ID é obrigatório." });

      const atualizacoes = {};
      if (titulo !== undefined) atualizacoes.titulo = titulo;
      if (total !== undefined) atualizacoes.total = Number(total);
      if (data) atualizacoes.data = data;

      await refeicoesRef.doc(id).update(atualizacoes);

      return res.status(200).json({ success: true, message: "Registro atualizado!" });
    } catch (error) {
      console.error("Erro ao editar refeição:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório." });
      await refeicoesRef.doc(id).delete();
      return res.status(200).json({ success: true, message: "Registro excluído com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir refeição:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
}

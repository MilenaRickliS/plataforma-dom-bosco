import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // GET - Listar tarefas do professor (ou todas para alunos)
    if (req.method === "GET") {
      const { professorId } = req.query;

      let queryRef = db.collection("tarefasProfessor");

      if (professorId) {
        queryRef = queryRef.where("professorId", "==", professorId);
      }

      const snap = await queryRef.get();
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordenar por data de criação (mais recente primeiro)
      lista.sort((a, b) => (b.criadaEm || "").localeCompare(a.criadaEm || ""));
      return res.status(200).json(lista);
    }

    // POST - Professor cria uma tarefa
    if (req.method === "POST") {
      const { titulo, descricao, anexos = [], professorId, professorNome } = req.body;

      if (!titulo || !professorId) {
        return res.status(400).json({ error: "Título e professorId são obrigatórios." });
      }

      const novaTarefa = {
        titulo,
        descricao: descricao || "",
        anexos,
        professorId,
        professorNome: professorNome || "",
        criadaEm: new Date().toISOString(),
        concluida: false,
      };

      const ref = await db.collection("tarefasProfessor").add(novaTarefa);
      return res.status(201).json({ id: ref.id, ...novaTarefa });
    }

    // PUT - Editar tarefa existente
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID da tarefa não informado." });

      const { titulo, descricao, anexos } = req.body;
      const dados = { atualizadaEm: new Date().toISOString() };
      if (titulo !== undefined) dados.titulo = titulo;
      if (descricao !== undefined) dados.descricao = descricao;
      if (anexos !== undefined) dados.anexos = anexos;

      await db.collection("tarefasProfessor").doc(id).update(dados);
      return res.status(200).json({ success: true });
    }

    // DELETE - Remover tarefa
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID da tarefa não informado." });

      await db.collection("tarefasProfessor").doc(id).delete();
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (err) {
    console.error("❌ Erro em /tarefas-professor:", err);
    return res.status(500).json({ error: err.message });
  }
}

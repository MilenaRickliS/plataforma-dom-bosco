import admin from "../firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === "GET") {
      const { professorId, alunoId } = req.query;
      let turmasQuery = db.collection("turmas");

      // 🔹 Filtros opcionais
      if (professorId) {
        turmasQuery = turmasQuery.where("professorId", "==", professorId);
      } else if (alunoId) {
        turmasQuery = turmasQuery.where("alunos", "array-contains", alunoId);
      }

      const snapshot = await turmasQuery.get();
      const turmas = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Buscar dados do professor
        let professor = null;
        if (data.professorId) {
          const profDoc = await db.collection("usuarios").doc(data.professorId).get();
          if (profDoc.exists) {
            professor = profDoc.data().nome || "Professor não identificado";
          }
        }

        turmas.push({
          id: doc.id,
          ...data,
          professorNome: professor,
        });
      }

      return res.status(200).json(turmas);
    }

    // 🔹 Criar turma
    if (method === "POST" && req.url.includes("/criar")) {
      const { nomeTurma, materia, imagem, professorId, professorNome } = req.body;

      if (!nomeTurma || !materia || !professorId) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }

      const codigo = uuidv4().slice(0, 6).toUpperCase();

      const turmaRef = await db.collection("turmas").add({
        nomeTurma,
        materia,
        imagem: imagem || "",
        codigo,
        professorId,
        professorNome: professorNome || "",
        alunos: [],
        criadoEm: new Date(),
      });

      return res.status(201).json({ id: turmaRef.id, codigo });
    }

    // 🔹 Ingressar em turma
    if (method === "POST" && req.url.includes("/ingressar")) {
      const { codigo, alunoId } = req.body;
      if (!codigo || !alunoId) {
        return res.status(400).json({ error: "Código e alunoId são obrigatórios" });
      }

      const turmaSnap = await db.collection("turmas").where("codigo", "==", codigo).get();
      if (turmaSnap.empty) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      const turmaDoc = turmaSnap.docs[0];
      const turmaRef = db.collection("turmas").doc(turmaDoc.id);

      await turmaRef.update({
        alunos: admin.firestore.FieldValue.arrayUnion(alunoId),
      });

      return res.json({ message: "Aluno adicionado com sucesso", turmaId: turmaDoc.id });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("Erro na rota de turmas:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

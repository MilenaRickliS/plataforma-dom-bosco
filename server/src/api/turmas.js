import admin from "../firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();

export default async function handler(req, res) {
  const { method } = req;

  try {
    
    if (method === "GET") {
        const { professorId, alunoId } = req.query;
        let turmasQuery = db.collection("turmas");

        if (professorId) {
        turmasQuery = turmasQuery.where("professorId", "==", professorId);
        } else if (alunoId) {
        turmasQuery = turmasQuery.where("alunos", "array-contains", alunoId);
        }

        try {
            const { professorId } = req.query;
            let turmasQuery = db.collection("turmas");

            if (professorId) {
            turmasQuery = turmasQuery.where("professorId", "==", professorId);
            }

            const snapshot = await turmasQuery.get();
            const turmas = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));

            return res.status(200).json(turmas);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
            return res.status(500).json({ error: "Erro ao buscar turmas" });
        }
    }

    if (method === "POST" && req.url.includes("/criar")) {
      const { nomeTurma, materia, imagem, professorId } = req.body;

      if (!nomeTurma || !materia || !professorId) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }

      const codigo = uuidv4().slice(0, 6).toUpperCase();

      const turmaRef = await db.collection("turmas").add({
        nomeTurma,
        materia,
        imagem,
        codigo,
        professorId, 
        alunos: [],
        criadoEm: new Date(),
      });

      return res.status(201).json({ id: turmaRef.id, codigo });
    }

  
    if (method === "POST" && req.url.includes("/ingressar")) {
      const { codigo, alunoId } = req.body;

      if (!codigo || !alunoId) {
        return res.status(400).json({ error: "Código e alunoId são obrigatórios" });
      }

      const turmaSnap = await db
        .collection("turmas")
        .where("codigo", "==", codigo)
        .get();

      if (turmaSnap.empty) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      const turmaDoc = turmaSnap.docs[0];
      const turmaRef = db.collection("turmas").doc(turmaDoc.id);

      await turmaRef.update({
        alunos: admin.firestore.FieldValue.arrayUnion(alunoId),
      });

      return res.json({
        message: "Aluno adicionado com sucesso",
        turmaId: turmaDoc.id,
      });
    }

   
    return res.status(405).json({ error: "Método não permitido" });

  } catch (error) {
    console.error("Erro na rota de turmas:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

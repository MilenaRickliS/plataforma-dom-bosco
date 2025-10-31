import admin from "../firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}


function handleCors(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}


export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  const { method, url, query, body } = req;

  try {
    if (method === "GET" && (query.id || query.codigo)) {
    let docSnap;

    if (query.id) {
      docSnap = await db.collection("turmas").doc(query.id).get();
    } else if (query.codigo) {
      const snap = await db.collection("turmas").where("codigo", "==", query.codigo).limit(1).get();
      docSnap = snap.empty ? null : snap.docs[0];
    }

    if (!docSnap || !docSnap.exists) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }

    const data = docSnap.data();
    let professorNome = "Professor não identificado";
    let professorFoto = "";

    if (data.professorId) {
      const profDoc = await db.collection("usuarios").doc(data.professorId).get();
      if (profDoc.exists) {
        const profData = profDoc.data();
        professorNome = profData.nome || "Professor não identificado";
        professorFoto = profData.foto || "";
      }
    }

    return res.status(200).json({
      id: docSnap.id,
      nomeTurma: data.nomeTurma || "",
      materia: data.materia || "",
      imagem: data.imagem || "",
      codigo: data.codigo || "",
      professorId: data.professorId || "",
      professorNome,
      professorFoto,
      alunos: data.alunos || [],
      arquivada: data.arquivada || false,
      criadoEm: data.criadoEm || null,
    });
  }


    if (method === "GET" && !url.includes("/alunos")) {
      const { professorId, alunoId, arquivada } = query;
      let turmasRef = db.collection("turmas");
      let turmasSnapshot;

      
      if (professorId) {
        if (arquivada === "true") {
          turmasSnapshot = await turmasRef
            .where("professorId", "==", professorId)
            .where("arquivada", "==", true)
            .get();
        } else if (arquivada === "false") {
          turmasSnapshot = await turmasRef
            .where("professorId", "==", professorId)
            .where("arquivada", "==", false)
            .get();
        } else {
          turmasSnapshot = await turmasRef
            .where("professorId", "==", professorId)
            .get();
        }
      }

     
      else if (alunoId) {
        const snapshot = await turmasRef
          .where("alunos", "array-contains", alunoId)
          .get();

        
        const turmas = [];
        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (arquivada === "true" && !data.arquivada) continue;
          if (arquivada === "false" && data.arquivada) continue;

          let professorNome = "Professor não identificado";
          let professorFoto = "";
          if (data.professorId) {
            const profDoc = await db.collection("usuarios").doc(data.professorId).get();
            if (profDoc.exists) {
              const profData = profDoc.data();
              professorNome = profData.nome || "Professor não identificado";
              professorFoto = profData.foto || "";
            }
          }

          turmas.push({
            id: doc.id,
            ...data,
            professorNome,
            professorFoto,
          });
        }

        return res.status(200).json(turmas);
      }

      
      if (turmasSnapshot) {
        const turmas = [];
        for (const doc of turmasSnapshot.docs) {
          const data = doc.data();
          let professorNome = "Professor não identificado";
          let professorFoto = "";

          if (data.professorId) {
            const profDoc = await db.collection("usuarios").doc(data.professorId).get();
            if (profDoc.exists) {
              const profData = profDoc.data();
              professorNome = profData.nome || "Professor não identificado";
              professorFoto = profData.foto || "";
            }
          }

          turmas.push({
            id: doc.id,
            ...data,
            professorNome,
            professorFoto,
          });
        }
        return res.status(200).json(turmas);
      }

      return res.status(404).json([]);
    }


    
    if (method === "GET" && url.includes("/alunos")) {
      const turmaId = query.turmaId;
      if (!turmaId) {
        return res.status(400).json({ error: "turmaId é obrigatório" });
      }

      const turmaDoc = await db.collection("turmas").doc(turmaId).get();
      if (!turmaDoc.exists) {
        return res.status(404).json({ error: "Turma não encontrada" });
      }

      const { alunos } = turmaDoc.data();
      if (!alunos || alunos.length === 0) {
        return res.status(200).json([]);
      }

      const alunosDetalhes = [];

      for (const alunoId of alunos) {
        let alunoData = null;

       
        const alunoDoc = await db.collection("usuarios").doc(alunoId).get();
        if (alunoDoc.exists) {
          alunoData = alunoDoc.data();
        }

        
        if (!alunoData) {
          const snap = await db.collection("usuarios").where("uid", "==", alunoId).get();
          if (!snap.empty) {
            alunoData = snap.docs[0].data();
          }
        }

        
        if (alunoData) {
          alunosDetalhes.push({
            id: alunoId,
            nome: alunoData.nome || "Sem nome",
            email: alunoData.email || "",
            foto: alunoData.foto || "",
            role: alunoData.role || "",
          });
        }
      }

      return res.status(200).json(alunosDetalhes);
    }

   
    if (method === "POST" && url.includes("/criar")) {
      const { nomeTurma, materia, imagem, professorId, professorNome} = body;

      if (!nomeTurma || !materia || !professorId) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }

      let professorFoto = "";
      const profSnap = await db.collection("usuarios").doc(professorId).get();
      if (profSnap.exists) {
        const dados = profSnap.data();
        professorFoto = dados.foto || ""; 
      }

      const codigo = uuidv4().slice(0, 6).toUpperCase();

      const turmaRef = await db.collection("turmas").add({
        nomeTurma,
        materia,
        imagem: imagem || "",
        codigo,
        professorId,
        professorNome: professorNome || "",
        professorFoto: professorFoto || "",
        alunos: [],
         arquivada: false,
        criadoEm: new Date(),
      });

      return res.status(201).json({ id: turmaRef.id, codigo });
    }

   
    if (method === "PATCH" && (url.includes("/arquivar") || query?.action === "arquivar")) {
      console.log("📦 Arquivando turma:", query.id);
      const { id } = query;
      if (!id) return res.status(400).json({ error: "ID da turma é obrigatório" });

      await db.collection("turmas").doc(id).update({
        arquivada: true,
      });

      return res.status(200).json({ message: "Turma arquivada com sucesso" });
    }

    if (method === "PATCH" && url.includes("/desarquivar")) {
      const { id } = query;
      if (!id) return res.status(400).json({ error: "ID da turma é obrigatório" });

      await db.collection("turmas").doc(id).update({
        arquivada: false,
      });

      return res.status(200).json({ message: "Turma desarquivada com sucesso" });
    }

 
  if (method === "PATCH" && !url.includes("/arquivar") && !url.includes("/desarquivar")) {
    const { id } = query;
    const { nomeTurma, materia, imagem } = body;

    if (!id) return res.status(400).json({ error: "ID da turma é obrigatório" });

   
    if (!nomeTurma?.trim() || !materia?.trim()) {
      return res.status(400).json({ error: "Nome e matéria são obrigatórios" });
    }

    await db.collection("turmas").doc(id).update({
      nomeTurma,
      materia,
      imagem: imagem || "",
    });

    return res.status(200).json({ message: "Turma atualizada com sucesso" });
  }



    
   
  if (method === "DELETE") {
    const { id } = query;
    if (!id) return res.status(400).json({ error: "ID da turma é obrigatório" });

    const turmaRef = db.collection("turmas").doc(id);
    const turmaSnap = await turmaRef.get();

    if (!turmaSnap.exists) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }

    const turmaData = turmaSnap.data();

   
    if (turmaData.alunos && turmaData.alunos.length > 0) {
      return res.status(400).json({
        error: "Não é possível excluir a turma pois há alunos inscritos. Remova-os antes.",
      });
    }

    await turmaRef.delete();
    return res.status(200).json({ message: "Turma excluída com sucesso" });
  }


    
    if (method === "POST" && url.includes("/ingressar")) {
      const { codigo, alunoId } = body;
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

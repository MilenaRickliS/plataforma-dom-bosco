import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  const { method, url, query, body } = req;

  try {
   if (method === "GET" && !url.includes("/detalhes")) {
    const turmasSnap = await db.collection("turmas").get();

    const turmas = [];

    for (const doc of turmasSnap.docs) {
        const turma = doc.data();

        let professorNome = "Desconhecido";
        let professorFoto = "";

        if (turma.professorId) {
        const profDoc = await db.collection("usuarios").doc(turma.professorId).get();

        if (profDoc.exists) {
            const profData = profDoc.data();
            professorNome = profData.nome || "Sem nome";
            professorFoto = profData.foto || "";
        } else {
           
            const profSnap = await db
            .collection("usuarios")
            .where("email", "==", turma.professorId)
            .limit(1)
            .get();

            if (!profSnap.empty) {
            const prof = profSnap.docs[0].data();
            professorNome = prof.nome || "Sem nome";
            professorFoto = prof.foto || "";
            }
        }
        }

        turmas.push({
        id: doc.id,
        nomeTurma: turma.nomeTurma || "Sem nome",
        materia: turma.materia || "",
        professorId: turma.professorId || "",
        professorNome,
        professorFoto,
        alunos: turma.alunos || [],
        imagem: turma.imagem || "",
        });
    }

    return res.status(200).json(turmas);
    }
    if (method === "GET" && url.includes("/detalhes")) {
      const { turmaId } = query;
      if (!turmaId)
        return res.status(400).json({ error: "turmaId é obrigatório" });

      const turmaDoc = await db.collection("turmas").doc(turmaId).get();
      if (!turmaDoc.exists)
        return res.status(404).json({ error: "Turma não encontrada" });

      const turma = turmaDoc.data();

      const atvSnap = await db
        .collection("publicacoes")
        .where("turmaId", "==", turmaId)
        .where("tipo", "==", "atividade")
        .get();

      const avSnap = await db
        .collection("publicacoes")
        .where("turmaId", "==", turmaId)
        .where("tipo", "==", "avaliacao")
        .get();

      const notasManuaisSnap = await db
        .collection("notas_manuais")
        .where("turmaId", "==", turmaId)
        .get();


    
      const alunos = [];
      for (const alunoId of turma.alunos || []) {
        const alunoDoc = await db.collection("usuarios").doc(alunoId).get();
        const alunoData = alunoDoc.exists ? alunoDoc.data() : {};

        const notasTotais = [];

      
        const entregasSnap = await db
          .collection("entregas")
          .where("alunoId", "==", alunoId)
          .where("turmaId", "==", turmaId)
          .get();

        entregasSnap.forEach((d) => {
          const nota = Number(d.data().nota ?? 0);
          if (!isNaN(nota)) notasTotais.push(nota);
        });

        for (const av of avSnap.docs) {
          const respDoc = await db
            .collection("publicacoes")
            .doc(av.id)
            .collection("respostas")
            .doc(alunoId)
            .get();

          if (respDoc.exists) {
            const r = respDoc.data();
            const nota =
              Number(r.melhorNota ?? r.notaTotal ?? r.ultimaNota ?? 0);
            if (!isNaN(nota)) notasTotais.push(nota);
          }
        }

  
        notasManuaisSnap.forEach((n) => {
          const dados = n.data();
          if (dados.alunoId === alunoId && !isNaN(dados.valor)) {
            notasTotais.push(Number(dados.valor));
          }
        });

        const mediaFinal =
          notasTotais.length > 0
            ? notasTotais.reduce((a, b) => a + b, 0) / notasTotais.length
            : null;

        const medalhasSnap = await db
          .collection("medal_awards")
          .where("studentId", "==", alunoId)
          .get();

       
        alunos.push({
          id: alunoId,
          nome: alunoData.nome || "Sem nome",
          foto: alunoData.foto || "",
          pontos: alunoData.pontos || 0,
          medalhas: medalhasSnap.size,
          entregas: entregasSnap.size,
          mediaFinal: mediaFinal ? Number(mediaFinal.toFixed(2)) : null,
        });
      }

        let professorNome = "Desconhecido";
        let professorFoto = "";
        let profData = null;
if (turma.professorId) {
  console.log("🔍 Buscando professor para turma:", turma.nomeTurma);
  console.log("📎 professorId recebido:", turma.professorId);

  let profData = null;

  
  const profDoc = await db.collection("usuarios").doc(turma.professorId).get();
  if (profDoc.exists) {
    profData = profDoc.data();
    console.log("✅ Professor encontrado por UID:", profData.nome);
  } else {
    console.log("⚠️ Nenhum professor encontrado por UID. Tentando por e-mail...");

 
    const profEmailSnap = await db
      .collection("usuarios")
      .where("email", "==", turma.professorId)
      .limit(1)
      .get();

    if (!profEmailSnap.empty) {
      profData = profEmailSnap.docs[0].data();
      console.log("✅ Professor encontrado por e-mail:", profData.nome);
    } else {
      console.log("⚠️ Nenhum professor encontrado por e-mail. Tentando por nome...");

     
      const profNomeSnap = await db
        .collection("usuarios")
        .where("nome", "==", turma.professorId)
        .limit(1)
        .get();

      if (!profNomeSnap.empty) {
        profData = profNomeSnap.docs[0].data();
        console.log("✅ Professor encontrado por nome:", profData.nome);
      } else {
        console.log("❌ Nenhum professor encontrado por nome também.");
      }
    }
  }

  
  if (profData) {
    professorNome = profData.nome || "Sem nome";
    professorFoto = profData.foto || "";
  } else {
    console.log("⚠️ Nenhum dado válido do professor encontrado. Usando 'Desconhecido'.");
  }
} else {
  console.log("⚠️ Turma sem professorId definido:", turma.nomeTurma);
}


        return res.status(200).json({
        id: turmaId,
        nomeTurma: turma.nomeTurma,
        materia: turma.materia || "",
        professorId: turma.professorId || "",
        professorNome,
        professorFoto,
        totalAtividades: atvSnap.size,
        totalAvaliacoes: avSnap.size,
        alunos,
        });
        

    }

    if (method === "PATCH" && url.includes("/removerAluno")) {
      const { turmaId, alunoId } = body;
      if (!turmaId || !alunoId)
        return res
          .status(400)
          .json({ error: "turmaId e alunoId são obrigatórios" });

      await db
        .collection("turmas")
        .doc(turmaId)
        .update({
          alunos: admin.firestore.FieldValue.arrayRemove(alunoId),
        });
      return res
        .status(200)
        .json({ ok: true, message: "Aluno removido com sucesso" });
    }

    if (method === "POST" && url.includes("/moverAluno")) {
      const { origemId, destinoId, alunoId } = body;
      if (!origemId || !destinoId || !alunoId)
        return res.status(400).json({
          error: "origemId, destinoId e alunoId são obrigatórios",
        });

      const origemRef = db.collection("turmas").doc(origemId);
      const destinoRef = db.collection("turmas").doc(destinoId);

      await origemRef.update({
        alunos: admin.firestore.FieldValue.arrayRemove(alunoId),
      });
      await destinoRef.update({
        alunos: admin.firestore.FieldValue.arrayUnion(alunoId),
      });

      return res
        .status(200)
        .json({ ok: true, message: "Aluno movido com sucesso" });
    }

     if (method === "POST" && url.includes("/adicionarAluno")) {
      const { turmaId, alunoIdentificador } = body; 
      if (!turmaId || !alunoIdentificador)
        return res.status(400).json({ error: "turmaId e alunoIdentificador são obrigatórios" });

      
      let alunoDoc = await db.collection("usuarios").doc(alunoIdentificador).get();
      if (!alunoDoc.exists) {
        const snapEmail = await db
          .collection("usuarios")
          .where("email", "==", alunoIdentificador)
          .limit(1)
          .get();

        if (!snapEmail.empty) alunoDoc = snapEmail.docs[0];
        else {
          const snapNome = await db
            .collection("usuarios")
            .where("nome", "==", alunoIdentificador)
            .limit(1)
            .get();

          if (!snapNome.empty) alunoDoc = snapNome.docs[0];
        }
      }

      if (!alunoDoc.exists) {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }

      const alunoData = alunoDoc.data();

      await db.collection("turmas").doc(turmaId).update({
        alunos: admin.firestore.FieldValue.arrayUnion(alunoDoc.id),
      });

      return res.status(200).json({
        ok: true,
        message: `Aluno ${alunoData.nome} adicionado à turma com sucesso!`,
        aluno: {
          id: alunoDoc.id,
          nome: alunoData.nome,
          email: alunoData.email,
          foto: alunoData.foto || "",
        },
      });
    }

    if (method === "PATCH" && url.includes("/alterarProfessor")) {
      const { turmaId, novoProfessorIdentificador } = body;
      if (!turmaId || !novoProfessorIdentificador)
        return res.status(400).json({
          error: "turmaId e novoProfessorIdentificador são obrigatórios",
        });

      
      let profDoc = await db.collection("usuarios").doc(novoProfessorIdentificador).get();

      if (!profDoc.exists) {
        const emailSnap = await db
          .collection("usuarios")
          .where("email", "==", novoProfessorIdentificador)
          .limit(1)
          .get();

        if (!emailSnap.empty) profDoc = emailSnap.docs[0];
        else {
          const nomeSnap = await db
            .collection("usuarios")
            .where("nome", "==", novoProfessorIdentificador)
            .limit(1)
            .get();

          if (!nomeSnap.empty) profDoc = nomeSnap.docs[0];
        }
      }

      if (!profDoc.exists)
        return res.status(404).json({ error: "Novo professor não encontrado" });

      const prof = profDoc.data();

      await db.collection("turmas").doc(turmaId).update({
        professorId: profDoc.id,
        professorNome: prof.nome || "",
        professorFoto: prof.foto || "",
      });

      return res
        .status(200)
        .json({ ok: true, message: `Professor ${prof.nome} atualizado com sucesso!` });
    }

    return res.status(405).json({ error: "Rota não encontrada" });
  } catch (e) {
    console.error("❌ Erro em /api/gestao-turmas:", e);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor", detalhe: e.message });
  }
}

import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  const { method, url, query, body } = req;

  try {
    
    if (method === "GET") {
      const { alunoId, professorId } = query;
      let avisosRef = db.collection("avisos");
      const avisos = [];

      
      if (professorId) {
        const snapshot = await avisosRef
          .where("criadorId", "==", professorId)
          .orderBy("criadoEm", "desc")
          .get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          const leitores = data.leitores || [];
          avisos.push({
            id: doc.id,
            ...data,
            totalLeitores: leitores.length, 
          });
        });
      }

     
      else if (alunoId) {
        const turmasSnap = await db
          .collection("turmas")
          .where("alunos", "array-contains", alunoId)
          .get();

        const turmasIds = turmasSnap.docs.map((t) => t.id);

        const snapshot = await avisosRef.orderBy("criadoEm", "desc").get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.turmasIds?.some((id) => turmasIds.includes(id))) {
            const lido = data.leitores?.includes(alunoId);
            avisos.push({ id: doc.id, ...data, lido });
          }
        });
      }

      
      else {
        const snapshot = await avisosRef.orderBy("criadoEm", "desc").get();
        snapshot.forEach((doc) => avisos.push({ id: doc.id, ...doc.data() }));
      }

      return res.status(200).json(avisos);
    }

    
    if (method === "POST" && url.includes("/criar")) {
      const { titulo, descricao, responsavel, turmasIds, turmasNomes, criadorId } = body;
      if (!titulo || !descricao || !responsavel || !criadorId || !turmasIds?.length) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }

      const novoAviso = {
        titulo,
        descricao,
        responsavel,
        turmasIds,
        turmasNomes,
        criadorId,
        criadoEm: new Date(),
        leitores: [], 
      };

      const ref = await db.collection("avisos").add(novoAviso);
      return res.status(201).json({ id: ref.id, ...novoAviso });
    }

   
    if (method === "PUT" && url.includes("/editar")) {
      const { id, titulo, descricao, responsavel, turmasIds, turmasNomes } = body;
      if (!id) return res.status(400).json({ error: "ID do aviso é obrigatório." });

      await db.collection("avisos").doc(id).update({
        titulo,
        descricao,
        responsavel,
        turmasIds,
        turmasNomes,
      });

      return res.status(200).json({ message: "Aviso atualizado com sucesso" });
    }

    
    if (method === "PUT" && url.includes("/marcar-lido")) {
        const { avisoId, alunoId, remover } = body;
        if (!avisoId || !alunoId)
            return res.status(400).json({ error: "Dados inválidos." });

        const avisoRef = db.collection("avisos").doc(avisoId);

        if (remover) {
            
            await avisoRef.update({
            leitores: admin.firestore.FieldValue.arrayRemove(alunoId),
            });
        } else {
            
            await avisoRef.update({
            leitores: admin.firestore.FieldValue.arrayUnion(alunoId),
            });
        }

        return res.status(200).json({ message: "Leitura atualizada." });
        }


    
    if (method === "DELETE" && query.id) {
      await db.collection("avisos").doc(query.id).delete();
      return res.status(200).json({ message: "Aviso excluído com sucesso" });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("Erro na rota de avisos:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

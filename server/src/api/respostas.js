import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  try {
   
    if (req.method === "POST") {
      const { avaliacaoId, alunoId, questoes, notaTotal, iniciouEm, avaliacaoIniciada } = req.body;
      if (!avaliacaoId || !alunoId) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes." });
      }

      const respostaRef = db.collection("publicacoes").doc(avaliacaoId).collection("respostas").doc(alunoId);
      const snap = await respostaRef.get();
      const atual = snap.exists ? snap.data() : {};
      const tentativas = atual.tentativas || 0;

      const pubSnap = await db.collection("publicacoes").doc(avaliacaoId).get();
      const pub = pubSnap.data() || {};
      const maxTentativas = pub.configuracoes?.tentativasMax || 1;

   
      if (avaliacaoIniciada && !questoes) {
        if (tentativas >= maxTentativas) {
          return res.status(403).json({ error: "Limite de tentativas atingido." });
        }

        await respostaRef.set(
          {
            avaliacaoIniciada: true,
            iniciouEm: admin.firestore.Timestamp.fromDate(new Date(iniciouEm)),
            tentativas,
          },
          { merge: true }
        );
        return res.status(200).json({ ok: true, message: "Início registrado." });
      }

    
      if (questoes) {
        if (tentativas >= maxTentativas) {
          return res.status(403).json({ error: "Limite de tentativas atingido." });
        }

        const nota = notaTotal || 0;
        const tentativaAtual = tentativas + 1;

        await respostaRef.set(
          {
            avaliacaoIniciada: false,
            entregue: true,
            notaTotal: nota,
            tentativas: tentativaAtual,
            melhorNota: Math.max(atual.melhorNota || 0, nota),
            ultimaNota: nota,
            enviadaEm: admin.firestore.Timestamp.now(),
          },
          { merge: true }
        );

        const tentRef = await respostaRef.collection("tentativas").add({
          numero: tentativaAtual,
          notaTotal: nota,
          enviadaEm: admin.firestore.Timestamp.now(),
          questoes,
        });

        for (const q of questoes) {
          await respostaRef.collection("questoes").doc(q.questaoId).set({
            resposta: q.resposta,
            valorObtido: q.valorObtido || 0,
          });
        }

        return res.status(201).json({
          ok: true,
          message: "Respostas enviadas com sucesso!",
          tentativaId: tentRef.id,
          melhorNota: Math.max(atual.melhorNota || 0, nota),
        });
      }

      return res.status(400).json({ error: "Requisição inválida." });
    }

   
    if (req.method === "PATCH") {
      const { avaliacaoId, alunoId, questoes, notaTotal } = req.body;
      if (!avaliacaoId || !alunoId) {
        return res.status(400).json({ error: "Campos obrigatórios" });
      }

      const respostaRef = db.collection("publicacoes").doc(avaliacaoId).collection("respostas").doc(alunoId);
      const snap = await respostaRef.get();
      const atual = snap.exists ? snap.data() : {};
      await respostaRef.set(
        {
          corrigido: true,
          notaTotal,
          ultimaCorrecao: admin.firestore.Timestamp.now(),
          melhorNota: Math.max(atual.melhorNota || 0, notaTotal),
          ultimaNota: notaTotal,
        },
        { merge: true }
      );

      for (const q of questoes) {
        await respostaRef.collection("questoes").doc(q.id).set(
          {
            valorObtido: q.valorObtido || 0,
          },
          { merge: true }
        );
      }

      return res.status(200).json({ ok: true, message: "Correção salva com sucesso." });
    }

 
    if (req.method === "GET") {
      const { avaliacaoId } = req.query;
      if (!avaliacaoId)
        return res.status(400).json({ error: "avaliacaoId é obrigatório." });

      const snap = await db.collection("publicacoes").doc(avaliacaoId).collection("respostas").get();
      const alunos = [];

      for (const doc of snap.docs) {
        const data = doc.data();

       
        const tentativasSnap = await doc.ref.collection("tentativas").orderBy("numero", "asc").get();
        const tentativas = tentativasSnap.docs.map((t) => ({
          id: t.id,
          ...t.data(),
        }));

     
        const questoesSnap = await doc.ref.collection("questoes").get();
        const questoes = questoesSnap.docs.map((q) => ({
          id: q.id,
          ...q.data(),
        }));

        const melhorNota =
          tentativas.length > 0
            ? Math.max(...tentativas.map((t) => t.notaTotal || 0))
            : data.melhorNota || data.notaTotal || 0;

        alunos.push({
          alunoId: doc.id,
          ...data,
          tentativas,
          questoes,
          total: melhorNota,
          meta: { tentativas: data.tentativas || tentativas.length || 1 },
        });
      }

      return res.status(200).json({ alunos });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (e) {
    console.error("Erro API /respostas:", e);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

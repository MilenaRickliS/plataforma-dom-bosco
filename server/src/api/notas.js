import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { turmaId } = req.query;
      if (!turmaId)
        return res.status(400).json({ error: "turmaId é obrigatório." });

      const notas = [];

     
      const atividadesSnap = await db
        .collection("publicacoes")
        .where("tipo", "==", "atividade")
        .where("turmaId", "==", turmaId)
        .get();

      for (const atv of atividadesSnap.docs) {
        const atividade = { id: atv.id, ...atv.data() };

        const entregasSnap = await db
          .collection("entregas")
          .where("atividadeId", "==", atv.id)
          .get();

        entregasSnap.forEach((ent) => {
          const entrega = ent.data();
          if (typeof entrega.nota !== "undefined") {
            notas.push({
              turmaId,
              alunoId: entrega.alunoId,
              tipo: "atividade",
              itemId: atv.id,
              valor: entrega.nota,
              titulo: atividade.titulo || "Atividade",
              criadaEm: entrega.atualizadaEm || atividade.criadaEm,
            });
          }
        });
      }

     
        
        let turmaCodigo = null;
        try {
        const turmaSnap = await db.collection("turmas").doc(turmaId).get();
        if (turmaSnap.exists) {
            turmaCodigo = turmaSnap.data().codigo || null;
        }
        } catch (e) {
        console.warn("⚠️ Não foi possível buscar o código da turma:", e.message);
        }

        
        const avaliacoesSnap = await db
        .collection("publicacoes")
        .where("tipo", "==", "avaliacao")
        .get();

        for (const av of avaliacoesSnap.docs) {
        const avaliacao = { id: av.id, ...av.data() };

       const turmaMatch = [
        avaliacao.turmaCodigo,
        avaliacao.turmaId,
        avaliacao.turma
        ].some(
        (campo) => campo && String(campo).trim() === String(turmaCodigo || turmaId).trim()
        );


        if (!turmaMatch) continue;

        const respostasSnap = await db
            .collection("publicacoes")
            .doc(av.id)
            .collection("respostas")
            .get();

        respostasSnap.forEach((resp) => {
            const r = resp.data();
            const valor = r.melhorNota ?? r.notaTotal ?? r.ultimaNota ?? 0;

            notas.push({
            turmaId,
            alunoId: r.alunoId || resp.id,
            tipo: "avaliacao",
            itemId: av.id,
            valor,
            titulo: avaliacao.titulo || "Avaliação",
            criadaEm: r.enviadaEm || avaliacao.criadaEm,
            });
        });
        }

        
        const notasManuaisSnap = await db
        .collection("notas_manuais")
        .where("turmaId", "==", turmaId)
        .get();

        notasManuaisSnap.forEach((n) => {
        notas.push({ id: n.id, ...n.data(), tipo: n.data().tipo || "extra" });
        });

       
        notas.sort((a, b) => new Date(a.criadaEm) - new Date(b.criadaEm));



      return res.status(200).json(notas);
    }

    
    if (req.method === "POST") {
      const { turmaId, alunoId, tipo, itemId, valor } = req.body;
      if (!turmaId || !alunoId || !tipo || !itemId)
        return res.status(400).json({ error: "Campos obrigatórios ausentes." });

      await db.collection("notas_manuais").add({
        turmaId,
        alunoId,
        tipo,
        itemId,
        valor,
        criadaEm: new Date().toISOString(),
      });

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (err) {
    console.error("❌ Erro em /api/notas:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao consolidar notas.", detalhe: err.message });
  }
}

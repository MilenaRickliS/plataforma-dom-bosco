import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    if (method === "GET") {
      const { atividadeId, alunoId } = query;
      if (!atividadeId) {
        return res.status(400).json({ error: "atividadeId é obrigatório" });
      }

      let q = db.collection("entregas").where("atividadeId", "==", atividadeId);

      if (alunoId) {
        q = q.where("alunoId", "==", alunoId);
      }

      const snap = await q.get();
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

     
      return res.status(200).json(docs);
    }

    if (method === "POST") {
      const {
        atividadeId,
        alunoId,
        anexos = [],
        enviadaEm,
        entregue,
        nota,
        avaliacaoIniciada,
        questoesRespondidas
      } = body;

      if (!atividadeId || !alunoId) {
        return res.status(400).json({ error: "atividadeId e alunoId são obrigatórios" });
      }

    
      const q = await db
        .collection("entregas")
        .where("atividadeId", "==", atividadeId)
        .where("alunoId", "==", alunoId)
        .limit(1)
        .get();

      const payload = {
        atividadeId,
        alunoId,
        anexos,
     
        enviadaEm: enviadaEm ? new Date(enviadaEm) : admin.firestore.FieldValue.serverTimestamp(),
      };

      if (typeof entregue === "boolean") payload.entregue = entregue;
      if (typeof nota !== "undefined") payload.nota = Number(nota);
      if (typeof avaliacaoIniciada !== "undefined") payload.avaliacaoIniciada = !!avaliacaoIniciada;
      if (Array.isArray(questoesRespondidas)) payload.questoesRespondidas = questoesRespondidas;

      if (!q.empty) {
        const docRef = q.docs[0].ref;
       
        const atual = q.docs[0].data();

        const anexosAtuais = Array.isArray(atual.anexos) ? atual.anexos : [];
        const anexosNovos = Array.isArray(anexos) ? anexos : [];
        const anexosMesclados = [...anexosAtuais];

        anexosNovos.forEach((a) => {
          const dup = anexosAtuais.some((b) => (b.url && b.url === a.url) || (b.nome && b.nome === a.nome));
          if (!dup) anexosMesclados.push(a);
        });

        await docRef.set(
          {
            ...payload,
            anexos: anexosMesclados,
            atualizadaEm: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const novoSnap = await docRef.get();
        return res.status(200).json({ ok: true, id: docRef.id, data: novoSnap.data() });
      } else {
        const ref = await db.collection("entregas").add({
          ...payload,
          atualizadaEm: admin.firestore.FieldValue.serverTimestamp(),
        });
        const novoSnap = await ref.get();
        return res.status(201).json({ ok: true, id: ref.id, data: novoSnap.data() });
      }
    }

    if (method === "PATCH") {
      const { id } = query;
      if (!id) return res.status(400).json({ error: "id é obrigatório" });

      const updates = { atualizadaEm: admin.firestore.FieldValue.serverTimestamp() };

      
      [
        "nota",
        "entregue",
        "anexos",
        "enviadaEm",
        "avaliacaoIniciada",
        "questoesRespondidas",
      ].forEach((k) => {
        if (typeof body[k] !== "undefined") {
          if (k === "nota") updates[k] = Number(body[k]);
          else if (k === "enviadaEm") updates[k] = new Date(body[k]);
          else updates[k] = body[k];
        }
      });

      await db.collection("entregas").doc(id).set(updates, { merge: true });
      const doc = await db.collection("entregas").doc(id).get();
      return res.status(200).json({ ok: true, id, data: doc.data() });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("Erro em /api/entregas:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

import admin from "../firebaseAdmin.js";
const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });
    const { avaliacaoId } = req.query;
    if (!avaliacaoId) return res.status(400).json({ error: "avaliacaoId é obrigatório" });

    const respostasSnap = await db
      .collection("publicacoes")
      .doc(avaliacaoId)
      .collection("respostas")
      .get();

    const alunos = [];
    for (const doc of respostasSnap.docs) {
      const alunoId = doc.id;
      const meta = doc.data() || {};
      const qsSnap = await db
        .collection("publicacoes")
        .doc(avaliacaoId)
        .collection("respostas")
        .doc(alunoId)
        .collection("questoes")
        .get();

      let total = 0;
      const questoes = [];
      qsSnap.forEach(qd => {
        const qdData = qd.data();
        total += Number(qdData?.valor || 0);
        questoes.push({ id: qd.id, ...qdData });
      });

      alunos.push({
        alunoId,
        meta,
        total,
        questoes,
      });
    }

    return res.status(200).json({ alunos });
  } catch (e) {
    console.error("Erro em /avaliacoes/respostas:", e);
    res.status(500).json({ error: e.message });
  }
}

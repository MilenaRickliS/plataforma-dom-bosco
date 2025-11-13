import admin from "../firebaseAdmin.js";
const db = admin.firestore();


async function atualizarPontos(userId, delta, motivo = "") {
  console.log("⚙️  atualizarPontos chamado:", { userId, delta, motivo });

  const ref = db.collection("usuarios").doc(userId);
  const logRef = db.collection("gamificacao_logs").doc();

  return await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const dados = doc.exists ? doc.data() : {};

    console.log("📄 Dados atuais do usuário:", dados);

    const pontosAtuais = dados.pontos || 0;
    const nome = dados.nome || "Sem nome";
    const email = dados.email || "Sem email";
    const role = dados.role || "desconhecido";

    const novosPontos = Math.max(0, pontosAtuais + Number(delta));

    console.log("💾 Novo total de pontos calculado:", novosPontos);

    t.set(ref, { pontos: novosPontos }, { merge: true });

    t.set(logRef, {
      userId,
      nome,
      email,
      role,
      tipo: delta > 0 ? "ganho" : "perda",
      valor: Math.abs(delta),
      motivo,
      pontosTotais: novosPontos,
      data: admin.firestore.FieldValue.serverTimestamp(),
    });

    return novosPontos;
  });
}


export default async function handler(req, res) {
  const { method } = req;

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        console.warn("⚠️ Corpo enviado não é JSON válido");
      }
    }

   
    if (method === "POST" && req.url.includes("/add")) {
      console.log("📥 Recebido POST /add:", body);
      const { userId, valor, motivo } = body || {};
      if (!userId || valor === undefined)
        return res.status(400).json({ error: "userId e valor são obrigatórios" });

      const total = await atualizarPontos(userId, Number(valor), motivo || "Adição de pontos");
      console.log("✅ Pontos adicionados com sucesso:", { userId, total });
      return res.status(200).json({ success: true, total });
    }

    if (method === "POST" && req.url.includes("/remove")) {
      console.log("📥 Recebido POST /remove:", body);
      const { userId, valor, motivo } = body || {};
      if (!userId || valor === undefined)
        return res.status(400).json({ error: "userId e valor são obrigatórios" });

      const total = await atualizarPontos(userId, -Math.abs(Number(valor)), motivo || "Remoção de pontos");
      console.log("✅ Pontos removidos com sucesso:", { userId, total });
      return res.status(200).json({ success: true, total });
    }

  
    if (method === "GET") {
      const userId = req.query.userId || req.url.split("/").pop();
      if (!userId) return res.status(400).json({ error: "userId obrigatório" });

      console.log("🔎 Consultando pontos do usuário:", userId);
      const doc = await db.collection("usuarios").doc(userId).get();
      const pontos = doc.exists ? doc.data().pontos || 0 : 0;
      console.log("📊 Pontos retornados:", pontos);

      return res.status(200).json({ pontos });
    }

    if (method === "POST" && req.url.includes("/salvar")) {
      const { userId, pontos } = body || {};
      if (!userId || pontos === undefined)
        return res.status(400).json({ error: "userId e pontos são obrigatórios" });

      console.log("🛠️ Salvando pontos manualmente:", { userId, pontos });

      const ref = db.collection("usuarios").doc(userId);
      const doc = await ref.get();
      const dados = doc.exists ? doc.data() : {};

      await ref.set({ pontos }, { merge: true });

      await db.collection("gamificacao_logs").add({
        userId,
        nome: dados.nome || "Desconhecido",
        email: dados.email || "Sem email",
        role: dados.role || "desconhecido",
        tipo: "ajuste",
        valor: pontos,
        motivo: "Ajuste manual no painel",
        pontosTotais: pontos,
        data: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ success: true });
    }

   
    if (method === "POST" && req.url.includes("/zerar")) {
      console.log("🧹 Zerando gamificação...");
      const usuariosSnap = await db.collection("usuarios").get();
      const batch = db.batch();

      usuariosSnap.forEach((doc) => {
        batch.update(doc.ref, { pontos: 0 });
      });
      await batch.commit();

      const logsSnap = await db.collection("gamificacao_logs").get();
      const batch2 = db.batch();
      logsSnap.forEach((doc) => batch2.delete(doc.ref));
      await batch2.commit();

      console.log("✅ Gamificação zerada com sucesso");
      return res.status(200).json({ success: true, message: "Gamificação zerada" });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("❌ Erro na rota gamificação:", err);
    return res.status(500).json({ error: err.message });
  }
}

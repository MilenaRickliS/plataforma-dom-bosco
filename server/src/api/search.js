import admin from "../firebaseAdmin.js";
import removeAccents from "remove-accents";

const db = admin.firestore();

export default async function handler(req, res) {
  console.log("=== 🧭 INICIANDO BUSCA GLOBAL ===");
  console.log("Método:", req.method);
  console.log("Query recebida:", req.query);

  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "GET") {
      console.log("❌ Método não permitido");
      return res.status(405).json({ error: "Método não permitido" });
    }

    const q = removeAccents(req.query.q?.toLowerCase() || "");
    const usuarioId = req.query.usuarioId;
    console.log("🔍 Termo de busca:", q);
    console.log("👤 Usuário ID:", usuarioId);

    if (!usuarioId || !q) {
      console.log("⚠️ Parâmetros insuficientes");
      return res.json({ results: [] });
    }

    const results = [];

    const userSnap = await db.collection("usuarios").doc(usuarioId).get();
    const userData = userSnap.exists ? userSnap.data() : {};
    const role = userData.role || "aluno";
    console.log("🎭 Papel do usuário:", role);

    if (role === "professor") {
      console.log("--- 🔹 BUSCA PARA PROFESSOR ---");

    const avisosSnap = await db.collection("avisos").where("criadorId", "==", usuarioId).get();
    console.log("Avisos encontrados:", avisosSnap.size);
    avisosSnap.forEach((doc) => {
    const data = doc.data();
    const titulo = removeAccents(data.titulo?.toLowerCase() || "");
    if (titulo.includes(q))
        results.push({
        id: doc.id,
        tipo: "avisos",
        titulo: data.titulo || "(Sem título)",
        ...data,
        });
    });


    const pubsSnap = await db.collection("publicacoes").get();
    console.log("Publicações totais:", pubsSnap.size);
    pubsSnap.forEach((doc) => {
    const data = doc.data();
    const texto = removeAccents(
        `${data.titulo || ""} ${data.descricao || ""} ${data.tipo || ""}`.toLowerCase()
    );

    if (texto.includes(q)) {
        results.push({
        id: doc.id,
        tipo: "atividades",             
        subtipo: data.tipo || "atividade",
        titulo: data.titulo || "(Sem título)",
        ...data,
        });
    }
    });


      const tarefasSnap = await db.collection("tarefas").where("usuarioId", "==", usuarioId).get();
      console.log("Tarefas encontradas:", tarefasSnap.size);
      tarefasSnap.forEach((doc) => {
        const data = doc.data();
        if (removeAccents(data.nome?.toLowerCase() || "").includes(q))
          results.push({ id: doc.id, tipo: "tarefas", ...data });
      });

     
      const turmasSnap = await db.collection("turmas").where("professorId", "==", usuarioId).get();
      console.log("Turmas encontradas:", turmasSnap.size);
      turmasSnap.forEach((doc) => {
        const data = doc.data();
        if (removeAccents(data.nomeTurma?.toLowerCase() || "").includes(q))
          results.push({ id: doc.id, tipo: "turmas", ...data });
      });

      
      const alunosSnap = await db.collection("usuarios").where("role", "==", "aluno").get();
      console.log("Alunos encontrados:", alunosSnap.size);
      alunosSnap.forEach((doc) => {
        const data = doc.data();
        if (removeAccents(data.nome?.toLowerCase() || "").includes(q))
          results.push({ id: doc.id, tipo: "usuarios", ...data });
      });
    }

   
    if (role === "aluno") {
      console.log("--- 🔹 BUSCA PARA ALUNO ---");

      const turmasSnap = await db
        .collection("turmas")
        .where("alunos", "array-contains", usuarioId)
        .get();
      console.log("Turmas do aluno:", turmasSnap.size);

      const turmasIds = turmasSnap.docs.map((t) => t.id);
      turmasSnap.forEach((doc) => {
        const data = doc.data();
        if (removeAccents(data.nomeTurma?.toLowerCase() || "").includes(q))
          results.push({ id: doc.id, tipo: "turmas", ...data });
      });

      const avisosSnap = await db.collection("avisos").get();
        console.log("Avisos totais:", avisosSnap.size);

        avisosSnap.forEach((doc) => {
        const data = doc.data();
        const titulo = removeAccents(data.titulo?.toLowerCase() || "");

        const pertenceTurma = turmasIds.length === 0
            ? true
            : data.turmasIds?.some((id) => turmasIds.includes(id));

        if (pertenceTurma && titulo.includes(q)) {
            results.push({
            id: doc.id,
            tipo: "avisos",
            titulo: data.titulo || "(Sem título)",
            ...data,
            });
        }
        });


      
    const pubsSnap = await db.collection("publicacoes").get();
    console.log("Publicações totais:", pubsSnap.size);
    pubsSnap.forEach((doc) => {
    const data = doc.data();
    const texto = removeAccents(
        `${data.titulo || ""} ${data.descricao || ""} ${data.tipo || ""}`.toLowerCase()
    );

    if (texto.includes(q)) {
        results.push({
        id: doc.id,
        tipo: "atividades",             
        subtipo: data.tipo || "atividade", 
        titulo: data.titulo || "(Sem título)",
        ...data,
        });
    }
    });

      const tarefasSnap = await db.collection("tarefas").where("usuarioId", "==", usuarioId).get();
      console.log("Tarefas pessoais:", tarefasSnap.size);
      tarefasSnap.forEach((doc) => {
        const data = doc.data();
        if (removeAccents(data.nome?.toLowerCase() || "").includes(q))
          results.push({ id: doc.id, tipo: "tarefas", ...data });
      });
    }

   
    console.log("--- 🌍 ITENS PÚBLICOS ---");
    const videosSnap = await db.collection("videos").get();
    console.log("Vídeos totais:", videosSnap.size);
    videosSnap.forEach((doc) => {
      const data = doc.data();
      if (removeAccents(data.titulo?.toLowerCase() || "").includes(q))
        results.push({ id: doc.id, tipo: "videos", ...data });
    });

    const categoriasSnap = await db.collection("categorias_videos").get();
    console.log("Categorias totais:", categoriasSnap.size);
    categoriasSnap.forEach((doc) => {
      const data = doc.data();
      if (removeAccents(data.nome?.toLowerCase() || "").includes(q))
        results.push({ id: doc.id, tipo: "categorias_videos", ...data });
    });

    console.log("🧾 Total bruto de resultados:", results.length);

    const prioridade = {
      atividades: 6,
      turmas: 5,
      videos: 4,
      tarefas: 3,
      avisos: 2,
      usuarios: 1,
      categorias_videos: 0,
    };

    results.sort((a, b) => {
      const pa = prioridade[a.tipo] || 0;
      const pb = prioridade[b.tipo] || 0;
      if (pa !== pb) return pb - pa;
      return (a.titulo || a.nome || "").localeCompare(b.titulo || b.nome || "");
    });

    const limit = Number(req.query.limit) || 50;
    const limitedResults = results.slice(0, limit);

    console.log("✅ Retornando resultados:", limitedResults.length);
    console.table(limitedResults.map(r => ({ tipo: r.tipo, id: r.id, titulo: r.titulo || r.nome })));

    console.log("=== ✅ FIM DA BUSCA GLOBAL ===");
    return res.status(200).json({ results: limitedResults });
  } catch (err) {
    console.error("❌ ERRO NA BUSCA GLOBAL:", err);
    return res.status(500).json({ error: err.message });
  }
}

import { db } from "../firebaseAdmin.js";

export default async function handler(req, res) {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

 
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
   
    if (req.method === "GET") {
      const { usuarioId, ano, mes } = req.query;

      if (!usuarioId || ano === undefined || mes === undefined) {
        return res.status(400).json({ error: "Parâmetros inválidos." });
      }

      const snapshot = await db
        .collection("tarefas")
        .where("usuarioId", "==", usuarioId)
        .where("ano", "==", parseInt(ano))
        .where("mes", "==", parseInt(mes))
        .get();

      const data = {};
      snapshot.forEach((doc) => {
        const t = doc.data();
        const chave = `${t.ano}-${t.mes}-${t.dia}`;
        if (!data[chave]) data[chave] = [];
        data[chave].push({ id: doc.id, ...t });
      });

      return res.status(200).json(data);
    }

    
    if (req.method === "POST") {
      const tarefa = { ...req.body, criadaEm: new Date().toISOString() };
      const docRef = await db.collection("tarefas").add(tarefa);
      return res.status(201).json({ id: docRef.id, ...tarefa });
    }

    
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID da tarefa não informado." });

      await db.collection("tarefas").doc(id).update(req.body);
      return res.status(200).json({ success: true });
    }

    
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID da tarefa não informado." });

      await db.collection("tarefas").doc(id).delete();
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (err) {
    console.error("❌ Erro na rota /tarefas:", err);
    return res.status(500).json({ error: err.message });
  }
}

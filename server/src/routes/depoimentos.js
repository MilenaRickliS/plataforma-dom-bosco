import express from "express";
import admin from "../../src/firebaseAdmin.js";

const router = express.Router();
const db = admin.firestore();


router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("depoimentos").orderBy("criadoEm", "desc").get();
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(lista);
    res.json(lista);
  } catch (err) {
    console.error("Erro ao buscar depoimentos:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { nome, telefone, empresa, mensagem } = req.body;
    if (!nome || !mensagem) {
      return res.status(400).json({ error: "Nome e mensagem são obrigatórios" });
    }

    const docRef = await db.collection("depoimentos").add({
      nome,
      telefone,
      empresa,
      mensagem,
      criadoEm: new Date(),
    });

    res.json({ id: docRef.id, nome, telefone, empresa, mensagem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

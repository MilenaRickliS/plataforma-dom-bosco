import express from "express";
import multer from "multer";
import fs from "fs";
import cloudinary from "../cloudinary.js";
import admin from "../firebaseAdmin.js";

const router = express.Router();
const db = admin.firestore();
const upload = multer({ dest: "uploads/" }); 


router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("galeria").get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(data);
  } catch (err) {
    console.error("Erro ao listar galeria:", err);
    res.status(500).json({ error: "Erro ao listar galeria" });
  }
});


router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });

    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "galeria_dom_bosco",
    });

   
    fs.unlinkSync(req.file.path);

    
    const docRef = await db.collection("galeria").add({
      title,
      imageUrl: result.secure_url,
      publicId: result.public_id, 
      createdAt: new Date().toISOString(),
    });

    res.json({ id: docRef.id, title, imageUrl: result.secure_url });
  } catch (err) {
    console.error("Erro ao enviar imagem:", err);
    res.status(500).json({ error: "Erro ao enviar imagem" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    await db.collection("galeria").doc(req.params.id).update({ title });
    res.json({ message: "Título atualizado" });
  } catch (err) {
    console.error("Erro ao editar:", err);
    res.status(500).json({ error: "Erro ao editar imagem" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const docRef = db.collection("galeria").doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Imagem não encontrada" });
    }

    const { publicId } = doc.data();

    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    
    await docRef.delete();

    res.json({ message: "Imagem excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir:", err);
    res.status(500).json({ error: "Erro ao excluir imagem" });
  }
});

export default router;

import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import admin from "../firebaseAdmin.js"; 

dotenv.config();

const router = express.Router();
const db = admin.firestore();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("equipe").get();
    const equipe = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(equipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/", upload.single("foto"), async (req, res) => {
  try {
    const { nome, cargo } = req.body;
    let fotoUrl = "";

    if (req.file) {
      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "equipe_dom_bosco" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      fotoUrl = uploadRes.secure_url;
    }

    const docRef = await db.collection("equipe").add({ nome, cargo, foto: fotoUrl });
    res.json({ id: docRef.id, nome, cargo, foto: fotoUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put("/:id", upload.single("foto"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo } = req.body;
    let fotoUrl = "";

    const docRef = db.collection("equipe").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: "Membro não encontrado" });

    fotoUrl = docSnap.data().foto;
    if (req.file) {
      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "equipe_dom_bosco" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      fotoUrl = uploadRes.secure_url;
    }

    await docRef.update({ nome, cargo, foto: fotoUrl });
    res.json({ id, nome, cargo, foto: fotoUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("equipe").doc(id).delete();
    res.json({ message: "Membro excluído" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary.js";
import admin from "../firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const db = admin.firestore();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", upload.single("imagem"), async (req, res) => {
  try {
    const { titulo, descricao, dataProjeto, curso } = req.body;
    if (!titulo || !descricao|| !dataProjeto || !curso) return res.status(400).send("Campos obrigatórios");

    const stream = cloudinary.uploader.upload_stream(
      { folder: "oficinas" },
      async (error, result) => {
        if (error) return res.status(500).json(error);
        const dataFormatada = new Date(dataProjeto); 

        const novoProjeto = {
          id: uuidv4(),
          titulo,
          descricao,
          imagemUrl: result.secure_url,
          dataProjeto: dataFormatada,
          curso,
          criadoEm: new Date().toISOString(),
        };

        await db.collection("oficinas").doc(novoProjeto.id).set(novoProjeto);
        res.json(novoProjeto);
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("oficinas")
      .orderBy("dataProjeto", "desc")
      .get();

    const projetos = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        dataProjeto: data.dataProjeto?.toDate
          ? data.dataProjeto.toDate().toISOString()
          : data.dataProjeto, 
      };
    });

    res.json(projetos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id", upload.single("imagem"), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, dataProjeto, curso } = req.body;

    const docRef = db.collection("oficinas").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send("Projeto não encontrado");

    let imagemUrl = doc.data().imagemUrl;

    
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "oficinas" },
        async (error, result) => {
          if (error) return res.status(500).json(error);

          imagemUrl = result.secure_url;

          await docRef.update({ titulo, descricao, dataProjeto: new Date(dataProjeto), imagemUrl, curso });
          res.json({ id, titulo, descricao, dataProjeto, imagemUrl , curso});
        }
      );

      stream.end(req.file.buffer);
    } else {
      await docRef.update({ titulo, descricao, dataProjeto, curso });
      res.json({ id, titulo, descricao, dataProjeto, imagemUrl, curso });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("oficinas").doc(id).delete();
    res.json({ message: "Projeto excluído com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import admin from "../firebaseAdmin.js";
import cloudinary from "../cloudinary.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", upload.single("imagem"), async (req, res) => {
  try {
    const {
      titulo,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      temInscricao,
      linkInscricao,
      descricao,
      dataHora,
    } = req.body;

    let imagemUrl = "";

    
    if (req.file) {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "eventos" },
          (err, result) => {
            if (err) reject(err);
            else {
              imagemUrl = result.secure_url;
              resolve();
            }
          }
        );
        stream.end(req.file.buffer);
      });
    }

    
    const inscricao = temInscricao === "true" || temInscricao === true;

    const db = admin.firestore();
    await db.collection("eventos").add({
      titulo,
      imagemUrl,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      temInscricao: inscricao,
      linkInscricao: inscricao ? linkInscricao || "" : "",
      descricao,
      dataHora: new Date(dataHora),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Evento criado com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).json({ error: "Erro ao criar evento." });
  }
});



router.get("/", async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("eventos")
      .orderBy("createdAt", "desc")
      .get();

    const eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar eventos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await admin.firestore().collection("eventos").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ erro: "Evento não encontrado" });
    }

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    res.status(500).json({ erro: "Erro ao buscar evento" });
  }
});


router.put("/:id", upload.single("imagem"), async (req, res) => {
  try {
    const {
      titulo,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      temInscricao,
      linkInscricao,
      descricao,
      dataHora,
    } = req.body;

    const db = admin.firestore();
    const eventoRef = db.collection("eventos").doc(req.params.id);
    const eventoAtual = await eventoRef.get();

    if (!eventoAtual.exists) {
      return res.status(404).json({ error: "Evento não encontrado." });
    }

    
    let imagemUrl = eventoAtual.data().imagemUrl || "";

    
    if (req.file) {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "eventos" },
          (err, result) => {
            if (err) reject(err);
            else {
              imagemUrl = result.secure_url;
              resolve();
            }
          }
        );
        stream.end(req.file.buffer);
      });
    }

    
    const inscricao = temInscricao === "true" || temInscricao === true;
    const dataConvertida = dataHora ? new Date(dataHora) : null;

    await eventoRef.update({
      titulo,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      temInscricao: inscricao,
      linkInscricao: inscricao ? linkInscricao || "" : "",
      descricao,
      imagemUrl,
      dataHora: dataConvertida,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Evento atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    res.status(500).json({ error: "Erro ao atualizar evento." });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const db = admin.firestore();
    await db.collection("eventos").doc(req.params.id).delete();
    res.status(200).json({ message: "Evento excluído com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir evento." });
  }
});

export default router;

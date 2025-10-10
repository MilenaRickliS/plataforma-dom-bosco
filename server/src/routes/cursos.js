import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../cloudinary.js";
import admin from "../firebaseAdmin.js";

const router = express.Router();
const db = admin.firestore();
const upload = multer({ storage: multer.memoryStorage() });


const REGEX_ALFA_NUM_COM_ACENTO = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,;:()\-_/&+ºª°'"!?]+$/u;
const REGEX_SO_LETRAS_COM_ACENTO = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u;
const countWords = (text = "") => text.trim().split(/\s+/).filter(Boolean).length;


function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const cld = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(cld);
  });
}


async function deleteFromCloudinary(public_id, resource_type = "image") {
  return cloudinary.uploader.destroy(public_id, { resource_type });
}


function validateCursoPayload({ body, files, isUpdate = false }) {
  const errors = [];
  const requiredText = [
    "nome", "descricao", "caracteristica", "duracao",
    "tipo", "linkInscricao", "porqueFazer",
    "porqueEscolher", "oqueAprender", "oportunidades",
    "corpoDocente"
  ];

  
  if (!isUpdate) {
    for (const k of requiredText) {
      if (body[k] == null || String(body[k]).trim() === "") {
        errors.push(`Campo obrigatório vazio: ${k}`);
      }
    }
  }

  if (body.nome && !REGEX_ALFA_NUM_COM_ACENTO.test(body.nome)) {
    errors.push("Nome: use letras, números e acentos.");
  }
  if (body.descricao && countWords(body.descricao) < 15) {
    errors.push("Descrição deve ter no mínimo 15 palavras.");
  }
  if (body.caracteristica && !REGEX_SO_LETRAS_COM_ACENTO.test(body.caracteristica)) {
    errors.push("Característica deve conter apenas letras e acentos.");
  }
  if (body.duracao && !REGEX_ALFA_NUM_COM_ACENTO.test(body.duracao)) {
    errors.push("Duração deve conter letras, números e acentos.");
  }

  const TIPOS = ["Diurno", "Noturno", "Integral"];
  if (body.tipo && !TIPOS.includes(body.tipo)) {
    errors.push(`Tipo inválido. Use: ${TIPOS.join(", ")}`);
  }

  if (body.corpoDocente) {
    const parsed = JSON.parse(body.corpoDocente || "[]");
    if (!Array.isArray(parsed) || parsed.length < 3) {
        errors.push("Corpo docente deve conter no mínimo 3 membros.");
    }
    }


  if (!isUpdate && (!body.linkInscricao || String(body.linkInscricao).trim() === "")) {
    errors.push("Link de inscrição é obrigatório e não pode ser vazio.");
    }


  const textosMin15 = ["porqueFazer", "porqueEscolher", "oqueAprender", "oportunidades"];
  for (const k of textosMin15) {
    if (body[k] && countWords(body[k]) < 15) {
      errors.push(`${k} deve ter no mínimo 15 palavras.`);
    }
  }

  
  try {
    const parsed = JSON.parse(body.corpoDocente || "[]");
    if (!Array.isArray(parsed) || (!isUpdate && parsed.length < 3)) {
      errors.push("Corpo docente deve conter no mínimo 3 membros.");
    }
  } catch {
    errors.push("Corpo docente inválido (esperado array JSON).");
  }

  
  const imgs = files?.imagens || [];
  if (!isUpdate) {
    if (imgs.length === 0) errors.push("Envie pelo menos 1 imagem.");
    if (imgs.length > 5) errors.push("Máximo de 5 imagens.");
  } else {
    if (imgs.length > 5) errors.push("Máximo de 5 imagens por envio.");
  }

  return errors;
}


router.post(
  "/cursos",
  upload.fields([{ name: "imagens", maxCount: 5 }]),
  async (req, res) => {
    try {
      const data = req.body;
      const files = req.files;
      const errors = validateCursoPayload({ body: data, files });
      if (errors.length) return res.status(400).json({ errors });

      const base = {
        nome: data.nome.trim(),
        descricao: data.descricao.trim(),
        caracteristica: data.caracteristica.trim(),
        duracao: data.duracao.trim(),
        tipo: data.tipo,
        linkInscricao: data.linkInscricao.trim(),
        porqueFazer: data.porqueFazer.trim(),
        porqueEscolher: data.porqueEscolher.trim(),
        oqueAprender: data.oqueAprender.trim(),
        oportunidades: data.oportunidades.trim(),
        corpoDocente: JSON.parse(data.corpoDocente),
        imagens: [],
        matrizLink: data.matrizLink?.trim() || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("cursos").add(base);
      const courseId = docRef.id;

      
      const uploadedImages = [];
      for (const file of files?.imagens || []) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `cursos/${courseId}`,
          resource_type: "image",
        });
        uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
      }

      await docRef.update({
        imagens: uploadedImages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const snap = await docRef.get();
      return res.status(201).json({ id: docRef.id, ...snap.data() });
    } catch (err) {
      console.error("Erro ao criar curso:", err);
        return res.status(500).json({ error: "Erro ao criar curso", details: err.message });

    }
  }
);


router.get("/cursos", async (_req, res) => {
  try {
    const snapshot = await db.collection("cursos").orderBy("createdAt", "desc").get();
    const cursos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(cursos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar cursos" });
  }
});


router.get("/cursos/:id", async (req, res) => {
  try {
    const doc = await db.collection("cursos").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Curso não encontrado" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar curso" });
  }
});


router.put(
  "/cursos/:id",
  upload.fields([{ name: "imagens", maxCount: 5 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const ref = db.collection("cursos").doc(id);
      const atual = await ref.get();
      if (!atual.exists) return res.status(404).json({ error: "Curso não encontrado" });

      const dadosAtuais = atual.data();
      const data = req.body;
      const files = req.files;

      const errors = validateCursoPayload({ body: data, files, isUpdate: true });
      if (errors.length) return res.status(400).json({ errors });

      
      let imagens = [...(dadosAtuais.imagens || [])];
      const toRemove = JSON.parse(data.removeImagesPublicIds || "[]");
      if (toRemove.length) {
        for (const pid of toRemove) {
          await deleteFromCloudinary(pid, "image");
        }
        imagens = imagens.filter((img) => !toRemove.includes(img.public_id));
      }

      
      const novas = files?.imagens || [];
      if (imagens.length + novas.length > 5) {
        return res.status(400).json({ errors: ["Máximo de 5 imagens no total."] });
      }
      for (const file of novas) {
        const up = await uploadBufferToCloudinary(file.buffer, {
          folder: `cursos/${id}`,
          resource_type: "image",
        });
        imagens.push({ url: up.secure_url, public_id: up.public_id });
      }

      const update = {
        nome: data.nome?.trim() ?? dadosAtuais.nome,
        descricao: data.descricao?.trim() ?? dadosAtuais.descricao,
        caracteristica: data.caracteristica?.trim() ?? dadosAtuais.caracteristica,
        duracao: data.duracao?.trim() ?? dadosAtuais.duracao,
        tipo: data.tipo ?? dadosAtuais.tipo,
        linkInscricao: data.linkInscricao?.trim() ?? dadosAtuais.linkInscricao,
        porqueFazer: data.porqueFazer?.trim() ?? dadosAtuais.porqueFazer,
        porqueEscolher: data.porqueEscolher?.trim() ?? dadosAtuais.porqueEscolher,
        oqueAprender: data.oqueAprender?.trim() ?? dadosAtuais.oqueAprender,
        oportunidades: data.oportunidades?.trim() ?? dadosAtuais.oportunidades,
        corpoDocente: data.corpoDocente ? JSON.parse(data.corpoDocente) : dadosAtuais.corpoDocente,
        imagens,
        matrizLink: data.matrizLink?.trim() || dadosAtuais.matrizLink, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await ref.update(update);
      const snap = await ref.get();
      res.json({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao atualizar curso" });
    }
  }
);


router.delete("/cursos/:id", async (req, res) => {
  try {
    const ref = db.collection("cursos").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Curso não encontrado" });

    const data = doc.data();

    
    for (const img of data.imagens || []) {
      await deleteFromCloudinary(img.public_id, "image");
    }
    
    await cloudinary.api.delete_resources_by_prefix(`cursos/${req.params.id}`);
    await cloudinary.api.delete_folder(`cursos/${req.params.id}`);

    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir curso" });
  }
});

export default router;

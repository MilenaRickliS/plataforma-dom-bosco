import { v2 as cloudinary } from "cloudinary";
import admin from "../firebaseAdmin.js";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const db = admin.firestore();


const REGEX_ALFA_NUM_COM_ACENTO = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,;:()\-_/&+ºª°'"!?]+$/u;
const REGEX_SO_LETRAS_COM_ACENTO = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u;
const countWords = (text = "") => text.trim().split(/\s+/).filter(Boolean).length;

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
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


async function parseJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}


export default async function handler(req, res) {
  const { method, query } = req;
  const id = query.id || (req.url.split("/").pop() || "").split("?")[0];

  try {
    
    if (method === "GET" && !id) {
      const snapshot = await db.collection("cursos").orderBy("createdAt", "desc").get();
      const cursos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(cursos);
    }

    
    if (method === "GET" && id) {
      const doc = await db.collection("cursos").doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: "Curso não encontrado" });
      return res.status(200).json({ id: doc.id, ...doc.data() });
    }

    
    if (method === "POST") {
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let fields = {};
      let files = [];

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (name, val) => (fields[name] = val));

        bb.on("file", (name, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => files.push({ fieldname: name, buffer: Buffer.concat(chunks) }));
        });

        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      const groupedFiles = { imagens: files.filter((f) => f.fieldname === "imagens") };
      const errors = validateCursoPayload({ body: fields, files: groupedFiles });
      if (errors.length) return res.status(400).json({ errors });

      const base = {
        nome: fields.nome.trim(),
        descricao: fields.descricao.trim(),
        caracteristica: fields.caracteristica.trim(),
        duracao: fields.duracao.trim(),
        tipo: fields.tipo,
        linkInscricao: fields.linkInscricao.trim(),
        porqueFazer: fields.porqueFazer.trim(),
        porqueEscolher: fields.porqueEscolher.trim(),
        oqueAprender: fields.oqueAprender.trim(),
        oportunidades: fields.oportunidades.trim(),
        corpoDocente: JSON.parse(fields.corpoDocente),
        imagens: [],
        matrizLink: fields.matrizLink?.trim() || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("cursos").add(base);
      const courseId = docRef.id;

      const uploadedImages = [];
      for (const file of groupedFiles.imagens || []) {
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
    }

    
    if (method === "PUT" && id) {
      const ref = db.collection("cursos").doc(id);
      const atual = await ref.get();
      if (!atual.exists) return res.status(404).json({ error: "Curso não encontrado" });

      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let fields = {};
      let files = [];

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (name, val) => (fields[name] = val));

        bb.on("file", (name, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => files.push({ fieldname: name, buffer: Buffer.concat(chunks) }));
        });

        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      const groupedFiles = { imagens: files.filter((f) => f.fieldname === "imagens") };
      const errors = validateCursoPayload({ body: fields, files: groupedFiles, isUpdate: true });
      if (errors.length) return res.status(400).json({ errors });

      const dadosAtuais = atual.data();
      let imagens = [...(dadosAtuais.imagens || [])];
      const toRemove = JSON.parse(fields.removeImagesPublicIds || "[]");

      if (toRemove.length) {
        for (const pid of toRemove) await deleteFromCloudinary(pid, "image");
        imagens = imagens.filter((img) => !toRemove.includes(img.public_id));
      }

      const novas = groupedFiles.imagens || [];
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
        nome: fields.nome?.trim() ?? dadosAtuais.nome,
        descricao: fields.descricao?.trim() ?? dadosAtuais.descricao,
        caracteristica: fields.caracteristica?.trim() ?? dadosAtuais.caracteristica,
        duracao: fields.duracao?.trim() ?? dadosAtuais.duracao,
        tipo: fields.tipo ?? dadosAtuais.tipo,
        linkInscricao: fields.linkInscricao?.trim() ?? dadosAtuais.linkInscricao,
        porqueFazer: fields.porqueFazer?.trim() ?? dadosAtuais.porqueFazer,
        porqueEscolher: fields.porqueEscolher?.trim() ?? dadosAtuais.porqueEscolher,
        oqueAprender: fields.oqueAprender?.trim() ?? dadosAtuais.oqueAprender,
        oportunidades: fields.oportunidades?.trim() ?? dadosAtuais.oportunidades,
        corpoDocente: fields.corpoDocente
          ? JSON.parse(fields.corpoDocente)
          : dadosAtuais.corpoDocente,
        imagens,
        matrizLink: fields.matrizLink?.trim() || dadosAtuais.matrizLink,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await ref.update(update);
      const snap = await ref.get();
      return res.status(200).json({ id: snap.id, ...snap.data() });
    }

    
    if (method === "DELETE" && id) {
      const ref = db.collection("cursos").doc(id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: "Curso não encontrado" });

      const data = doc.data();

      for (const img of data.imagens || []) {
        await deleteFromCloudinary(img.public_id, "image");
      }

      await cloudinary.api.delete_resources_by_prefix(`cursos/${id}`);
      await cloudinary.api.delete_folder(`cursos/${id}`);
      await ref.delete();

      return res.status(200).json({ ok: true, message: "Curso excluído com sucesso" });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("Erro na API de cursos:", err);
    return res.status(500).json({ error: "Erro no servidor", details: err.message });
  }
}

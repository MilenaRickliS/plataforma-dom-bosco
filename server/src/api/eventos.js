import { v2 as cloudinary } from "cloudinary";
import admin from "../firebaseAdmin.js";

const db = admin.firestore();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


async function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eventos" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}


export default async function handler(req, res) {
  const { method, query } = req;
  const id = query.id || (req.url.split("/").pop() || "").split("?")[0];

  try {
    
    if (method === "GET" && !id) {
      const snapshot = await db.collection("eventos").orderBy("createdAt", "desc").get();
      const eventos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(eventos);
    }

    
    if (method === "GET" && id) {
      const doc = await db.collection("eventos").doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: "Evento não encontrado." });
      return res.status(200).json({ id: doc.id, ...doc.data() });
    }

    
    if (method === "POST" && !id) {
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });

      let fields = {};
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);
        bb.on("field", (name, val) => (fields[name] = val));
        bb.on("file", (_, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        });
        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      let imagemUrl = "";
      if (fileBuffer) {
        const uploadRes = await uploadToCloudinary(fileBuffer);
        imagemUrl = uploadRes.secure_url;
      }

      const inscricao =
        fields.temInscricao === "true" || fields.temInscricao === true;

      await db.collection("eventos").add({
        titulo: fields.titulo,
        rua: fields.rua,
        numero: fields.numero,
        bairro: fields.bairro,
        cidade: fields.cidade,
        estado: fields.estado,
        cep: fields.cep,
        temInscricao: inscricao,
        linkInscricao: inscricao ? fields.linkInscricao || "" : "",
        descricao: fields.descricao,
        dataHora: fields.dataHora,
        imagemUrl,
        curtidas: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ message: "Evento criado com sucesso!" });
    }

    
    if (method === "PUT" && id) {
      const eventoRef = db.collection("eventos").doc(id);
      const eventoSnap = await eventoRef.get();
      if (!eventoSnap.exists)
        return res.status(404).json({ error: "Evento não encontrado." });

      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });

      let fields = {};
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);
        bb.on("field", (name, val) => (fields[name] = val));
        bb.on("file", (_, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
          });
        });
        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      let imagemUrl = eventoSnap.data().imagemUrl || "";
      if (fileBuffer) {
        const uploadRes = await uploadToCloudinary(fileBuffer);
        imagemUrl = uploadRes.secure_url;
      }

      const inscricao =
        fields.temInscricao === "true" || fields.temInscricao === true;

      await eventoRef.update({
        titulo: fields.titulo,
        rua: fields.rua,
        numero: fields.numero,
        bairro: fields.bairro,
        cidade: fields.cidade,
        estado: fields.estado,
        cep: fields.cep,
        temInscricao: inscricao,
        linkInscricao: inscricao ? fields.linkInscricao || "" : "",
        descricao: fields.descricao,
        dataHora: fields.dataHora,
        imagemUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        curtidas: eventoSnap.data().curtidas || 0,
      });

      return res.status(200).json({ message: "Evento atualizado com sucesso!" });
    }

    
    if (method === "DELETE" && id) {
      await db.collection("eventos").doc(id).delete();
      return res.status(200).json({ message: "Evento excluído com sucesso!" });
    }

    
    if (method === "POST" && id && query.acao === "curtir") {
      const ref = db.collection("eventos").doc(id);
      await db.runTransaction(async (t) => {
        const doc = await t.get(ref);
        const curtidas = (doc.data().curtidas || 0) + 1;
        t.update(ref, { curtidas });
      });
      return res.status(200).json({ success: true, message: "Curtida adicionada!" });
    }

    
    if (method === "POST" && id && query.acao === "descurtir") {
      const ref = db.collection("eventos").doc(id);
      await db.runTransaction(async (t) => {
        const doc = await t.get(ref);
        const curtidas = Math.max(0, (doc.data().curtidas || 0) - 1);
        t.update(ref, { curtidas });
      });
      return res.status(200).json({ success: true, message: "Curtida removida!" });
    }

    
    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error("Erro no endpoint de eventos:", error);
    return res.status(500).json({ error: error.message });
  }
}

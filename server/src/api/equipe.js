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
      { folder: "equipe_dom_bosco" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}


export default async function handler(req, res) {
  const { method, query } = req;

  
  if (method === "GET") {
    try {
      const snapshot = await db.collection("equipe").get();
      const equipe = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(equipe);
    } catch (error) {
      console.error("Erro ao buscar equipe:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  
  if (method === "POST") {
    try {
      
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let nome = "";
      let cargo = "";
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          if (fieldname === "nome") nome = val;
          if (fieldname === "cargo") cargo = val;
        });

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

      let fotoUrl = "";
      if (fileBuffer) {
        const uploadRes = await uploadToCloudinary(fileBuffer);
        fotoUrl = uploadRes.secure_url;
      }

      const docRef = await db.collection("equipe").add({ nome, cargo, foto: fotoUrl });
      return res.status(201).json({ id: docRef.id, nome, cargo, foto: fotoUrl });
    } catch (error) {
      console.error("Erro ao criar membro:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  
  if (method === "PUT") {
    try {
      const { id } = query;
      if (!id) return res.status(400).json({ error: "ID não fornecido" });

      const docRef = db.collection("equipe").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) return res.status(404).json({ error: "Membro não encontrado" });

      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let nome = "";
      let cargo = "";
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          if (fieldname === "nome") nome = val;
          if (fieldname === "cargo") cargo = val;
        });

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

      let fotoUrl = docSnap.data().foto;
      if (fileBuffer) {
        const uploadRes = await uploadToCloudinary(fileBuffer);
        fotoUrl = uploadRes.secure_url;
      }

      await docRef.update({ nome, cargo, foto: fotoUrl });
      return res.status(200).json({ id, nome, cargo, foto: fotoUrl });
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  
  if (method === "DELETE") {
    try {
      const { id } = query;
      if (!id) return res.status(400).json({ error: "ID não fornecido" });
      await db.collection("equipe").doc(id).delete();
      return res.status(200).json({ message: "Membro excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir membro:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  
  return res.status(405).json({ error: "Método não permitido" });
}

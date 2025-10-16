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
      { folder: "galeria_dom_bosco" },
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
  const id = query.id || (req.url.split("/").pop() || "").split("?")[0];

  try {
    
    if (method === "GET") {
      const snapshot = await db.collection("galeria").orderBy("createdAt", "desc").get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(data);
    }

   
    if (method === "POST") {
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let title = "";
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          if (fieldname === "title") title = val;
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

      if (!fileBuffer) {
        return res.status(400).json({ error: "Nenhuma imagem enviada." });
      }

      
      const uploadRes = await uploadToCloudinary(fileBuffer);

      
      const docRef = await db.collection("galeria").add({
        title,
        imageUrl: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({
        id: docRef.id,
        title,
        imageUrl: uploadRes.secure_url,
      });
    }

    
    if (method === "PUT" && id) {
      const { title } = await parseJson(req);
      await db.collection("galeria").doc(id).update({ title });
      return res.status(200).json({ message: "Título atualizado com sucesso!" });
    }

    
    if (method === "DELETE" && id) {
      const docRef = db.collection("galeria").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Imagem não encontrada" });
      }

      const { publicId } = doc.data();
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      await docRef.delete();
      return res.status(200).json({ message: "Imagem excluída com sucesso!" });
    }

    
    return res.status(405).json({ error: "Método não permitido." });
  } catch (err) {
    console.error("Erro na API de galeria:", err);
    return res.status(500).json({ error: err.message });
  }
}


async function parseJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

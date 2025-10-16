import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
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
      { folder: "projetos" },
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
      const snapshot = await db
        .collection("projetos")
        .orderBy("dataProjeto", "desc")
        .get();

      const projetos = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          dataProjeto: data.dataProjeto?.toDate
            ? data.dataProjeto.toDate().toISOString()
            : data.dataProjeto,
        };
      });

      return res.status(200).json(projetos);
    }

    
    if (method === "POST") {
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let fields = {};
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          fields[fieldname] = val;
        });

        bb.on("file", (_, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => (fileBuffer = Buffer.concat(chunks)));
        });

        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      const { titulo, descricao, dataProjeto } = fields;
      if (!titulo || !descricao || !dataProjeto)
        return res.status(400).json({ error: "Campos obrigatórios." });

      let imagemUrl = "";
      if (fileBuffer) {
        const uploadRes = await uploadToCloudinary(fileBuffer);
        imagemUrl = uploadRes.secure_url;
      }

      const novoProjeto = {
        id: uuidv4(),
        titulo,
        descricao,
        imagemUrl,
        dataProjeto: new Date(dataProjeto),
        criadoEm: new Date().toISOString(),
      };

      await db.collection("projetos").doc(novoProjeto.id).set(novoProjeto);
      return res.status(201).json(novoProjeto);
    }

    
    if (method === "PUT" && id) {
      const docRef = db.collection("projetos").doc(id);
      const doc = await docRef.get();
      if (!doc.exists)
        return res.status(404).json({ error: "Projeto não encontrado." });

      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let fields = {};
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          fields[fieldname] = val;
        });

        bb.on("file", (_, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => (fileBuffer = Buffer.concat(chunks)));
        });

        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      let imagemUrl = doc.data().imagemUrl;
      if (fileBuffer) {
        const uploadRes = await uploadToCloudinary(fileBuffer);
        imagemUrl = uploadRes.secure_url;
      }

      const { titulo, descricao, dataProjeto } = fields;

      await docRef.update({
        titulo,
        descricao,
        imagemUrl,
        dataProjeto: new Date(dataProjeto),
      });

      return res.status(200).json({
        id,
        titulo,
        descricao,
        dataProjeto,
        imagemUrl,
      });
    }

    
    if (method === "DELETE" && id) {
      await db.collection("projetos").doc(id).delete();
      return res.status(200).json({ message: "Projeto excluído com sucesso!" });
    }

    
    return res.status(405).json({ error: "Método não permitido." });
  } catch (err) {
    console.error("Erro na API de projetos:", err);
    return res.status(500).json({ error: err.message });
  }
}

import { v2 as cloudinary } from "cloudinary";
import admin from "../firebaseAdmin.js";
import streamifier from "streamifier";

const db = admin.firestore();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method, url } = req;
  const id = (req.url.split("/").pop() || "").split("?")[0];

  try {
   
    if (method === "GET" && id && !url.includes("/categorias")) {
      const id = url.split("/").pop();
      console.log("🟢 Buscando vídeo por ID:", id);

      const doc = await db.collection("videos").doc(id).get();

      if (!doc.exists) {
        console.warn("⚠️ Vídeo não encontrado:", id);
        return res.status(404).json({ error: "Vídeo não encontrado" });
      }

      return res.status(200).json({ id: doc.id, ...doc.data() });
    }
    
    if (method === "GET" && !id) {
      console.log("📋 Listando todos os vídeos...");
      const snapshot = await db
        .collection("videos")
        .orderBy("createdAt", "desc")
        .get();

      const videos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json(videos);
    }
    
    if (method === "POST" && url.includes("/upload")) {
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });

      let titulo = "",
        descricao = "",
        categoria = "",
        usuario = "",
        fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          if (fieldname === "titulo") titulo = val;
          if (fieldname === "descricao") descricao = val;
          if (fieldname === "categoria") categoria = val;
          if (fieldname === "usuario") usuario = val;
        });

        bb.on("file", (_, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => (fileBuffer = Buffer.concat(chunks)));
        });

        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      if (!fileBuffer) {
        return res.status(400).json({ error: "Nenhum vídeo enviado" });
      }

      const pasta = categoria
        ? `videos_dom_bosco/${categoria.replace(/\s+/g, "_").toLowerCase()}`
        : "videos_dom_bosco/outras";

      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: pasta, resource_type: "video" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });

      await db.collection("videos").add({
        titulo,
        descricao,
        categoria,
        tipo: "upload",
        url: uploadRes.secure_url,
        usuario,
        createdAt: new Date(),
      });

      if (categoria) {
        const ref = db.collection("categorias_videos");
        const snap = await ref.where("nome", "==", categoria).get();
        if (snap.empty) await ref.add({ nome: categoria });
      }

      return res.status(200).json({ message: "Vídeo enviado com sucesso!" });
    }

    
    if (method === "POST" && url.includes("/link")) {
      const { titulo, descricao, url: videoUrl, categoria, usuario } = req.body || {};

      if (!videoUrl || !titulo) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
      }

      await db.collection("videos").add({
        titulo,
        descricao,
        categoria,
        tipo: "link",
        url: videoUrl,
        usuario,
        createdAt: new Date(),
      });

      if (categoria) {
        const ref = db.collection("categorias_videos");
        const snap = await ref.where("nome", "==", categoria).get();
        if (snap.empty) await ref.add({ nome: categoria });
      }

      return res.status(200).json({ message: "Vídeo enviado com sucesso!" });
    }

        
    if (method === "GET" && url.includes("/categorias")) {
      const snapshot = await db.collection("categorias_videos").get();
      const categorias = snapshot.docs.map((doc) => doc.data().nome);
      return res.status(200).json(categorias);
    }

    
    if (method === "PUT") {
    const { id, titulo, descricao, categoria, usuario } = req.body || {};

    if (!id || !usuario) {
        return res.status(400).json({ error: "ID e usuário são obrigatórios" });
    }

    const docRef = db.collection("videos").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        return res.status(404).json({ error: "Vídeo não encontrado" });
    }

    const videoData = doc.data();

    
    if (videoData.usuario !== usuario) {
        return res.status(403).json({ error: "Acesso negado: não é o autor do vídeo" });
    }

    const atualizacao = {};
    if (titulo) atualizacao.titulo = titulo;
    if (descricao) atualizacao.descricao = descricao;
    if (categoria) atualizacao.categoria = categoria;

    await docRef.update(atualizacao);

    
    if (categoria) {
        const ref = db.collection("categorias_videos");
        const snap = await ref.where("nome", "==", categoria).get();
        if (snap.empty) await ref.add({ nome: categoria });
    }

    return res.status(200).json({ message: "Vídeo atualizado com sucesso!" });
    }


    if (method === "DELETE") {
    const { id } = req.query;
    const doc = await db.collection("videos").doc(id).get();

    if (!doc.exists) return res.status(404).json({ error: "Vídeo não encontrado" });

    const { categoria } = doc.data();
    await db.collection("videos").doc(id).delete();

    
    if (categoria) {
        const snap = await db.collection("videos").where("categoria", "==", categoria).get();
        if (snap.empty) {
        const catSnap = await db.collection("categorias_videos")
            .where("nome", "==", categoria)
            .get();

        for (const catDoc of catSnap.docs) {
            await db.collection("categorias_videos").doc(catDoc.id).delete();
        }
        }
    }

    return res.status(200).json({ message: "Vídeo excluído e categoria atualizada" });
    }



    
    return res.status(405).json({ error: "Método ou rota inválida" });
  } catch (error) {
    console.error("Erro no handler de vídeos:", error);
    return res.status(500).json({ error: error.message });
  }
}

import admin from "../firebaseAdmin.js";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const config = {
  api: { bodyParser: false },
  runtime: "nodejs",
};

const db = admin.firestore();

async function uploadToCloudinary(filePath) {
  return await cloudinary.uploader.upload(filePath, { folder: "usuarios" });
}

function parseForm(req) {
  const form = formidable({ multiples: false, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    // ✅ GET — lista todos os usuários
    if (method === "GET") {
      const snapshot = await db.collection("usuarios").get();
      const usuarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(usuarios);
    }

    // ✅ POST — cria novo usuário
    if (method === "POST") {
      const { fields, files } = await parseForm(req);

      const nome = fields.nome?.[0] || fields.nome;
      const email = fields.email?.[0] || fields.email;
      const senha = fields.senha?.[0] || fields.senha;
      const role = fields.role?.[0] || "aluno";

      if (!email || !senha)
        return res.status(400).json({ message: "E-mail e senha obrigatórios." });

      console.log("🟢 Criando usuário no Firebase Auth:", email);
      const userRecord = await admin.auth().createUser({
        email,
        password: senha,
        displayName: nome,
      });

      // 🔹 Faz upload da foto se existir
      let fotoUrl = "";
      if (files.foto && files.foto.filepath) {
        console.log("🟢 Enviando foto para Cloudinary...");
        const uploadRes = await uploadToCloudinary(files.foto.filepath);
        fotoUrl = uploadRes.secure_url;
        try {
          fs.rm(files.foto.filepath, () => {});
        } catch {}
      }

      console.log("🟢 Salvando usuário no Firestore...");
      await db.collection("usuarios").doc(email).set({
        uid: userRecord.uid,
        nome,
        email,
        role,
        foto: fotoUrl,
        criadoEm: new Date(),
      });

      console.log("✅ Usuário criado com sucesso!");
      return res.status(201).json({ message: "Usuário criado com sucesso!" });
    }

    // ✅ DELETE — exclui usuário
    if (method === "DELETE") {
      const email = req.query.email;
      if (!email) return res.status(400).json({ message: "E-mail obrigatório." });

      try {
        const user = await admin.auth().getUserByEmail(email);
        if (user) await admin.auth().deleteUser(user.uid);
      } catch {
        console.warn("Usuário não encontrado no Auth (ignorando).");
      }

      await db.collection("usuarios").doc(email).delete();
      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    }

    return res.status(405).json({ message: "Método não permitido." });
  } catch (err) {
    console.error("❌ Erro na rota /api/usuarios:", err);
    return res.status(500).json({ message: "Erro interno", error: err.message });
  }
}

import { v2 as cloudinary } from "cloudinary";
import admin from "../firebaseAdmin.js";

const db = admin.firestore();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


async function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "usuarios" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}


async function deleteFromCloudinary(imageUrl) {
  try {
    if (!imageUrl) return;
    const parts = imageUrl.split("/");
    const fileName = parts[parts.length - 1]; 
    const publicId = "usuarios/" + fileName.split(".")[0]; 
    await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Foto removida do Cloudinary:", publicId);
  } catch (err) {
    console.warn("Erro ao excluir foto do Cloudinary:", err.message);
  }
}

export default async function handler(req, res) {
  const { method, query } = req;

  
  if (method === "GET") {
    try {
      const snapshot = await db.collection("usuarios").get();
      const usuarios = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  
  if (method === "POST") {
    try {
      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let nome = "";
      let email = "";
      let senha = "";
      let role = "aluno";
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);

        bb.on("field", (fieldname, val) => {
          if (fieldname === "nome") nome = val;
          if (fieldname === "email") email = val;
          if (fieldname === "senha") senha = val;
          if (fieldname === "role") role = val;
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

      if (!email || !senha) {
        return res.status(400).json({ message: "E-mail e senha obrigatórios." });
      }

      console.log("🟢 Criando usuário:", email);

      
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email,
          password: senha,
          displayName: nome,
        });
      } catch (e) {
        console.warn("Usuário já existe no Auth, ignorando criação.");
        userRecord = await admin.auth().getUserByEmail(email);
      }

      
      let fotoUrl = "";
      if (fileBuffer) {
        console.log("📸 Upload da foto para Cloudinary...");
        const uploadRes = await uploadToCloudinary(fileBuffer);
        fotoUrl = uploadRes.secure_url;
      }

      
      const novoUsuario = {
        uid: userRecord?.uid || null,
        nome,
        email,
        role,
        foto: fotoUrl,
        criadoEm: new Date(),
      };

      const ref = await db.collection("usuarios").add(novoUsuario);
      console.log("✅ Usuário criado com ID:", ref.id);

      return res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (method === "PUT") {
    try {
      const { emailOriginal } = query;
      if (!emailOriginal) return res.status(400).json({ message: "E-mail original é obrigatório para edição." });

      const busboy = await import("busboy").then((m) => m.default);
      const bb = busboy({ headers: req.headers });
      let nome = "", email = "", senha = "", role = "";
      let fileBuffer = null;

      await new Promise((resolve, reject) => {
        req.pipe(bb);
        bb.on("field", (field, val) => {
          if (field === "nome") nome = val;
          if (field === "email") email = val;
          if (field === "senha") senha = val;
          if (field === "role") role = val;
        });
        bb.on("file", (_, file) => {
          const chunks = [];
          file.on("data", (chunk) => chunks.push(chunk));
          file.on("end", () => { fileBuffer = Buffer.concat(chunks); });
        });
        bb.on("finish", resolve);
        bb.on("error", reject);
      });

      const snapshot = await db.collection("usuarios").where("email", "==", emailOriginal).get();
      if (snapshot.empty) return res.status(404).json({ message: "Usuário não encontrado." });

      let fotoUrl = "";
      if (fileBuffer) {
        console.log("📸 Atualizando foto...");
        const uploadRes = await uploadToCloudinary(fileBuffer);
        fotoUrl = uploadRes.secure_url;
        const oldFoto = snapshot.docs[0].data().foto;
        if (oldFoto) await deleteFromCloudinary(oldFoto);
      }

      const userRef = snapshot.docs[0].ref;
      await userRef.update({
        nome: nome || snapshot.docs[0].data().nome,
        role: role || snapshot.docs[0].data().role,
        foto: fotoUrl || snapshot.docs[0].data().foto,
      });

      if (senha) {
        try {
          const user = await admin.auth().getUserByEmail(emailOriginal);
          await admin.auth().updateUser(user.uid, { password: senha });
        } catch {
          console.warn("Usuário não encontrado no Auth — senha não atualizada.");
        }
      }

      return res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ error: error.message });
    }
  }


  
  if (method === "DELETE") {
    try {
      const { email } = query;
      if (!email)
        return res.status(400).json({ message: "E-mail obrigatório para exclusão." });

      
      const snapshot = await db.collection("usuarios").where("email", "==", email).get();
      if (snapshot.empty)
        return res.status(404).json({ message: "Usuário não encontrado." });

      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.foto) await deleteFromCloudinary(data.foto);
      }

      
      try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().deleteUser(user.uid);
      } catch {
        console.warn("Usuário não encontrado no Auth, prosseguindo...");
      }

      
      for (const doc of snapshot.docs) {
        await db.collection("usuarios").doc(doc.id).delete();
      }

      return res.status(200).json({ message: "Usuário e foto excluídos com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ message: "Método não permitido" });
}

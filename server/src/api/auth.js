import admin from "../firebaseAdmin.js";

const db = admin.firestore();

export default async function handler(req, res) {

  // 🔥 CORS MANUAL (OBRIGATÓRIO no Vercel serverless)
  res.setHeader("Access-Control-Allow-Origin", "https://plataforma-dom-bosco.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 🔥 RESPONDE PREFLIGHT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🚫 BLOQUEIO DE MÉTODO
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Token não fornecido" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase().trim();

    const userDoc = await db
      .collection("usuarios")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userDoc.empty) {
      return res.status(403).json({ message: "Usuário não encontrado no banco" });
    }

    const userData = userDoc.docs[0].data();

    res.status(200).json({
      email: userData.email,
      role: userData.role,
      nome: userData.nome,
      foto: userData.foto || null,
      ultimoLogin: userData.ultimoLogin || null,
    });

  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.status(401).json({ message: "Token inválido" });
  }
}
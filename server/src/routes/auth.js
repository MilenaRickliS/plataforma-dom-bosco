import { Router } from "express";
import admin from "../firebaseAdmin.js";

const router = Router();

// Emails autorizados 
const rotas = {
  "milena.silverio2506@gmail.com": "aluno",
  "professor@gmail.com": "professor",
  "admin@gmail.com": "admin"
};

router.post("/login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) return res.status(400).json({ message: "Token não fornecido" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email.toLowerCase().trim();
    console.log("Email recebido do Firebase:", email);

    
    if (!rotas[email]) return res.status(403).json({ message: "Email não autorizado" });

    const role = rotas[email];
    res.json({ email, role });
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.status(401).json({ message: "Token inválido" });
  }
});

export default router;

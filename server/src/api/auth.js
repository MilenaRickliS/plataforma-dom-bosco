import admin from "../firebaseAdmin.js";

const rotas = {
  "aluno@gmail.com": "aluno",
  "milena.silverio2506@gmail.com": "aluno",
  "engs-milenasilverio@camporeal.edu.br": "professor",
  "professor@gmail.com": "professor",
  "jogos.mi2506@gmail.com": "admin",
  "admin@gmail.com": "admin",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Token não fornecido" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase().trim();

    if (!rotas[email]) {
      return res.status(403).json({ message: "Email não autorizado" });
    }

    res.status(200).json({ email, role: rotas[email] });
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.status(401).json({ message: "Token inválido" });
  }
}

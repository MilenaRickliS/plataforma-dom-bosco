import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 
const router = express.Router();

router.post("/enviar-email", async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    });

    
    const mailOptions = {
      from: `"Formulário do Site" <${email}>`,
      to: "contatos@dombosco.net",
      subject: `Nova mensagem de contato: ${assunto}`,
      html: `
        <h3>Mensagem enviada pelo site</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "E-mail enviado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erro ao enviar e-mail." });
  }
});

export default router;

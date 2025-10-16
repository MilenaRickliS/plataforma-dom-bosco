import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { nome, email, telefone, assunto, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ message: "Campos obrigatórios ausentes." });
  }

  try {
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    
    const mailOptions = {
      from: `"Formulário do Site" <${process.env.EMAIL_USER}>`,
      to: "contatos@dombosco.net",
      subject: `Nova mensagem de contato: ${assunto || "Sem assunto"}`,
      html: `
        <h3>Mensagem enviada pelo site</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone || "Não informado"}</p>
        <p><strong>Assunto:</strong> ${assunto || "Sem assunto"}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      `,
    };

    
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({ success: false, message: "Erro ao enviar e-mail." });
  }
}

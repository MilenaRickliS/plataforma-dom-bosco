import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { fileBase64, folder } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: "Arquivo não encontrado" });
    }

    const upload = await cloudinary.v2.uploader.upload(fileBase64, {
      folder: folder || "uploads",
      resource_type: "auto",
       public_id: `${Date.now()}`,
      overwrite: true,
    });

    return res.status(200).json({ url: upload.secure_url });
  } catch (err) {
    console.error("Erro no upload:", err);
    return res.status(500).json({ error: "Falha no upload" });
  }
}

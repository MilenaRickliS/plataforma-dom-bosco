import { v2 as cloudinary } from "cloudinary";
import Busboy from "busboy";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  try {
    const busboy = Busboy({ headers: req.headers });

    busboy.on("file", (_, file) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "turmas" },
        (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro no upload" });
          }
          res.status(200).json({ url: result.secure_url });
        }
      );
      file.pipe(uploadStream);
    });

    req.pipe(busboy);
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ error: "Falha interna no servidor" });
  }
}

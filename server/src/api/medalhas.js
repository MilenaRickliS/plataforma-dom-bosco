import admin from "../firebaseAdmin.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const db = admin.firestore();


function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


const storage = multer.memoryStorage();
const upload = multer({ storage });


export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

 const { method, url, query } = req;
  let body = req.body;

 
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      console.warn("⚠️ Body não pôde ser convertido em JSON, mantendo como está.");
    }
  }

  const urlObj = new URL(url, `http://${req.headers.host || "localhost"}`);
  const subpath = urlObj.pathname.replace(/\/api\/medalhas/, "") || "/";

  try {
    
    if (method === "GET" && subpath === "/templates") {
      const { professorId } = query || {};
      if (!professorId)
        return res.status(400).json({ error: "professorId é obrigatório" });

      const snap = await db
        .collection("medal_templates")
        .where("ownerProfessorId", "==", professorId)
        .orderBy("createdAt", "desc")
        .get();

      const templates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(templates);
    }

    
    if (method === "POST" && subpath === "/templates") {
      return upload.single("image")(req, res, async (err) => {
        if (err) {
          console.error("Erro multer:", err);
          return res.status(500).json({ error: err.message || "Erro ao processar upload" });
        }


        const { title, ownerProfessorId, unique, category, color } = req.body;

        if (!title || !ownerProfessorId)
          return res
            .status(400)
            .json({ error: "title e ownerProfessorId são obrigatórios" });

        let imageUrl = "";
        if (req.file) {
          const uploaded = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "medalhas" }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              })
              .end(req.file.buffer);
          });
          imageUrl = uploaded.secure_url;
        }

        const ref = await db.collection("medal_templates").add({
          title,
          imageUrl,
          ownerProfessorId,
          unique: unique === "true" || unique === true,
          category: category || "geral",
          color: color || "#2563eb",
          createdAt: new Date(),
        });

        const doc = await ref.get();
        return res.status(201).json({ id: ref.id, ...doc.data() });
      });
    }

   
    const templatesIdMatch = subpath.match(/^\/templates\/([^/]+)$/);
    if (templatesIdMatch) {
      const id = templatesIdMatch[1];

      if (method === "PUT") {
        return upload.single("image")(req, res, async (err) => {
          if (err)
            return res.status(500).json({ error: "Erro ao processar upload" });

          const { title, category, color, unique } = req.body;
          let imageUrl = null;

          if (req.file) {
            const uploaded = await new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ folder: "medalhas" }, (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                })
                .end(req.file.buffer);
            });
            imageUrl = uploaded.secure_url;
          }

          const updateData = {
            ...(title && { title }),
            ...(category && { category }),
            ...(color && { color }),
            ...(unique !== undefined && {
              unique: unique === "true" || unique === true,
            }),
            ...(imageUrl && { imageUrl }),
            updatedAt: new Date(),
          };

          await db.collection("medal_templates").doc(id).update(updateData);
          const updatedDoc = await db.collection("medal_templates").doc(id).get();
          return res.status(200).json({ id, ...updatedDoc.data() });
        });
      }

      if (method === "DELETE") {
        await db.collection("medal_templates").doc(id).delete();
        return res.status(200).json({ ok: true });
      }
    }

   
    if (method === "POST" && subpath === "/atribuir") {
      console.log("📥 Dados recebidos no servidor:", req.body);
      const {
        professorId,
        turmaId = null,
        alunos = [],
        templateId,
        comment = "",
      } = body || {};

      if (!professorId || !templateId || !Array.isArray(alunos) || alunos.length === 0)
        return res
          .status(400)
          .json({ error: "professorId, templateId e alunos[] são obrigatórios" });

      const tplDoc = await db.collection("medal_templates").doc(templateId).get();
      if (!tplDoc.exists)
        return res.status(404).json({ error: "Template não encontrado" });
      const template = tplDoc.data();

      const batch = db.batch();
      const now = new Date();
      const skipped = [];

      for (const studentId of alunos) {
        if (template.unique) {
          const dupSnap = await db
            .collection("medal_awards")
            .where("templateId", "==", templateId)
            .where("studentId", "==", studentId)
            .limit(1)
            .get();
          if (!dupSnap.empty) {
            skipped.push(studentId);
            continue;
          }
        }

        const awardRef = db.collection("medal_awards").doc();
        batch.set(awardRef, {
          templateId,
          studentId,
          professorId,
          turmaId,
          comment,
          awardedAt: now,
        });
      }

      await batch.commit();
      return res.status(200).json({
        ok: true,
        awarded: alunos.length - skipped.length,
        skippedCount: skipped.length,
        skipped,
      });
    }

   
    const deleteAwardMatch = subpath.match(/^\/aluno\/award\/([^/]+)$/);
    if (deleteAwardMatch) {
      const awardId = deleteAwardMatch[1];

      if (method === "DELETE") {
        await db.collection("medal_awards").doc(awardId).delete();
        return res.status(200).json({ ok: true, msg: "Medalha removida." });
      }

      if (method === "PUT") {
        const { newTemplateId } = body || {};
        if (!newTemplateId)
          return res.status(400).json({ error: "newTemplateId é obrigatório." });

        const tplDoc = await db.collection("medal_templates").doc(newTemplateId).get();
        if (!tplDoc.exists)
          return res.status(404).json({ error: "Template não encontrado." });

        await db.collection("medal_awards").doc(awardId).update({
          templateId: newTemplateId,
          updatedAt: new Date(),
        });

        const updated = await db.collection("medal_awards").doc(awardId).get();
        const tpl = tplDoc.data();

        return res.status(200).json({
          id: updated.id,
          ...updated.data(),
          template: { id: tplDoc.id, ...tpl },
        });
      }
    }

    
    const alunoMatch = subpath.match(/^\/aluno\/([^/]+)$/);
    if (method === "GET" && alunoMatch) {
      const alunoId = alunoMatch[1];
      const snap = await db
        .collection("medal_awards")
        .where("studentId", "==", alunoId)
        .orderBy("awardedAt", "desc")
        .get();

      const awards = [];
      for (const d of snap.docs) {
        const a = d.data();
        const tpl = await db.collection("medal_templates").doc(a.templateId).get();
        awards.push({
          id: d.id,
          ...a,
          template: tpl.exists ? { id: tpl.id, ...tpl.data() } : null,
        });
      }

      return res.status(200).json(awards);
    }

    return res.status(404).json({ error: "Rota não encontrada em /api/medalhas" });
  } catch (e) {
    console.error("api/medalhas error:", e);
    return res.status(500).json({ error: "Erro interno" });
  }
}

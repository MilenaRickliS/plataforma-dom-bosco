import admin from "../firebaseAdmin.js";

const db = admin.firestore();
const DEVICE_TOKEN = process.env.DEVICE_TOKEN;


function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}


async function parseBody(req) {
  try {
    if (typeof req.json === "function") return await req.json(); 
    if (req.body && typeof req.body === "object") return req.body;
    const raw = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
    });
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  allowCors(res);
  const { method } = req;
    const parts = req.url.split("/").filter(Boolean);
  const contadorId = parts[0]; 
  const action = parts[1] || null;

  if (!contadorId) return res.status(400).json({ error: "contadorId obrigatório" });

  try {
    
    if (method === "GET") {
      const ref = db.collection("contadores").doc(contadorId);
      const snap = await ref.get();
      if (!snap.exists) {
        await ref.set({
          status: "parado",
          total: 0,
          titulo: null,
          startedAt: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.status(200).json({ status: "parado", total: 0, titulo: null });
      }
      return res.status(200).json(snap.data());
    }

    
    if (method === "POST" && action === "start") {
      const body = await parseBody(req);
      const { titulo } = body;

      const ref = db.collection("contadores").doc(contadorId);
      await ref.set(
        {
          status: "contando",
          titulo: titulo || null,
          total: 0,
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(200).json({ ok: true });
    }

   
    if (method === "POST" && action === "finalize") {
      const body = await parseBody(req);
      const { titulo } = body;
      const ref = db.collection("contadores").doc(contadorId);

      await db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (!snap.exists) throw new Error("contador não encontrado");
        const d = snap.data();
        const endedAt = admin.firestore.FieldValue.serverTimestamp();

        const payloadRefeicao = {
          contadorId,
          titulo: titulo || d.titulo || "Sem título",
          total: d.total || 0,
          startedAt: d.startedAt || null,
          endedAt,
          criadoEm: endedAt,
        };
        t.set(db.collection("ref").doc(), payloadRefeicao);
        t.set(
          ref,
          {
            status: "parado",
            titulo: null,
            total: 0,
            startedAt: null,
            updatedAt: endedAt,
          },
          { merge: true }
        );
      });

      return res.status(200).json({ ok: true });
    }

    
    if (method === "POST" && action === "increment") {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (token !== DEVICE_TOKEN)
        return res.status(401).json({ error: "unauthorized" });

      const ref = db.collection("contadores").doc(contadorId);
      await db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        if (!snap.exists) throw new Error("contador não encontrado");
        const d = snap.data();
        if (d.status !== "contando") return;
        const novoTotal = (d.total || 0) + 1;
        t.set(
          ref,
          { total: novoTotal, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
      });

      return res.status(200).json({ ok: true });
    }

    if (method === "OPTIONS") return res.status(200).end();
    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("Erro handler contador:", err);
    return res.status(500).json({ error: err.message });
  }
}

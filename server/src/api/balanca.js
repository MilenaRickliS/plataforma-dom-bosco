import admin from "../firebaseAdmin.js"; 

const db = admin.firestore();

export default async function handler(req, res) {
 
  if (req.method === "POST") {
    try {
      const { pesoPrato, pesoTotal, pessoas } = req.body;
      const dataHora = new Date().toLocaleString("pt-BR");

      const registro = {
        dataHora,
        pesoPrato,
        pesoTotal,
        pessoas,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection("registrosBalanca").add(registro);
      console.log("✅ Novo registro salvo:", registro);

      return res.status(200).json({ sucesso: true, dados: registro });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      return res.status(500).json({ erro: "Falha ao salvar no Firestore" });
    }
  }

 
  else if (req.method === "GET") {
    try {
      const snapshot = await db
        .collection("registrosBalanca")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

      const registros = snapshot.docs.map((doc) => doc.data());
      return res.status(200).json(registros);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return res.status(500).json({ erro: "Erro ao buscar dados" });
    }
  }


  else {
    return res.status(405).json({ erro: "Método não permitido" });
  }
}

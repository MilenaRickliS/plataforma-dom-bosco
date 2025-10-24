import admin from "../firebaseAdmin.js";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  isEqual,
  isValid,
} from "date-fns";

const db = admin.firestore();

export default async function handler(req, res) {
  const refeicoesRef = db.collection("refeicoes");

  if (req.method === "GET") {
    try {
      const { tipo, inicio, fim } = req.query;

      console.log("📅 Tipo:", tipo, "Início:", inicio, "Fim:", fim);

      
      const dataInicio = inicio
        ? new Date(`${inicio}T00:00:00`)
        : new Date("2000-01-01T00:00:00");
      const dataFim = fim
        ? new Date(`${fim}T23:59:59`)
        : new Date("2100-12-31T23:59:59");

      
      let inicioPeriodo = dataInicio;
      let fimPeriodo = dataFim;

      if (tipo === "dia") {
        inicioPeriodo = startOfDay(dataInicio);
        fimPeriodo = endOfDay(dataFim);
      } else if (tipo === "mes") {
        inicioPeriodo = startOfMonth(dataInicio);
        fimPeriodo = endOfMonth(dataFim);
      } else if (tipo === "ano") {
        inicioPeriodo = startOfYear(dataInicio);
        fimPeriodo = endOfYear(dataFim);
      }

      console.log("🕒 Intervalo de:", inicioPeriodo, "até", fimPeriodo);

      const snapshot = await refeicoesRef.get();
      const registros = [];

      snapshot.forEach((doc) => {
        const r = doc.data();
        if (!r.data || typeof r.data !== "string") return;

        
        const partes = r.data.split(",")[0].trim().split("/");
        if (partes.length !== 3) return;

        const dataRegistro = new Date(
          `${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`
        );

        if (!isValid(dataRegistro)) return;

        
        if (
          (isAfter(dataRegistro, inicioPeriodo) &&
            isBefore(dataRegistro, fimPeriodo)) ||
          isEqual(dataRegistro, inicioPeriodo) ||
          isEqual(dataRegistro, fimPeriodo)
        ) {
          registros.push({
            id: doc.id,
            ...r,
            dataFormatada: dataRegistro,
          });
        }
      });

      console.log(`📦 ${registros.length} registros encontrados`);

      
      const agregados = {};
      registros.forEach((r) => {
        const dia = r.dataFormatada.toLocaleDateString("pt-BR");
        if (!agregados[dia]) agregados[dia] = 0;
        agregados[dia] += parseFloat(r.total) || 0;
      });

      
      const dataset = Object.entries(agregados)
        .map(([data, total]) => ({ data, total }))
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a.data.split("/").map(Number);
          const [diaB, mesB, anoB] = b.data.split("/").map(Number);
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        });

    
      const totalGeral = dataset.reduce((sum, d) => sum + d.total, 0);
      const media = dataset.length ? (totalGeral / dataset.length).toFixed(1) : 0;
      const maximo = dataset.length ? Math.max(...dataset.map((d) => d.total)) : 0;
      const minimo = dataset.length ? Math.min(...dataset.map((d) => d.total)) : 0;

      console.log("📊 Estatísticas:", { totalGeral, media, maximo, minimo });

      return res.status(200).json({
        success: true,
        registros,
        dataset,
        estatisticas: { totalGeral, media, maximo, minimo },
      });
    } catch (error) {
      console.error("❌ Erro ao gerar relatório:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
}

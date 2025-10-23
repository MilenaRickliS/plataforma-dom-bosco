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

     
      let dataInicio = inicio ? new Date(inicio) : new Date();
      let dataFim = fim ? new Date(fim) : new Date();

      
      if (tipo === "dia") {
        dataInicio = startOfDay(dataInicio);
        dataFim = endOfDay(dataFim);
      } else if (tipo === "mes") {
        dataInicio = startOfMonth(dataInicio);
        dataFim = endOfMonth(dataFim);
      } else if (tipo === "ano") {
        dataInicio = startOfYear(dataInicio);
        dataFim = endOfYear(dataFim);
      }

      const snapshot = await refeicoesRef.get();
      const registros = [];

      snapshot.forEach((doc) => {
        const r = doc.data();
        let dataRegistro = null;

        
        if (typeof r.data === "string") {
          const partes = r.data.split(",")[0].split("/");
          dataRegistro = new Date(
            `${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`
          );
        }

        
        else if (
          r.data &&
          typeof r.data === "object" &&
          r.data._seconds !== undefined
        ) {
          dataRegistro = new Date(r.data._seconds * 1000);
        }

       
        else if (r.data instanceof Date) {
          dataRegistro = r.data;
        }

        if (!dataRegistro || !isValid(dataRegistro)) return;

        
        if (
          (isAfter(dataRegistro, dataInicio) && isBefore(dataRegistro, dataFim)) ||
          isEqual(dataRegistro, dataInicio) ||
          isEqual(dataRegistro, dataFim)
        ) {
          registros.push({
            id: doc.id,
            ...r,
            dataFormatada: dataRegistro,
          });
        }
      });

      
      const agregados = {};
      registros.forEach((r) => {
        const dia = r.dataFormatada.toLocaleDateString("pt-BR");
        if (!agregados[dia]) agregados[dia] = 0;
        agregados[dia] += Number(r.total) || 0;
      });

      
      const dataset = Object.entries(agregados)
        .map(([data, total]) => ({
          data,
          total,
        }))
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a.data.split("/").map(Number);
          const [diaB, mesB, anoB] = b.data.split("/").map(Number);
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        });

     
      const totalGeral = dataset.reduce((sum, d) => sum + d.total, 0);
      const media = dataset.length
        ? (totalGeral / dataset.length).toFixed(1)
        : 0;
      const maximo = Math.max(...dataset.map((d) => d.total), 0);
      const minimo = dataset.length ? Math.min(...dataset.map((d) => d.total)) : 0;



      return res.status(200).json({
        success: true,
        registros,
        dataset,
        estatisticas: { totalGeral, media, maximo, minimo },
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      return res
        .status(500)
        .json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
}

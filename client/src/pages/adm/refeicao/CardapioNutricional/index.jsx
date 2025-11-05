import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getPrato, salvarPrato } from "../../../../services/pratos";

export default function CardapioNutricionalExcel() {
  const [lanches, setLanches] = useState([]);
  const [dadosNutricionais, setDadosNutricionais] = useState({});
  const [carregando, setCarregando] = useState(false);
  const API_KEY = "Y/uIQejo69/+NUV9E4tLPw==KL9DFeK7tLkqzFhE";

  // 🔄 Carrega cache local
  useEffect(() => {
    const cache = localStorage.getItem("dados_nutricionais_cache");
    if (cache) setDadosNutricionais(JSON.parse(cache));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "dados_nutricionais_cache",
      JSON.stringify(dadosNutricionais)
    );
  }, [dadosNutricionais]);

  // 📘 Lê Excel
  function lerExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const header = json[0].map((h) => h.toString().toLowerCase());
      const idxLanche = header.indexOf("lanche");

      if (idxLanche === -1) {
        alert("A planilha deve conter uma coluna chamada 'lanche'.");
        return;
      }

      const listaLanches = [
        ...new Set(json.slice(1).map((row) => row[idxLanche]).filter(Boolean)),
      ];
      setLanches(listaLanches);
    };
    reader.readAsArrayBuffer(file);
  }

  // 🍽️ Busca API ou banco
  async function buscarNutrientes(lanche, ingredientes) {
    setCarregando(true);

    // 1️⃣ Tenta pegar do banco
    const pratoSalvo = await getPrato(lanche);
    if (pratoSalvo) {
      alert(`🔁 Carregando informações do Firestore para "${lanche}"`);
      setDadosNutricionais((prev) => ({
        ...prev,
        [lanche]: [
          {
            calories: pratoSalvo.calorias,
            protein_g: pratoSalvo.proteina,
            carbohydrates_total_g: pratoSalvo.carboidratos,
            fat_total_g: pratoSalvo.gordura,
            manual: true,
          },
        ],
      }));
      setCarregando(false);
      return;
    }

    // 2️⃣ Se não existir, tenta API
    const query = ingredientes || lanche;
    try {
      const res = await fetch(
        `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(
          query
        )}`,
        { headers: { "X-Api-Key": API_KEY } }
      );
      const data = await res.json();

      if (!data || data.length === 0) {
        alert(
          `⚠️ Não encontrei informações para "${lanche}". Preencha manualmente abaixo.`
        );
        setDadosNutricionais((prev) => ({
          ...prev,
          [lanche]: [
            {
              calories: "",
              protein_g: "",
              carbohydrates_total_g: "",
              fat_total_g: "",
              manual: true,
            },
          ],
        }));
        return;
      }

      const info = data[0];
      setDadosNutricionais((prev) => ({
        ...prev,
        [lanche]: [
          {
            calories: info.calories,
            protein_g: info.protein_g,
            carbohydrates_total_g: info.carbohydrates_total_g,
            fat_total_g: info.fat_total_g,
            manual: false,
          },
        ],
      }));

      // Salva automaticamente
      await salvarPrato(lanche, {
        calorias: info.calories,
        proteina: info.protein_g,
        carboidratos: info.carbohydrates_total_g,
        gordura: info.fat_total_g,
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar informações nutricionais.");
    } finally {
      setCarregando(false);
    }
  }

  // ✏️ Atualiza valor editado
  function editarValor(lanche, campo, valor) {
    setDadosNutricionais((prev) => ({
      ...prev,
      [lanche]: [
        {
          ...prev[lanche][0],
          [campo]: valor,
        },
      ],
    }));
  }

  // 💾 Salvar manualmente no Firestore
  async function salvarManual(lanche) {
    const info = dadosNutricionais[lanche]?.[0];
    if (!info) return;

    await salvarPrato(lanche, {
      calorias: info.calories,
      proteina: info.protein_g,
      carboidratos: info.carbohydrates_total_g,
      gordura: info.fat_total_g,
    });
    alert(`✅ Prato "${lanche}" salvo manualmente no Firebase!`);
  }

  // 🧮 Totais
  function calcularTotais() {
    let total = { calorias: 0, proteina: 0, carb: 0, gordura: 0 };
    Object.values(dadosNutricionais).forEach((info) => {
      if (info && info[0]) {
        const i = info[0];
        total.calorias += Number(i.calories) || 0;
        total.proteina += Number(i.protein_g) || 0;
        total.carb += Number(i.carbohydrates_total_g) || 0;
        total.gordura += Number(i.fat_total_g) || 0;
      }
    });
    return total;
  }

  // 🧾 PDF
  function gerarPDF() {
    const doc = new jsPDF();
    autoTable(doc);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const total = calcularTotais();

    doc.setFillColor(33, 150, 243);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Relatório Nutricional do Cardápio", 20, 25);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dataAtual}`, 160, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Resumo Nutricional Total", 14, 55);
    doc.text(`Calorias: ${total.calorias.toFixed(2)} kcal`, 14, 65);
    doc.text(`Proteínas: ${total.proteina.toFixed(2)} g`, 14, 73);
    doc.text(`Carboidratos: ${total.carb.toFixed(2)} g`, 14, 81);
    doc.text(`Gorduras Totais: ${total.gordura.toFixed(2)} g`, 14, 89);

    const linhas = Object.entries(dadosNutricionais).map(([lanche, info]) => {
      const i = info[0] || {};
      return [
        lanche,
        i.calories || "-",
        i.protein_g || "-",
        i.carbohydrates_total_g || "-",
        i.fat_total_g || "-",
      ];
    });

    autoTable(doc, {
      startY: 100,
      head: [["Lanche", "Calorias", "Proteínas", "Carboidratos", "Gorduras Totais"]],
      body: linhas,
      headStyles: { fillColor: [33, 150, 243], textColor: 255 },
      theme: "grid",
      margin: { left: 10, right: 10 },
    });

    doc.save("Relatorio_Cardapio_Nutricional.pdf");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Analisador Nutricional com Firebase</h2>
      <input type="file" accept=".xlsx, .xls" onChange={lerExcel} />

      {lanches.map((lanche, i) => {
        const info = dadosNutricionais[lanche]?.[0] || {};
        return (
          <div
            key={i}
            style={{
              marginTop: 20,
              borderBottom: "1px solid #ccc",
              paddingBottom: 10,
            }}
          >
            <h3>{lanche}</h3>

            <button onClick={() => buscarNutrientes(lanche)}>
              🔍 Buscar informações nutricionais
            </button>

            <div style={{ marginTop: 10 }}>
              <label>Calorias (kcal): </label>
              <input
                type="number"
                value={info.calories || ""}
                onChange={(e) => editarValor(lanche, "calories", e.target.value)}
              />
              <br />

              <label>Proteínas (g): </label>
              <input
                type="number"
                value={info.protein_g || ""}
                onChange={(e) => editarValor(lanche, "protein_g", e.target.value)}
              />
              <br />

              <label>Carboidratos (g): </label>
              <input
                type="number"
                value={info.carbohydrates_total_g || ""}
                onChange={(e) =>
                  editarValor(lanche, "carbohydrates_total_g", e.target.value)
                }
              />
              <br />

              <label>Gorduras Totais (g): </label>
              <input
                type="number"
                value={info.fat_total_g || ""}
                onChange={(e) => editarValor(lanche, "fat_total_g", e.target.value)}
              />
            </div>

            <button
              onClick={() => salvarManual(lanche)}
              style={{
                marginTop: 8,
                background: "#4caf50",
                color: "white",
                padding: "6px 14px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              💾 Salvar prato manualmente
            </button>
          </div>
        );
      })}

      {carregando && <p>⏳ Consultando dados nutricionais...</p>}

      {Object.keys(dadosNutricionais).length > 0 && (
        <button
          onClick={gerarPDF}
          style={{
            marginTop: 20,
            background: "#2196f3",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          📄 Gerar PDF Completo
        </button>
      )}
    </div>
  );
}

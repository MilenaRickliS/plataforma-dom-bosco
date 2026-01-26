import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style_new.css";

import { IoIosArrowBack } from "react-icons/io";
import { FiDownload, FiCalendar, FiBarChart2 } from "react-icons/fi";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatoriosRefeicoes() {
  const BASE = "https://plataforma-dom-bosco-backend.vercel.app";

  const hoje = new Date().toLocaleDateString("en-CA");
  const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");

  const [dataInicio, setDataInicio] = useState(umaSemanaAtras);
  const [dataFim, setDataFim] = useState(hoje);

  const [dadosPeriodo, setDadosPeriodo] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [dadosDetalhados, setDadosDetalhados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [custoPorKg, setCustoPorKg] = useState("");

  
  const chartRef = useRef(null);

  const hojeISO = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

  const toNumberBR = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };

  const n2 = (v, d = 2) => {
    const num = Number(v);
    if (!Number.isFinite(num)) return (0).toFixed(d);
    return num.toFixed(d);
  };

  const brl = (v) => {
    const num = Number(v);
    const safe = Number.isFinite(num) ? num : 0;
    return safe.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const validarRelatorio = () => {
    if (!dataInicio || !dataFim) {
      alert("Preencha Data Inicial e Data Final.");
      return false;
    }
    if (!isISODate(dataInicio) || !isISODate(dataFim)) {
      alert("Datas inválidas. Use o formato YYYY-MM-DD.");
      return false;
    }
    if (dataInicio > hojeISO || dataFim > hojeISO) {
      alert("As datas não podem estar no futuro.");
      return false;
    }
    if (dataInicio > dataFim) {
      alert("A Data Inicial não pode ser maior que a Data Final.");
      return false;
    }

    if (String(custoPorKg || "").trim() !== "") {
      const custo = toNumberBR(custoPorKg);
      if (Number.isNaN(custo)) {
        alert("Custo por kg inválido. Digite apenas números (ex: 12.50).");
        return false;
      }
      if (custo < 0) {
        alert("Custo por kg não pode ser negativo.");
        return false;
      }
    }
    return true;
  };

  const buscarRelatorio = async () => {
    if (!validarRelatorio()) return;

    setLoading(true);
    try {
      const resp = await fetch(
        `${BASE}/api/pesagem?tipo=relatorio&inicio=${dataInicio}&fim=${dataFim}&custoPorKg=${encodeURIComponent(
          custoPorKg || ""
        )}`
      );

      const data = await resp.json();
      console.log("RELATORIO:", resp.status, data);

      if (!resp.ok) {
        const msg = data?.erro || data?.message || data?.details || data?.error || `HTTP ${resp.status}`;
        throw new Error(msg);
      }

      setDadosPeriodo(data.resumo || null);
      setDadosGrafico(Array.isArray(data.grafico) ? data.grafico : []);
      setDadosDetalhados(Array.isArray(data.detalhes) ? data.detalhes : []);
    } catch (err) {
      console.error(err);
      setDadosPeriodo(null);
      setDadosGrafico([]);
      setDadosDetalhados([]);
      alert("Não foi possível gerar o relatório.\n\n" + (err?.message || "Sem detalhes. Veja o console."));
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return {
      labels: dadosGrafico.map((d) => d.data),
      datasets: [
        {
          label: "Refeições (balança)",
          data: dadosGrafico.map((d) => d.quantidadeAuto || 0),
          backgroundColor: "rgba(58, 134, 255, 0.65)",
          borderColor: "rgba(58, 134, 255, 1)",
          borderWidth: 1.5,
          borderRadius: 8,
        },
        {
          label: "Refeições (manual)",
          data: dadosGrafico.map((d) => d.quantidadeManual || 0),
          backgroundColor: "rgba(255, 193, 7, 0.75)",
          borderColor: "rgba(255, 193, 7, 1)",
          borderWidth: 1.5,
          borderRadius: 8,
        },
      ],
    };
  }, [dadosGrafico]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Tendência diária de refeições" },
        tooltip: { enabled: true },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };
  }, []);


  const exportarPDFProfissional = async () => {
    if (!dadosPeriodo) {
      alert("Gere o relatório antes.");
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 14;

    const colors = {
      dark: [33, 37, 41],
      muted: [108, 117, 125],
      primary: [58, 134, 255],
      warn: [255, 193, 7],
      border: [230, 233, 236],
      bgSoft: [248, 249, 250],
    };

    const periodoTxt = `${dataInicio} a ${dataFim}`;
    const geradoEmTxt = new Date().toLocaleString("pt-BR");

    
    let chartImg = null;
    try {
      const chartInstance = chartRef?.current;
      
      const chart = chartInstance?.toBase64Image ? chartInstance : chartInstance?.chart;
      if (chart?.toBase64Image) chartImg = chart.toBase64Image("image/png", 1);
    } catch (e) {
      console.warn("Não foi possível gerar imagem do gráfico:", e);
    }

  
    const addHeader = (pageNumber) => {
     
      doc.setFillColor(...colors.bgSoft);
      doc.rect(0, 0, pageW, 18, "F");

     
      doc.setTextColor(...colors.dark);
      doc.setFontSize(12);
      doc.text("RELATÓRIO DE REFEIÇÕES", marginX, 11);

     
      doc.setFontSize(9);
      doc.setTextColor(...colors.muted);
      doc.text(`Período: ${periodoTxt}`, pageW - marginX, 11, { align: "right" });

  
      doc.setDrawColor(...colors.border);
      doc.line(marginX, 18, pageW - marginX, 18);

     
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text(`Página ${pageNumber}`, pageW - marginX, pageH - 8, { align: "right" });
      doc.text(`Gerado em ${geradoEmTxt}`, marginX, pageH - 8);
    };

    const ensureSpace = (currentY, needed) => {
      if (currentY + needed <= pageH - 18) return currentY;
      doc.addPage();
      addHeader(doc.internal.getNumberOfPages());
      return 24;
    };

   
    addHeader(1);
    let y = 26;

   
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.text("Configuração", marginX, y);
    y += 4;

    const custoTxt =
      String(custoPorKg || "").trim() === ""
        ? "Não informado"
        : `R$ ${String(custoPorKg).replace(".", ",")} / kg`;

    autoTable(doc, {
      startY: y,
      head: [["Campo", "Valor"]],
      body: [
        ["Data inicial", dataInicio],
        ["Data final", dataFim],
        ["Custo por kg (opcional)", custoTxt],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.2 },
      headStyles: { fillColor: colors.bgSoft, textColor: colors.dark },
      margin: { left: marginX, right: marginX },
    });

    y = doc.lastAutoTable.finalY + 8;

    
    const blocoResumo = (titulo, dados, tagColor) => {
      y = ensureSpace(y, 44);

      doc.setFontSize(11);
      doc.setTextColor(...colors.dark);
      doc.text(titulo, marginX, y);

      
      doc.setFillColor(...tagColor);
      doc.roundedRect(marginX + 50, y - 4.2, 28, 6.5, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("RESUMO", marginX + 64, y + 0.5, { align: "center" });

      y += 5;

      doc.setTextColor(...colors.dark);

      autoTable(doc, {
        startY: y,
        head: [["Indicador", "Valor"]],
        body: [
          ["Refeições totais", String(dados?.totalRefeicoes ?? 0)],
          ["Total servido (kg)", n2(dados?.totalKg ?? 0, 2)],
          ["Peso médio (kg)", n2(dados?.pesoMedio ?? 0, 3)],
          ["Custo por refeição", brl(dados?.custoPorRefeicao ?? 0)],
          ["Custo total", brl(dados?.custoTotal ?? 0)],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2.2 },
        headStyles: { fillColor: colors.bgSoft, textColor: colors.dark },
        margin: { left: marginX, right: marginX },
      });

      y = doc.lastAutoTable.finalY + 8;
    };

    blocoResumo("Balança (Automático)", dadosPeriodo.auto, colors.primary);
    blocoResumo("Manual", dadosPeriodo.manual, colors.warn);
    blocoResumo("Geral", dadosPeriodo.geral, colors.dark);

   
    y = ensureSpace(y, 70);
    doc.setFontSize(11);
    doc.setTextColor(...colors.dark);
    doc.text("Tendência diária (gráfico)", marginX, y);
    y += 4;

   
    doc.setDrawColor(...colors.border);
    doc.setFillColor(...colors.bgSoft);
    doc.roundedRect(marginX, y, pageW - marginX * 2, 62, 3, 3, "FD");

    if (chartImg) {
      
      const imgX = marginX + 4;
      const imgY = y + 4;
      const imgW = pageW - marginX * 2 - 8;
      const imgH = 54;
      doc.addImage(chartImg, "PNG", imgX, imgY, imgW, imgH);
    } else {
      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
      doc.text("Não foi possível incorporar o gráfico (imagem indisponível).", marginX + 6, y + 16);
    }

    y += 70;

   
    y = ensureSpace(y, 20);
    doc.setFontSize(11);
    doc.setTextColor(...colors.dark);
    doc.text("Detalhamento diário", marginX, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [[
        "Data",
        "Balança",
        "Manual",
        "Total",
        "Peso (kg)",
        "Médio (kg)"
      ]],
      body: (dadosDetalhados || []).map((d) => [
        d.data,
        String(d.refeicoesAuto ?? 0),
        String(d.refeicoesManual ?? 0),
        String(d.refeicoesGeral ?? 0),
        n2(d.pesoGeral ?? 0, 2),
        n2(d.pesoMedioGeral ?? 0, 3),
      ]),
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: colors.bgSoft, textColor: colors.dark },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: marginX, right: marginX },
      didDrawPage: () => {
        
        const p = doc.internal.getNumberOfPages();
        addHeader(p);
      },
    });

    doc.save(`relatorio-refeicoes_${dataInicio}_a_${dataFim}.pdf`);
  };

  return (
    <div className="relatorios-container">
      <div className="relatorios-header">
        <Link to="/inicio-refeicao2" className="voltar-btn">
          <IoIosArrowBack /> Voltar
        </Link>

        <div className="titulo-relatorios">
          <img src={logo} alt="Logo" />
          <h1>Central de Análise</h1>
        </div>
      </div>

      <div className="seletor-periodo">
        <div className="periodo-header">
          <FiCalendar size={24} />
          <h2>Selecione o Período</h2>
        </div>

        <div className="periodo-inputs">
          <div className="input-group">
            <label>Data Inicial</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Data Final</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
<br/>
          <div className="input-group" style={{ marginTop: 12 }}>
            <label>Custo por kg (R$/kg) (opcional)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="Ex: 12.50"
              value={custoPorKg}
              onChange={(e) => setCustoPorKg(e.target.value)}
            />
          </div>

          <button className="btn-buscar" onClick={buscarRelatorio} disabled={loading}>
            <FiBarChart2 /> {loading ? "Gerando..." : "Gerar Relatório"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-relatorio">Gerando relatório...</div>
      ) : dadosPeriodo ? (
        <div>
          <div className="resumo-periodo">
            <h2>Resumo do Período</h2>

            <div className="resumo-cards">
              <div className="resumo-card">
                <span className="resumo-label">Refeições (balança)</span>
                <span className="resumo-valor">{dadosPeriodo.auto.totalRefeicoes}</span>
              </div>
              <div className="resumo-card">
                <span className="resumo-label">Total servido (balança)</span>
                <span className="resumo-valor">{Number(dadosPeriodo.auto.totalKg).toFixed(2)} kg</span>
              </div>
              <div className="resumo-card">
                <span className="resumo-label">Peso médio (balança)</span>
                <span className="resumo-valor">{Number(dadosPeriodo.auto.pesoMedio).toFixed(3)} kg</span>
              </div>
              <div className="resumo-card">
                <span className="resumo-label">Custo por refeição (balança)</span>
                <span className="resumo-valor">R$ {Number(dadosPeriodo.auto.custoPorRefeicao).toFixed(2)}</span>
              </div>

              <div className="resumo-card resumo-card-manual">
                <span className="resumo-label">Refeições (manual)</span>
                <span className="resumo-valor">{dadosPeriodo.manual.totalRefeicoes}</span>
              </div>
              <div className="resumo-card resumo-card-manual">
                <span className="resumo-label">Total servido (manual)</span>
                <span className="resumo-valor">{Number(dadosPeriodo.manual.totalKg).toFixed(2)} kg</span>
              </div>
              <div className="resumo-card resumo-card-manual">
                <span className="resumo-label">Peso médio (manual)</span>
                <span className="resumo-valor">{Number(dadosPeriodo.manual.pesoMedio).toFixed(3)} kg</span>
              </div>
              <div className="resumo-card resumo-card-manual">
                <span className="resumo-label">Custo por refeição (manual)</span>
                <span className="resumo-valor">R$ {Number(dadosPeriodo.manual.custoPorRefeicao).toFixed(2)}</span>
              </div>

              <div className="resumo-card resumo-card-total">
                <span className="resumo-label">Refeições (total geral)</span>
                <span className="resumo-valor">{dadosPeriodo.geral.totalRefeicoes}</span>
              </div>
              <div className="resumo-card resumo-card-total">
                <span className="resumo-label">Total servido (geral)</span>
                <span className="resumo-valor">{Number(dadosPeriodo.geral.totalKg).toFixed(2)} kg</span>
              </div>
              <div className="resumo-card resumo-card-total">
                <span className="resumo-label">Peso médio (geral)</span>
                <span className="resumo-valor">{Number(dadosPeriodo.geral.pesoMedio).toFixed(3)} kg</span>
              </div>
              <div className="resumo-card resumo-card-total">
                <span className="resumo-label">Custo por refeição (geral)</span>
                <span className="resumo-valor">R$ {Number(dadosPeriodo.geral.custoPorRefeicao).toFixed(2)}</span>
              </div>
            </div>

            <button className="btn-exportar" onClick={exportarPDFProfissional}>
              <FiDownload /> Exportar PDF
            </button>
          </div>

          <div className="grafico-tendencia">
            <h2>Tendência Diária</h2>
            <div className="grafico-content" style={{ height: 320 }}>
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="tabela-detalhada">
            <h2>Dados Detalhados</h2>
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Refeições (balança)</th>
                    <th className="th-manual">Refeições (manual)</th>
                    <th>Total geral</th>
                    <th>Peso total (kg)</th>
                    <th>Peso médio (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosDetalhados.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.data}</td>
                      <td>{item.refeicoesAuto}</td>
                      <td className="td-manual">{item.refeicoesManual}</td>
                      <td>{item.refeicoesGeral}</td>
                      <td>{Number(item.pesoGeral || 0).toFixed(2)}</td>
                      <td>{Number(item.pesoMedioGeral || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="sem-dados">
          <p>Selecione um período e clique em “Gerar Relatório” para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from "react";
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

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatoriosRefeicoes() {
  const hoje = new Date().toLocaleDateString("en-CA"); 
  const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");

  const [dataInicio, setDataInicio] = useState(umaSemanaAtras);
  const [dataFim, setDataFim] = useState(hoje);

  const [dadosPeriodo, setDadosPeriodo] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [dadosDetalhados, setDadosDetalhados] = useState([]);
  const [loading, setLoading] = useState(false);


  const [custoPorKg, setCustoPorKg] = useState(""); 

  const relatorioRef = useRef(null);

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const BASE = "https://plataforma-dom-bosco-backend.vercel.app";
      const response = await fetch(
        `${BASE}/api/pesagem?tipo=relatorio&inicio=${dataInicio}&fim=${dataFim}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.erro || "Falha ao buscar relatório");
      }

      setDadosPeriodo(data.resumo || null);
      setDadosGrafico(Array.isArray(data.grafico) ? data.grafico : []);
      setDadosDetalhados(Array.isArray(data.detalhes) ? data.detalhes : []);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      setDadosPeriodo(null);
      setDadosGrafico([]);
      setDadosDetalhados([]);
      alert("Não foi possível gerar o relatório. Verifique o backend / datas.");
    } finally {
      setLoading(false);
    }
  };

  
  const custoCalculado = (() => {
    if (!dadosPeriodo) return 0;

    if (custoPorKg.trim() === "") return 0;
    const totalKg = Number(dadosPeriodo.totalKg || 0);

    const cpk = custoPorKg === "" ? null : Number(String(custoPorKg).replace(",", "."));
    if (cpk !== null && Number.isFinite(cpk)) {
      return totalKg * cpk;
    }

   
    const backend = Number(dadosPeriodo.custoEstimado || 0);
    return Number.isFinite(backend) ? backend : 0;
  })();

  
  const exportarPDF = async () => {
    try {
      if (!relatorioRef.current) {
        alert("Gere o relatório antes de exportar.");
        return;
      }

      const element = relatorioRef.current;

     
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

     
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

    
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }

      const nome = `relatorio-refeicoes_${dataInicio}_a_${dataFim}.pdf`;
      pdf.save(nome);
    } catch (err) {
      console.error(err);
      alert("Falha ao exportar PDF. Veja o console.");
    }
  };

  const chartData = {
    labels: dadosGrafico.map((d) => d.data),
    datasets: [
      {
        label: "Quantidade de Refeições",
        data: dadosGrafico.map((d) => d.quantidade),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Tendência Diária de Refeições" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 50 },
      },
    },
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
          <div className="input-group">
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

          <button className="btn-buscar" onClick={buscarRelatorio}>
            <FiBarChart2 /> Gerar Relatório
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-relatorio">Gerando relatório...</div>
      ) : dadosPeriodo ? (
        <div ref={relatorioRef}>
          <div className="resumo-periodo">
            <h2>Resumo do Período</h2>

            <div className="resumo-cards">
              <div className="resumo-card">
                <span className="resumo-label">Total de Refeições</span>
                <span className="resumo-valor">{dadosPeriodo.totalRefeicoes}</span>
              </div>

              <div className="resumo-card">
                <span className="resumo-label">Total Servido</span>
                <span className="resumo-valor">{Number(dadosPeriodo.totalKg || 0).toFixed(2)} kg</span>
              </div>

              <div className="resumo-card">
                <span className="resumo-label">Peso Médio</span>
                <span className="resumo-valor">{Number(dadosPeriodo.pesoMedio || 0).toFixed(3)} kg</span>
              </div>

              <div className="resumo-card">
                <span className="resumo-label">Custo Estimado</span>
                <span className="resumo-valor">R$ {custoCalculado.toFixed(2)}</span>
                {custoPorKg !== "" && (
                  <small style={{ opacity: 0.75, display: "block", marginTop: 6 }}>
                    (calculado com R$/kg informado)
                  </small>
                )}
              </div>
            </div>

            <button className="btn-exportar" onClick={exportarPDF}>
              <FiDownload /> Exportar PDF
            </button>
          </div>

          <div className="grafico-tendencia">
            <h2>Tendência Diária</h2>
            <div className="grafico-content">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="tabela-detalhada">
            <h2>Dados Detalhados</h2>
            <div className="tabela-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Refeições</th>
                    <th>Peso Total (kg)</th>
                    <th>Peso Médio (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosDetalhados.map((item, index) => (
                    <tr key={index}>
                      <td>{item.data}</td>
                      <td>{item.refeicoes}</td>
                      <td>{Number(item.pesoTotal || 0).toFixed(2)}</td>
                      <td>{Number(item.pesoMedio || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="sem-dados">
          <p>Selecione um período e clique em "Gerar Relatório" para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
}

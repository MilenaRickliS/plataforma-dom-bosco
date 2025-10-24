import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Relatorios() {
  const [dataset, setDataset] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [tipo, setTipo] = useState("dia");
  const [mensagem, setMensagem] = useState("");
  const [grafico, setGrafico] = useState("barras");
  const [carregando, setCarregando] = useState(false);
  const relatorioRef = useRef(null);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  
  const carregarRelatorio = async () => {
    setCarregando(true);
    setMensagem("");
    try {
      const params = new URLSearchParams();
      params.append("tipo", tipo);
      if (inicio) params.append("inicio", inicio);
      if (fim) params.append("fim", fim);

      const res = await fetch(`${API_URL}/api/relatorios?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setDataset(data.dataset || []);
        setEstatisticas(data.estatisticas || {});
        if (!data.dataset?.length) {
          setMensagem("Nenhum dado encontrado para o período selecionado 📅");
        }
      } else {
        setMensagem("Erro ao gerar relatório.");
      }
    } catch (err) {
      console.error("❌ Erro ao gerar relatório:", err);
      setMensagem("Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, []); 

  
  const exportarPDF = async () => {
    if (!relatorioRef.current) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const elemento = relatorioRef.current;

   
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  
    pdf.setFontSize(16);
    pdf.text(`Relatório - ${tipo.toUpperCase()}`, 10, 10);

   
    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    pdf.save(`Relatorio_${tipo}_${new Date().toLocaleDateString("pt-BR")}.pdf`);
  };

  
  const dadosOrdenados = [...dataset].sort(
    (a, b) =>
      new Date(a.data.split("/").reverse().join("-")) -
      new Date(b.data.split("/").reverse().join("-"))
  );

  return (
    <div className="relatorios-container">
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Relatórios</h2>
      </div>

      
      <div className="filtros-relatorios">
        <label>
          Tipo:
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            disabled={carregando}
          >
            <option value="dia">Diário</option>
            <option value="mes">Mensal</option>
            <option value="ano">Anual</option>
          </select>
        </label>

        <label>
          Início:
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            disabled={carregando}
          />
        </label>

        <label>
          Fim:
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            disabled={carregando}
          />
        </label>

        <button onClick={carregarRelatorio} disabled={carregando}>
          🔍 {carregando ? "Carregando..." : "Gerar"}
        </button>

        <button onClick={exportarPDF} disabled={!dataset.length}>
          📄 Exportar PDF
        </button>
      </div>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      
      <div ref={relatorioRef} className="relatorio-painel">
        {dataset.length > 0 && (
          <>
            <div className="resumo-relatorio">
              <h3>📊 Estatísticas do Período</h3>
              <ul>
                <li>
                  <strong>Total Geral:</strong>{" "}
                  {estatisticas.totalGeral?.toFixed?.(2) || 0}
                </li>
                <li>
                  <strong>Média:</strong> {estatisticas.media || 0}
                </li>
                <li>
                  <strong>Pico Máximo:</strong> {estatisticas.maximo || 0}
                </li>
                <li>
                  <strong>Menor Valor:</strong> {estatisticas.minimo || 0}
                </li>
              </ul>
            </div>

            <div className="tipo-grafico">
              <button
                onClick={() => setGrafico("barras")}
                className={grafico === "barras" ? "ativo" : ""}
              >
                📊 Barras
              </button>
              <button
                onClick={() => setGrafico("linhas")}
                className={grafico === "linhas" ? "ativo" : ""}
              >
                📈 Linhas
              </button>
            </div>

            <div className="grafico-relatorio">
              <ResponsiveContainer width="95%" height={400}>
                {grafico === "barras" ? (
                  <BarChart data={dadosOrdenados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3f51b5" />
                  </BarChart>
                ) : (
                  <LineChart data={dadosOrdenados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3f51b5"
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

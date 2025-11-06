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

export default function RelatoriosCiclos() {
  const [dataset, setDataset] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [grafico, setGrafico] = useState("barras");
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState("semanal");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [valorUnitario, setValorUnitario] = useState(8.5); 
  const relatorioRef = useRef(null);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  
  const carregarRelatorio = async () => {
    setCarregando(true);
    setMensagem("");

    try {
      const res = await fetch(`${API_URL}/api/pesagem?tipo=relatorio`);
      const data = await res.json();

      if (data.sucesso) {
        let dados = data.dataset;

        
        const hoje = new Date();
        let dataInicioFiltro = new Date();
        if (filtro === "semanal") dataInicioFiltro.setDate(hoje.getDate() - 7);
        else if (filtro === "mensal") dataInicioFiltro.setMonth(hoje.getMonth() - 1);
        else if (filtro === "anual") dataInicioFiltro.setFullYear(hoje.getFullYear() - 1);
        else if (filtro === "personalizado" && inicio && fim) {
          dataInicioFiltro = new Date(inicio);
          hoje.setTime(new Date(fim).getTime());
        }

       
        dados = dados.filter((c) => {
          const dataCiclo = new Date(c.dataFim || c.dataInicio);
          return dataCiclo >= dataInicioFiltro && dataCiclo <= hoje;
        });

        
        const pesoTotal = dados.reduce((a, b) => a + (b.peso || 0), 0);
        const pessoasTotal = dados.reduce((a, b) => a + (b.total || 0), 0);
        const valorTotal = pessoasTotal * valorUnitario;
        const mediaGastoAluno = pessoasTotal ? valorTotal / pessoasTotal : 0;

        setDataset(dados);
        setEstatisticas({
          ...data.estatisticas,
          pesoTotal,
          pessoasTotal,
          valorTotal,
          mediaGastoAluno,
        });

        if (!dados.length) setMensagem("📅 Nenhum ciclo encontrado no período.");
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
  }, [filtro, inicio, fim]);

  
  const exportarPDF = async () => {
    if (!relatorioRef.current) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const canvas = await html2canvas(relatorioRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.text("Relatório de Ciclos e Registros", 10, 10);
    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    pdf.save(`Relatorio_${filtro}_${new Date().toLocaleDateString("pt-BR")}.pdf`);
  };

  
  const dadosOrdenados = [...dataset].sort(
    (a, b) => new Date(a.data) - new Date(b.data)
  );

  return (
    <div className="relatorios-container">
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Relatório</h2>
      </div>

      <div className="filtros-relatorios">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          disabled={carregando}
        >
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
          <option value="anual">Anual</option>
          <option value="personalizado">Por período</option>
        </select>

        {filtro === "personalizado" && (
          <>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              disabled={carregando}
            />
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              disabled={carregando}
            />
          </>
        )}

        <label className="valor-unitario">
          💰 Valor por refeição:
          <input
            type="number"
            step="0.01"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(Number(e.target.value))}
            min="0"
            style={{ width: "80px", marginLeft: "5px" }}
          />
        </label>

        <button onClick={carregarRelatorio} disabled={carregando}>
          🔄 {carregando ? "Atualizando..." : "Atualizar"}
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
              <h3>📈 Estatísticas Gerais</h3>
              <ul>
                <li>
                  <strong>Total de Ciclos:</strong> {estatisticas.totalCiclos}
                </li>
                <li>
                  <strong>Total de Registros:</strong> {estatisticas.totalRegistros}
                </li>
                <li>
                  <strong>Total de Pessoas:</strong> {estatisticas.pessoasTotal}
                </li>
                <li>
                  <strong>Peso Total:</strong> {estatisticas.pesoTotal?.toFixed(2)} kg
                </li>
                <li>
                  <strong>💰 Valor Gasto Total:</strong>{" "}
                  R$ {estatisticas.valorTotal?.toFixed(2)}
                </li>
                <li>
                  <strong>🎯 Média Gasto por Aluno:</strong>{" "}
                  R$ {estatisticas.mediaGastoAluno?.toFixed(2)}
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
                    <Bar dataKey="peso" fill="#3f51b5" name="Peso Total (kg)" />
                    <Bar dataKey="total" fill="#00b894" name="Total de Pessoas" />
                  </BarChart>
                ) : (
                  <LineChart data={dadosOrdenados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#3f51b5"
                      strokeWidth={2}
                      name="Peso Total (kg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#00b894"
                      strokeWidth={2}
                      name="Total de Pessoas"
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

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

    console.log("🚀 Iniciando carregamento de relatório...");

    try {
      const res = await fetch(`${API_URL}/api/pesagem?tipo=relatorio`);
      console.log("🌐 Resposta HTTP:", res.status);

      if (!res.ok) {
        setMensagem("Erro ao buscar dados do servidor.");
        throw new Error("HTTP " + res.status);
      }

      const data = await res.json();
      console.log("📦 Dados recebidos:", data);

      if (!data.sucesso || !data.dataset) {
        console.warn("⚠️ Nenhum dataset válido:", data);
        setMensagem("Nenhum dado encontrado.");
        return;
      }

      let dados = data.dataset;

      const agora = new Date();
      let dataInicioFiltro = new Date(agora);
      let dataFimFiltro = new Date(agora);

      if (filtro === "semanal") {
        dataInicioFiltro.setDate(dataFimFiltro.getDate() - 8);
      } else if (filtro === "mensal") {
        dataInicioFiltro.setMonth(dataFimFiltro.getMonth() - 1);
      } else if (filtro === "anual") {
        dataInicioFiltro.setFullYear(dataFimFiltro.getFullYear() - 1);
      } else if (filtro === "personalizado" && inicio && fim) {
        dataInicioFiltro = new Date(inicio);
        dataFimFiltro = new Date(fim);
      }

      console.log("📅 Filtro de:", dataInicioFiltro, "até", dataFimFiltro);
      console.table(data.dataset);

      dataInicioFiltro.setHours(0, 0, 0, 0);
      dataFimFiltro.setDate(dataFimFiltro.getDate() + 1);
      dataFimFiltro.setHours(23, 59, 59, 999);

      dados = dados.filter((c) => {
        const raw = c.dataFim || c.dataInicio || c.data;
        if (!raw) return false;

        let dataCiclo;
        if (typeof raw === "object" && (raw.seconds || raw._seconds)) {
          const s = raw.seconds || raw._seconds;
          dataCiclo = new Date(s * 1000);
        } else if (raw instanceof Date) {
          dataCiclo = raw;
        } else if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
          dataCiclo = new Date(raw);
        } else if (typeof raw === "string") {
          const regex =
            /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})(?::(\d{2}))?$/;
          const m = raw.match(regex);
          if (m) {
            const [, dia, mes, ano, hora, min, seg] = m;
            dataCiclo = new Date(
              Number(ano),
              Number(mes) - 1,
              Number(dia),
              Number(hora),
              Number(min),
              Number(seg) || 0
            );
          }
        }

        if (!dataCiclo || isNaN(dataCiclo.getTime())) return false;

        const dataInicioAjustada = new Date(dataInicioFiltro);
        dataInicioAjustada.setHours(0, 0, 0, 0);
        const dataFimAjustada = new Date(dataFimFiltro);
        dataFimAjustada.setHours(23, 59, 59, 999);

        const dentro =
          dataCiclo >= dataInicioAjustada && dataCiclo <= dataFimAjustada;

        console.log(
          "🧩 Comparando:",
          raw,
          "→",
          dataCiclo.toLocaleString("pt-BR"),
          "| Início:",
          dataInicioAjustada.toLocaleString("pt-BR"),
          "| Fim:",
          dataFimAjustada.toLocaleString("pt-BR"),
          "| ✅ Dentro?",
          dentro
        );

        return dentro;
      });

      console.log("✅ Após filtro:", dados);

      if (dados.length === 0) {
        setMensagem("📅 Nenhum ciclo encontrado no período.");
        setDataset([]);
        return;
      }

      const pesoTotal = dados.reduce((a, b) => a + (b.peso || 0), 0);
      const pessoasTotal = dados.reduce((a, b) => a + (b.total || 0), 0);
      const valorTotal = pessoasTotal * Number(valorUnitario || 0);
      const mediaGastoAluno = pessoasTotal ? valorTotal / pessoasTotal : 0;

      setDataset(dados);
     setEstatisticas((prev) => ({
        ...prev, 
        totalCiclos: dataset.length,
        totalRegistros: dataset.length,
        pesoTotal,
        pessoasTotal,
        valorTotal,
        mediaGastoAluno,
        _updateFlag: Math.random(), 
      }));


      console.log("📊 Estatísticas:", { pesoTotal, pessoasTotal, valorTotal });
    } catch (err) {
      console.error("❌ Erro inesperado:", err);
      setMensagem("Erro ao gerar relatório.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, [filtro, inicio, fim]);

  useEffect(() => {
    if (dataset.length === 0) return;

    const pesoTotal = dataset.reduce((a, b) => a + (b.peso || 0), 0);
    const pessoasTotal = dataset.reduce((a, b) => a + (b.total || 0), 0);
    const valorTotal = pessoasTotal * Number(valorUnitario || 0);
    const mediaGastoAluno = pessoasTotal ? valorTotal / pessoasTotal : 0;

    setEstatisticas({
      totalCiclos: dataset.length,
      totalRegistros: dataset.length,
      pesoTotal,
      pessoasTotal,
      valorTotal,
      mediaGastoAluno,
    });

    console.log("💰 Estatísticas recalculadas com novo valorUnitario:", valorUnitario);
  }, [valorUnitario, dataset]);

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
          onChange={(e) => setValorUnitario(Number(e.target.value) || 0)}
          onBlur={() => setValorUnitario((v) => Number(v.toFixed(2)))}
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

      <div ref={relatorioRef} className="relatorio-painel" key={estatisticas._updateFlag}>

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
                  <strong>Peso Total:</strong>{" "}
                  {(estatisticas.pesoTotal || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  kg
                </li>
                <li>
                  <strong>💰 Valor Gasto Total:</strong>{" "}
                  R${" "}
                  {(estatisticas.valorTotal || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </li>
                <li>
                  <strong>🎯 Média Gasto por Aluno:</strong>{" "}
                  R${" "}
                  {(estatisticas.mediaGastoAluno || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
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
                    <XAxis dataKey="data" tickFormatter={(d) => d.split(",")[0]} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="peso" fill="#2D408E" name="Peso Total (kg)" />
                    <Bar dataKey="total" fill="#0DB39E" name="Total de Pessoas" />
                  </BarChart>
                ) : (
                  <LineChart data={dadosOrdenados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" tickFormatter={(d) => d.split(",")[0]} />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#2D408E"
                      strokeWidth={2}
                      name="Peso Total (kg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0DB39E"
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

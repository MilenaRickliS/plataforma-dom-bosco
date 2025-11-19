import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style_new.css";
import { IoIosArrowBack } from "react-icons/io";
import { FiDownload, FiCalendar, FiBarChart2 } from "react-icons/fi";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RelatoriosRefeicoes() {
  const hoje = new Date().toISOString().split('T')[0];
  const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [dataInicio, setDataInicio] = useState(umaSemanaAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [dadosPeriodo, setDadosPeriodo] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [dadosDetalhados, setDadosDetalhados] = useState([]);
  const [loading, setLoading] = useState(false);
  const relatorioRef = useRef(null);

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/refeicoes/relatorio?inicio=${dataInicio}&fim=${dataFim}`);
      const data = await response.json();
      
      setDadosPeriodo(data.resumo);
      setDadosGrafico(data.grafico);
      setDadosDetalhados(data.detalhes);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      const diasDiferenca = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
      
      const dadosMock = [];
      let totalRefeicoesMock = 0;
      let totalKgMock = 0;
      
      for (let i = 0; i < diasDiferenca; i++) {
        const dataAtual = new Date(inicio);
        dataAtual.setDate(inicio.getDate() + i);
        
        const refeicoes = Math.floor(Math.random() * (200 - 120) + 120);
        const pesoTotal = refeicoes * (0.550 + Math.random() * 0.100); 
        const pesoMedio = pesoTotal / refeicoes;
        
        totalRefeicoesMock += refeicoes;
        totalKgMock += pesoTotal;
        
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        
        dadosMock.push({
          dataCompleta: `${dia}/${mes}/${ano}`,
          dataGrafico: `${dia}/${mes}`,
          refeicoes: refeicoes,
          pesoTotal: pesoTotal,
          pesoMedio: pesoMedio
        });
      }
      
      const pesoMedioGeral = totalKgMock / totalRefeicoesMock;
      const custoEstimadoMock = totalRefeicoesMock * 8.50;
      
      setDadosPeriodo({
        totalRefeicoes: totalRefeicoesMock,
        totalKg: totalKgMock,
        pesoMedio: pesoMedioGeral,
        custoEstimado: custoEstimadoMock
      });
      
      setDadosGrafico(dadosMock.map(d => ({
        data: d.dataGrafico,
        quantidade: d.refeicoes,
        peso: d.pesoTotal
      })));
      
      setDadosDetalhados(dadosMock.map(d => ({
        data: d.dataCompleta,
        refeicoes: d.refeicoes,
        pesoTotal: d.pesoTotal,
        pesoMedio: d.pesoMedio
      })));
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async () => {
    // Implementar exportação para PDF
    alert('teste');
  };

  const chartData = {
    labels: dadosGrafico.map(d => d.data),
    datasets: [
      {
        label: 'Quantidade de Refeições',
        data: dadosGrafico.map(d => d.quantidade),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendência Diária de Refeições'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50
        }
      }
    }
  };

  return (
    <div className="relatorios-container">
      <div className="relatorios-header">
        <Link to="/refeicoes-dashboard" className="voltar-btn">
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
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Data Final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
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
          {/* Resumo do Período */}
          <div className="resumo-periodo">
            <h2>Resumo do Período</h2>
            <div className="resumo-cards">
              <div className="resumo-card">
                <span className="resumo-label">Total de Refeições</span>
                <span className="resumo-valor">{dadosPeriodo.totalRefeicoes}</span>
              </div>
              <div className="resumo-card">
                <span className="resumo-label">Total Servido</span>
                <span className="resumo-valor">{dadosPeriodo.totalKg.toFixed(2)} kg</span>
              </div>
              <div className="resumo-card">
                <span className="resumo-label">Peso Médio</span>
                <span className="resumo-valor">{dadosPeriodo.pesoMedio.toFixed(3)} kg</span>
              </div>
              <div className="resumo-card">
                <span className="resumo-label">Custo Estimado</span>
                <span className="resumo-valor">R$ {dadosPeriodo.custoEstimado.toFixed(2)}</span>
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
                      <td>{item.pesoTotal.toFixed(2)}</td>
                      <td>{item.pesoMedio.toFixed(3)}</td>
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineScale } from "react-icons/md";
import { TbWeight, TbChartPie4 } from "react-icons/tb";
import { FiSettings, FiActivity, FiClock } from "react-icons/fi";
import { BiLineChart } from "react-icons/bi";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard2() {
  const [totalPessoas, setTotalPessoas] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [pesoMedio, setPesoMedio] = useState(0);

  const [statusEstacao, setStatusEstacao] = useState('offline');

 
  const [contagemAtiva, setContagemAtiva] = useState(false);
  const [inicioContagem, setInicioContagem] = useState(null); 

  const [dadosHorarios, setDadosHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDadosDashboard();
    const interval = setInterval(buscarDadosDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatHora = (valor) => {
    if (!valor) return "--:--";

    const d = new Date(valor);
    if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    const m = String(valor).match(/(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;

    return "--:--";
    };


  const buscarDadosDashboard = async () => {
  setLoading(true);
  try {
    const BASE = "https://plataforma-dom-bosco-backend.vercel.app";
    const response = await fetch(`${BASE}/api/pesagem?tipo=dashboardHoje`);
    const data = await response.json();

    const pessoas = Number(data.pessoasHoje ?? 0);
    const kg = Number(data.pesoHoje ?? 0);
    const medio = Number(data.pesoMedioHoje ?? (pessoas > 0 ? kg / pessoas : 0));

    setTotalPessoas(pessoas);
    setTotalKg(kg);
    setPesoMedio(medio);

    setStatusEstacao(data.statusEstacao ?? "offline");
    setDadosHorarios(Array.isArray(data.evolucaoHoraria) ? data.evolucaoHoraria : []);

    setContagemAtiva(!!data.contagemAtiva);
    setInicioContagem(data.inicioContagem ?? null);

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);

    
    setStatusEstacao("offline");
    setDadosHorarios([]);
  } finally {
    setLoading(false);
  }
};

const labels = dadosHorarios.length ? dadosHorarios.map(d => d.hora) : ["--"];
const valores = dadosHorarios.length ? dadosHorarios.map(d => d.quantidade) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Refeições (Pessoas) por Hora',
        data: valores,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Evolução de Refeições ao Longo do Dia' }
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Link to="/inicio-adm" className="voltar-btn">
          <IoIosArrowBack /> Voltar
        </Link>
      </div>

      <div className="titulo-e-nav">
        <div className="titulo-dashboard">
          <img src={logo} alt="Logo" />
          <h1>Dashboard de Refeições</h1>
        </div>
        <div className="nav-links">
          <Link to="/relatorios-refeicao" className="nav-link">
            <BiLineChart /> Relatórios
          </Link>
          <Link to="/cardapio-nutricional" className="nav-link">
            <TbChartPie4 /> Cardápio Nutricional
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-dashboard">Carregando dados...</div>
      ) : (
        <>
          <div className="widgets-grid">
           
            <div className={`widget widget-primary ${contagemAtiva ? 'widget-online' : 'widget-offline'}`}>
              <div className="widget-icon">
                <FiClock />
              </div>
              <div className="widget-content">
                <h3>Sessão de Contagem</h3>
                <p className="widget-value">{contagemAtiva ? 'Ativa' : 'Parada'}</p>
                <span className="widget-label">
                  Início: {formatHora(inicioContagem)} • Pessoas: {totalPessoas}
                </span>
              </div>
            </div>

           
            <div className="widget widget-success">
              <div className="widget-icon">
                <FiActivity />
              </div>
              <div className="widget-content">
                <h3>Total de Pessoas</h3> 
                <p className="widget-value">{totalPessoas}</p>
                <span className="widget-label">Hoje</span>
              </div>
            </div>

         
            <div className="widget widget-info">
              <div className="widget-icon">
                <MdOutlineScale />
              </div>
              <div className="widget-content">
                <h3>Total Servido</h3> 
                <p className="widget-value">{Number(totalKg).toFixed(2)} kg</p>
                <span className="widget-label">Hoje</span>
              </div>
            </div>
            <div className="widget widget-info">
                <div className="widget-icon">
                    <TbWeight />
                </div>
                <div className="widget-content">
                    <h3>Peso Médio por Refeição</h3>
                    <p className="widget-value">{pesoMedio.toFixed(3)} kg</p>
                    <span className="widget-label">Hoje</span>
                </div>
                </div>

           
            <div className={`widget widget-status ${statusEstacao === 'online' ? 'widget-online' : 'widget-offline'}`}>
              <div className="widget-icon">
                <FiActivity />
              </div>
              <div className="widget-content">
                <h3>Estação de Pesagem</h3> 
                <p className="widget-value">{statusEstacao === 'online' ? 'Online' : 'Offline'}</p>
                <span className="widget-label">Status atual</span>
              </div>
            </div>
          </div>

          <div className="grafico-container">
            <div className="grafico-header">
              <h2>Evolução Horária de Refeições</h2> 
            </div>
            <div className="grafico-content">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

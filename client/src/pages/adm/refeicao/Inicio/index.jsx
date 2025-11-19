import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineRestaurantMenu, MdOutlineScale } from "react-icons/md";
import { TbWeight } from "react-icons/tb";
import { FiSettings, FiActivity } from "react-icons/fi";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [totalRefeicoes, setTotalRefeicoes] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [pesoMedio, setPesoMedio] = useState(0);
  const [statusEstacao, setStatusEstacao] = useState('online');
  const [dadosHorarios, setDadosHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDadosDashboard();
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(buscarDadosDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const buscarDadosDashboard = async () => {
    try {
      setLoading(true);
      // Integração com API/IoT
      const response = await fetch('/api/refeicoes/dashboard/hoje');
      const data = await response.json();
      
      setTotalRefeicoes(data.totalRefeicoes || 0);
      setTotalKg(data.totalKg || 0);
      setPesoMedio(data.pesoMedio || 0);
      setStatusEstacao(data.statusEstacao || 'offline');
      setDadosHorarios(data.evolucaoHoraria || []);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Dados para teste
      setTotalRefeicoes(145);
      setTotalKg(87.3);
      setPesoMedio(0.602);
      setStatusEstacao('online');
      setDadosHorarios([
        { hora: '08:00', quantidade: 12 },
        { hora: '09:00', quantidade: 28 },
        { hora: '10:00', quantidade: 35 },
        { hora: '11:00', quantidade: 45 },
        { hora: '12:00', quantidade: 25 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: dadosHorarios.map(d => d.hora),
    datasets: [
      {
        label: 'Refeições por Hora',
        data: dadosHorarios.map(d => d.quantidade),
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
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução de Refeições ao Longo do Dia'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
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
          <Link to="/configuracoes-refeicao" className="nav-link">
            <FiSettings /> Configurações
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-dashboard">Carregando dados...</div>
      ) : (
        <>
          
          <div className="widgets-grid">
            {/* Widget 1: Total de Refeições */}
            <div className="widget widget-primary">
              <div className="widget-icon">
                <MdOutlineRestaurantMenu />
              </div>
              <div className="widget-content">
                <h3>Total de Refeições</h3>
                <p className="widget-value">{totalRefeicoes}</p>
                <span className="widget-label">Hoje</span>
              </div>
            </div>

            {/* Widget 2: Total de KG */}
            <div className="widget widget-success">
              <div className="widget-icon">
                <MdOutlineScale />
              </div>
              <div className="widget-content">
                <h3>Total Servido</h3>
                <p className="widget-value">{totalKg.toFixed(2)} kg</p>
                <span className="widget-label">Hoje</span>
              </div>
            </div>

            {/* Widget 3: Peso Médio */}
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

            {/* Widget 4: Status da Estação */}
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

          {/* Widget 5: Gráfico de Evolução */}
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
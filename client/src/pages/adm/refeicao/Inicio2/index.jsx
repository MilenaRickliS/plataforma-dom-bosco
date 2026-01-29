import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineScale, MdRestaurantMenu } from "react-icons/md";
import { TbWeight, TbChartPie4 } from "react-icons/tb";
import { FiSettings, FiActivity, FiClock } from "react-icons/fi";
import { BiLineChart } from "react-icons/bi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard2() {
  const BASE = "https://plataforma-dom-bosco-backend.vercel.app";


  const [totalPessoas, setTotalPessoas] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [pesoMedio, setPesoMedio] = useState(0);

  const [statusEstacao, setStatusEstacao] = useState("offline");
  const [contagemAtiva, setContagemAtiva] = useState(false);
  const [inicioContagem, setInicioContagem] = useState(null);

  const [dadosHorarios, setDadosHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [manualHojePessoas, setManualHojePessoas] = useState(0);
  const [manualHojeKg, setManualHojeKg] = useState(0);
  const [manualHojeMedio, setManualHojeMedio] = useState(0);

  const [geralHojePessoas, setGeralHojePessoas] = useState(0);
  const [geralHojeKg, setGeralHojeKg] = useState(0);
  const [geralHojeMedio, setGeralHojeMedio] = useState(0);


  const pad2 = (n) => String(n).padStart(2, "0");
  const [busca, setBusca] = useState("");


  const toLocalDateTimeInputValue = (d) => {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`; 
  };

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return toLocalDateTimeInputValue(d);
  }, []);

  const nowLocal = useMemo(() => toLocalDateTimeInputValue(new Date()), []);

  const [filtroInicio, setFiltroInicio] = useState(startOfToday);
  const [filtroFim, setFiltroFim] = useState(nowLocal);


  const [registros, setRegistros] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);

  
  const [ciclosManuais, setCiclosManuais] = useState([]);
  const [loadingManuais, setLoadingManuais] = useState(false);

  const [openManual, setOpenManual] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [editId, setEditId] = useState(null);

  const [manualInicioData, setManualInicioData] = useState("");
  const [manualInicioHora, setManualInicioHora] = useState("");
  const [manualFimData, setManualFimData] = useState("");
  const [manualFimHora, setManualFimHora] = useState("");
  const [manualPessoas, setManualPessoas] = useState("");
  const [manualPesoTotal, setManualPesoTotal] = useState("");

  
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

  const onlyDigits = (v = "") => String(v).replace(/\D/g, "");

  const maskDateBR = (v) => {
    const d = onlyDigits(v).slice(0, 8);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 4);
    const p3 = d.slice(4, 8);
    let out = p1;
    if (p2) out += `/${p2}`;
    if (p3) out += `/${p3}`;
    return out;
  };

  const maskTimeHM = (v) => {
    const d = onlyDigits(v).slice(0, 4);
    const h = d.slice(0, 2);
    const m = d.slice(2, 4);
    let out = h;
    if (m) out += `:${m}`;
    return out;
  };

  const isValidDateBR = (ddmmyyyy) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) return false;
    const [dd, mm, yyyy] = ddmmyyyy.split("/").map(Number);
    if (yyyy < 2000 || yyyy > 2100) return false;
    if (mm < 1 || mm > 12) return false;
    const maxDay = new Date(yyyy, mm, 0).getDate();
    return dd >= 1 && dd <= maxDay;
  };

  const isValidTimeHM = (hhmm) => {
    if (!/^\d{2}:\d{2}$/.test(hhmm)) return false;
    const [hh, mm] = hhmm.split(":").map(Number);
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  };

  const joinDateTime = (dataBR, horaHM) => `${dataBR}, ${horaHM}:00`;

  const parseDateTimeBR = (dataBR, horaHM) => {
    const [dd, mm, yyyy] = dataBR.split("/").map(Number);
    const [hh, mi] = horaHM.split(":").map(Number);
    return new Date(yyyy, mm - 1, dd, hh, mi, 0, 0);
  };

  const splitDateTimeBR = (s) => {
    const str = String(s || "");
    const [data = "", horaFull = ""] = str.split(",").map((x) => x.trim());
    const hora = horaFull ? horaFull.slice(0, 5) : "";
    return { data, hora };
  };

  const blockNonNumericKeys = (e) => {
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
    if (allowed.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const blockNonNumericKeysDecimal = (e) => {
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
    if (allowed.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
    if (!/^\d$/.test(e.key) && e.key !== "." && e.key !== ",") e.preventDefault();
  };

  const fecharModal = () => {
    setOpenManual(false);
    setEditId(null);
    setManualInicioData("");
    setManualInicioHora("");
    setManualFimData("");
    setManualFimHora("");
    setManualPessoas("");
    setManualPesoTotal("");
  };

  
  const buscarDadosDashboard = async (primeiraVez = false) => {
    if (primeiraVez) setLoading(true);
    try {
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

      await buscarManualHoje(pessoas, kg);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      setStatusEstacao("offline");
      setDadosHorarios([]);
    } finally {
      if (primeiraVez) setLoading(false);
    }
  };

  const buscarManualHoje = async (autoPessoas, autoKg) => {
    try {
      const resp = await fetch(`${BASE}/api/pesagem?tipo=ciclosHoje`);
      const data = await resp.json();

      const mp = Number(data?.resumoManual?.pessoasManual ?? 0);
      const mk = Number(data?.resumoManual?.pesoManual ?? 0);
      const mm = Number(data?.resumoManual?.pesoMedioManual ?? (mp > 0 ? mk / mp : 0));

      setManualHojePessoas(mp);
      setManualHojeKg(mk);
      setManualHojeMedio(mm);

      const gp = Number(autoPessoas || 0) + mp;
      const gk = Number(autoKg || 0) + mk;
      const gm = gp > 0 ? gk / gp : 0;

      setGeralHojePessoas(gp);
      setGeralHojeKg(gk);
      setGeralHojeMedio(gm);
    } catch (e) {
      console.error("Erro ao buscar manual hoje:", e);

      setManualHojePessoas(0);
      setManualHojeKg(0);
      setManualHojeMedio(0);

      const ap = Number(autoPessoas || 0);
      const ak = Number(autoKg || 0);
      setGeralHojePessoas(ap);
      setGeralHojeKg(ak);
      setGeralHojeMedio(ap > 0 ? ak / ap : 0);
    }
  };

const buscarRegistros = async () => {
  setLoadingRegistros(true);
  if (filtroInicio && filtroFim) {
    const ini = new Date(filtroInicio).getTime();
    const fim = new Date(filtroFim).getTime();
    if (fim < ini) {
      setLoadingRegistros(false);
      return alert("A Data/Hora Fim não pode ser antes da Data/Hora Início.");
    }
  }

  try {
    
    const inicioISO = filtroInicio ? new Date(filtroInicio).toISOString() : "";
    const fimISO = filtroFim ? new Date(filtroFim).toISOString() : "";

    const qs = new URLSearchParams({
      tipo: "registros",
      inicio: inicioISO,
      fim: fimISO,
      q: busca || "",
    });

    const resp = await fetch(`${BASE}/api/pesagem?${qs.toString()}`);
    const data = await resp.json();

    setRegistros(Array.isArray(data.registros) ? data.registros : []);
  } catch (e) {
    console.error("Erro ao buscar registros:", e);
    setRegistros([]);
  } finally {
    setLoadingRegistros(false);
  }
};


  const buscarCiclosManuais = async () => {
    setLoadingManuais(true);
    try {
      const qs = new URLSearchParams({
        tipo: "ciclosManuais",
        inicio: filtroInicio,
        fim: filtroFim,
      });

      const resp = await fetch(`${BASE}/api/pesagem?${qs.toString()}`);
      const data = await resp.json();

      setCiclosManuais(Array.isArray(data.ciclos) ? data.ciclos : []);
    } catch (e) {
      console.error("Erro ao buscar ciclos manuais:", e);
      setCiclosManuais([]);
    } finally {
      setLoadingManuais(false);
    }
  };

  const abrirEditarManual = (c) => {
    setEditId(c.id);

    const ini = splitDateTimeBR(c.dataInicio);
    const fim = splitDateTimeBR(c.dataFim);

    setManualInicioData(ini.data);
    setManualInicioHora(ini.hora);
    setManualFimData(fim.data);
    setManualFimHora(fim.hora);

    setManualPessoas(String(c.totalPessoas || ""));
    setManualPesoTotal(String(c.pesoTotal || ""));

    setOpenManual(true);
  };

  const excluirManual = async (id) => {
    const ok = window.confirm("Deseja excluir este ciclo manual?");
    if (!ok) return;

    try {
      const resp = await fetch(`${BASE}/api/pesagem?tipo=cicloManual&id=${id}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.erro || "Falha ao excluir");

      await buscarCiclosManuais();
      await buscarDadosDashboard(false);
      alert("🗑️ Ciclo manual excluído!");
    } catch (e) {
      console.error(e);
      alert("❌ Não foi possível excluir.");
    }
  };

  const salvarCicloManual = async () => {
    
    if (!manualInicioData || !manualInicioHora || !manualFimData || !manualFimHora || !manualPessoas || !manualPesoTotal) {
      return alert("Preencha todos os campos.");
    }

    
    if (!isValidDateBR(manualInicioData)) return alert("Data Início inválida. Use DD/MM/AAAA.");
    if (!isValidTimeHM(manualInicioHora)) return alert("Hora Início inválida. Use HH:MM.");
    if (!isValidDateBR(manualFimData)) return alert("Data Fim inválida. Use DD/MM/AAAA.");
    if (!isValidTimeHM(manualFimHora)) return alert("Hora Fim inválida. Use HH:MM.");

   
    const dtInicio = parseDateTimeBR(manualInicioData, manualInicioHora);
    const dtFim = parseDateTimeBR(manualFimData, manualFimHora);
    const agora = new Date();

    if (dtFim.getTime() < dtInicio.getTime()) return alert("A Data/Hora Fim não pode ser antes da Data/Hora Início.");
    if (dtInicio.getTime() > agora.getTime()) return alert("Data/Hora Início não pode estar no futuro.");
    if (dtFim.getTime() > agora.getTime()) return alert("Data/Hora Fim não pode estar no futuro.");

    const totalPessoasNum = Number(manualPessoas);
    const pesoTotalNum = Number(String(manualPesoTotal).replace(",", "."));

    if (!Number.isFinite(totalPessoasNum) || totalPessoasNum <= 0) return alert("Total de pessoas deve ser maior que 0.");
    if (!Number.isFinite(pesoTotalNum) || pesoTotalNum <= 0) return alert("Peso total deve ser maior que 0.");

    const manualInicio = joinDateTime(manualInicioData, manualInicioHora);
    const manualFim = joinDateTime(manualFimData, manualFimHora);

    setSavingManual(true);
    try {
      const ciclo = {
        criadoManual: true,
        dataInicio: manualInicio,
        dataFim: manualFim,
        totalPessoas: totalPessoasNum,
        pesoTotal: pesoTotalNum,
      };

      const url = editId
        ? `${BASE}/api/pesagem?tipo=cicloManual&id=${editId}`
        : `${BASE}/api/pesagem?tipo=cicloManual`;

      const method = editId ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ciclo),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.erro || "Falha ao salvar ciclo manual");

      alert(editId ? "✅ Ciclo manual atualizado!" : "✅ Ciclo manual salvo!");

      fecharModal();

      await buscarDadosDashboard(false);
      await buscarCiclosManuais();
    } catch (e) {
      console.error(e);
      alert("❌ Não foi possível salvar o ciclo manual.");
    } finally {
      setSavingManual(false);
    }
  };
 
  useEffect(() => {
    buscarDadosDashboard(true);
    buscarRegistros();
    buscarCiclosManuais();

    const interval = setInterval(() => buscarDadosDashboard(false), 30000);
    return () => clearInterval(interval);
   
  }, []);

  useEffect(() => {
    buscarRegistros();
    buscarCiclosManuais();
    
  }, [filtroInicio, filtroFim]);


const manualPorHora = useMemo(() => {
  const map = {}; 

  (ciclosManuais || []).forEach((c) => {
    const { hora } = splitDateTimeBR(c.dataInicio); 
    const hh = (hora || "").slice(0, 2);
    if (!hh) return;

    const key = `${hh}:00`;
    map[key] = (map[key] || 0) + Number(c.totalPessoas || 0);
  });

  return map;
}, [ciclosManuais, splitDateTimeBR]);


const labels = useMemo(() => {
  const autoLabels = (dadosHorarios || []).map((d) => d.hora);
  const manualLabels = Object.keys(manualPorHora || {});
  const all = Array.from(new Set([...autoLabels, ...manualLabels]));

  return all.sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)));
}, [dadosHorarios, manualPorHora]);


const valoresAuto = useMemo(() => {
  const map = {};
  (dadosHorarios || []).forEach((d) => {
    map[d.hora] = Number(d.quantidade || 0);
  });
  return labels.map((h) => map[h] || 0);
}, [labels, dadosHorarios]);


const valoresManual = useMemo(() => {
  return labels.map((h) => Number(manualPorHora?.[h] || 0));
}, [labels, manualPorHora]);


const chartData = useMemo(() => {
  return {
    labels,
    datasets: [
      {
        label: "Auto (balança) por Hora",
        data: valoresAuto,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.20)",
        tension: 0.4,
      },
      {
        label: "Manual por Hora",
        data: valoresManual,
        borderColor: "rgb(255, 193, 7)",            
        backgroundColor: "rgba(255, 193, 7, 0.18)", 
        tension: 0.35,
      },
    ],
  };
}, [labels, valoresAuto, valoresManual]);




  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Evolução de Refeições ao Longo do Dia" },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } },
  };

  function DashboardLoading() {
    return (
      <div className="dash-skeleton">
       
        <div className="dash-skel-top">
          <div className="skel skel-btn"></div>
          <div className="skel skel-title"></div>
          <div className="skel skel-sub"></div>
        </div>

        
        <div className="skel skel-resumo"></div>

       
        <div className="dash-skel-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skel skel-widget"></div>
          ))}
        </div>

       
        <div className="dash-skel-section">
          <div className="skel skel-h2"></div>
          <div className="skel skel-row"></div>
          <div className="skel skel-row"></div>
        </div>

       
        <div className="dash-skel-section">
          <div className="skel skel-h2"></div>
          <div className="skel skel-chart"></div>
        </div>

       
        <div className="dash-skel-section">
          <div className="skel skel-h2"></div>
          <div className="skel skel-table"></div>
        </div>
      </div>
    );
  }


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
          <DashboardLoading />
        ) : (
          <>

         
          <div className="widget widget-primary widget-resumo">
            <div className="widget-icon">
              <MdRestaurantMenu />
            </div>

            <div className="widget-content">
              <h3>Resumo do Dia</h3>

              <div className="resumo-linhas">
                <div className="resumo-item">
                  <span className="resumo-label">Auto (balança)</span>
                  <span className="resumo-value">
                    {totalPessoas} pessoas • {Number(totalKg).toFixed(2)} kg
                  </span>
                </div>

                <div className="resumo-item">
                  <span className="resumo-label">Manual</span>
                  <span className="resumo-value">
                    {manualHojePessoas} pessoas • {Number(manualHojeKg).toFixed(2)} kg
                  </span>
                </div>

                <div className="resumo-item resumo-total">
                  <span className="resumo-label">Total geral</span>
                  <span className="resumo-value">
                    {geralHojePessoas} pessoas • {Number(geralHojeKg).toFixed(2)} kg • médio{" "}
                    {Number(geralHojeMedio).toFixed(3)} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          <br />

         
          <div className="widgets-grid">
            <div className={`widget widget-primary ${contagemAtiva ? "widget-online" : "widget-offline"}`}>
              <div className="widget-icon">
                <FiClock />
              </div>

              <div className="widget-content">
                <h3>Sessão de Contagem</h3>
                <p className="widget-value">{contagemAtiva ? "Ativa" : "Parada"}</p>
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

          
            <div className="widget widget-warning widget-manual">
              <div className="widget-icon">
                <FiSettings />
              </div>

              <div className="widget-content-manual">
                <h3>Ciclo Manual</h3>
                <p className="widget-value">Adicionar</p>
                <span className="widget-label">Criar uma refeição nova</span>

                <button
                  className="btn-widget"
                  onClick={() => {
                    setEditId(null);
                    setOpenManual(true);
                  }}
                >
                  + Nova refeição
                </button>
              </div>

              <div className="mini-resumo mini-resumo-linha">
                <div className="mini-item">
                  <span className="mini-titulo">Manual hoje</span>
                  <span className="mini-valor">
                    {manualHojePessoas} pessoas • {Number(manualHojeKg).toFixed(2)} kg • médio{" "}
                    {Number(manualHojeMedio).toFixed(3)} kg
                  </span>
                </div>

                <div className="mini-item mini-total">
                  <span className="mini-titulo">Geral hoje</span>
                  <span className="mini-valor">
                    {geralHojePessoas} pessoas • {Number(geralHojeKg).toFixed(2)} kg • médio{" "}
                    {Number(geralHojeMedio).toFixed(3)} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

         
          <div className="manuais-container">
            <div className="manuais-header">
              <h2>Ciclos Manuais</h2>
              <span className="manuais-sub">
                {filtroInicio} até {filtroFim}
              </span>
            </div>

            {loadingManuais ? (
              <div className="loading-dashboard">Carregando ciclos manuais...</div>
            ) : ciclosManuais.length === 0 ? (
              <div className="manuais-vazio">Nenhum ciclo manual no período.</div>
            ) : (
              <div className="manuais-lista">
                {ciclosManuais.map((c) => (
                  <div className="manual-card" key={c.id}>
                    <div className="manual-info">
                      <div className="manual-top">
                        <strong>{c.totalPessoas} pessoas</strong>
                        <span>{Number(c.pesoTotal).toFixed(2)} kg</span>
                        <span className="manual-med">
                          médio{" "}
                          {(c.totalPessoas > 0 ? Number(c.pesoTotal) / Number(c.totalPessoas) : 0).toFixed(3)} kg
                        </span>
                      </div>

                      <div className="manual-datas">
                        <span>
                          <b>Início:</b> {c.dataInicio}
                        </span>
                        <span>
                          <b>Fim:</b> {c.dataFim}
                        </span>
                      </div>
                    </div>

                    <div className="manual-actions">
                      <button className="btn-manual-edit" onClick={() => abrirEditarManual(c)}>
                        Editar
                      </button>
                      <button className="btn-manual-del" onClick={() => excluirManual(c.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <br/>

         
          <div className="grafico-container">
            <div className="grafico-header">
              <h2>Evolução Horária de Refeições</h2>
            </div>
            <div className="grafico-content">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

         
          <div className="tabela-refeicoes-container">
            <div className="tabela-refeicoes-header">
              <h2>Registros da Balança</h2>

              <div className="tabela-refeicoes-filtros">
                <div className="filtro-refeicoes-item grow">
                  <label>Início</label>
                 <input
                    type="datetime-local"
                    value={filtroInicio}
                    onChange={(e) => setFiltroInicio(e.target.value)}
                  />

                </div>

                <div className="filtro-refeicoes-item grow">
                  <label>Fim</label>
                  <input
                      type="datetime-local"
                      value={filtroFim}
                      onChange={(e) => setFiltroFim(e.target.value)}
                    />
                </div>


                <button className="btn-refeicoes-primary btn-refeicoes-buscar" onClick={buscarRegistros}>
                  Buscar
                </button>
              </div>
            </div>

            {loadingRegistros ? (
                <div className="loading-dashboard">Carregando registros...</div>
              ) : (
                <>
                  
                  <div className="registros-cards">
                    {registros.length === 0 ? (
                      <div className="manuais-vazio">Nenhum registro encontrado.</div>
                    ) : (
                      registros.map((r) => (
                        <div className="registro-card" key={r.id}>
                          <div className="registro-topo">
                            <span className="registro-data">{r.dataHora}</span>
                            <span className="registro-pill">{r.pessoas} pessoas</span>
                          </div>

                          <div className="registro-grid">
                            <div className="registro-item">
                              <span className="registro-label">Peso prato</span>
                              <span className="registro-value">{Number(r.pesoPrato).toFixed(3)} kg</span>
                            </div>

                            <div className="registro-item">
                              <span className="registro-label">Peso total</span>
                              <span className="registro-value">{Number(r.pesoTotal).toFixed(2)} kg</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                 
                  <div className="tabela-refeicoes-wrap">
                    <table className="tabela-refeicoes">
                      <thead>
                        <tr>
                          <th>Data/Hora</th>
                          <th>Pessoas</th>
                          <th>Peso prato (kg)</th>
                          <th>Peso total (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registros.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", opacity: 0.7 }}>
                              Nenhum registro encontrado.
                            </td>
                          </tr>
                        ) : (
                          registros.map((r) => (
                            <tr key={r.id}>
                              <td>{r.dataHora}</td>
                              <td>{r.pessoas}</td>
                              <td>{Number(r.pesoPrato).toFixed(3)}</td>
                              <td>{Number(r.pesoTotal).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

          </div>

         
          {openManual && (
            <div className="modal-refeicoes-backdrop">
              <div className="modal-refeicoes-card">
                <div className="modal-refeicoes-header">
                  <h2>{editId ? "Editar Refeição" : "Nova Refeição"}</h2>
                  <button className="modal-refeicoes-close" onClick={fecharModal}>
                    ✕
                  </button>
                </div>

                <div className="modal-refeicoes-body">
                  <div className="form-refeicoes-row-2">
                    <div className="form-refeicoes-row">
                      <label>Data Início (DD/MM/AAAA)</label>
                      <input
                        inputMode="numeric"
                        value={manualInicioData}
                        onKeyDown={blockNonNumericKeys}
                        onPaste={(e) => {
                          e.preventDefault();
                          const txt = e.clipboardData.getData("text");
                          setManualInicioData(maskDateBR(txt));
                        }}
                        onChange={(e) => setManualInicioData(maskDateBR(e.target.value))}
                        placeholder="05/11/2025"
                        maxLength={10}
                      />
                    </div>

                    <div className="form-refeicoes-row">
                      <label>Hora Início (HH:MM)</label>
                      <input
                        inputMode="numeric"
                        value={manualInicioHora}
                        onKeyDown={blockNonNumericKeys}
                        onPaste={(e) => {
                          e.preventDefault();
                          const txt = e.clipboardData.getData("text");
                          setManualInicioHora(maskTimeHM(txt));
                        }}
                        onChange={(e) => setManualInicioHora(maskTimeHM(e.target.value))}
                        placeholder="15:57"
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div className="form-refeicoes-row-2">
                    <div className="form-refeicoes-row">
                      <label>Data Fim (DD/MM/AAAA)</label>
                      <input
                        inputMode="numeric"
                        value={manualFimData}
                        onKeyDown={blockNonNumericKeys}
                        onPaste={(e) => {
                          e.preventDefault();
                          const txt = e.clipboardData.getData("text");
                          setManualFimData(maskDateBR(txt));
                        }}
                        onChange={(e) => setManualFimData(maskDateBR(e.target.value))}
                        placeholder="05/11/2025"
                        maxLength={10}
                      />
                    </div>

                    <div className="form-refeicoes-row">
                      <label>Hora Fim (HH:MM)</label>
                      <input
                        inputMode="numeric"
                        value={manualFimHora}
                        onKeyDown={blockNonNumericKeys}
                        onPaste={(e) => {
                          e.preventDefault();
                          const txt = e.clipboardData.getData("text");
                          setManualFimHora(maskTimeHM(txt));
                        }}
                        onChange={(e) => setManualFimHora(maskTimeHM(e.target.value))}
                        placeholder="19:58"
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div className="form-refeicoes-row-2">
                    <div className="form-refeicoes-row">
                      <label>Total Pessoas</label>
                      <input
                        inputMode="numeric"
                        value={manualPessoas}
                        onKeyDown={blockNonNumericKeys}
                        onPaste={(e) => {
                          e.preventDefault();
                          const txt = e.clipboardData.getData("text");
                          setManualPessoas(onlyDigits(txt));
                        }}
                        onChange={(e) => setManualPessoas(onlyDigits(e.target.value))}
                        placeholder="Ex: 120"
                      />
                    </div>

                    <div className="form-refeicoes-row">
                      <label>Peso Total (kg)</label>
                      <input
                        inputMode="decimal"
                        value={manualPesoTotal}
                        onKeyDown={blockNonNumericKeysDecimal}
                        onPaste={(e) => {
                          e.preventDefault();
                          const txt = e.clipboardData.getData("text");
                          setManualPesoTotal(
                            String(txt)
                              .replace(",", ".")
                              .replace(/[^\d.]/g, "")
                              .replace(/(\..*)\./g, "$1")
                          );
                        }}
                        onChange={(e) =>
                          setManualPesoTotal(
                            String(e.target.value)
                              .replace(",", ".")
                              .replace(/[^\d.]/g, "")
                              .replace(/(\..*)\./g, "$1")
                          )
                        }
                        placeholder="Ex: 82.350"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-refeicoes-footer">
                  <button className="btn-refeicoes-secondary" onClick={fecharModal}>
                    Cancelar
                  </button>
                  <button className="btn-refeicoes-primary" disabled={savingManual} onClick={salvarCicloManual}>
                    {savingManual ? "Salvando..." : editId ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

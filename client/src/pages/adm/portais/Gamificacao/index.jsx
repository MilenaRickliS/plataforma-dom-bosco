import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaTrophy } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import { ImParagraphLeft } from "react-icons/im";
import { MdReplay } from "react-icons/md";
import axios from "axios";
import "./style.css";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Gamificacao() {
    
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
        setLoading(true);
        const [usuariosSnap, logsSnap] = await Promise.all([
        axios.get(`${API}/api/usuarios`),
        axios.get(`${API}/api/logs/gamificacao`),
        ]);

       
        const novosUsuarios = (usuariosSnap.data || []).map((u) => ({
        id: u.id,
        nome: u.nome || "Sem nome",
        email: u.email || "—",
        role: u.role || "indefinido",
        pontos: u.pontos || 0,
        ...u,
        }));

        
        setUsuarios((prev) =>
        novosUsuarios.map((u) => {
            const anterior = prev.find((x) => x.id === u.id);
            if (!anterior) return { ...u, recentChange: null };
            if (u.pontos > anterior.pontos) return { ...u, recentChange: "up" };
            if (u.pontos < anterior.pontos) return { ...u, recentChange: "down" };
            return { ...u, recentChange: null };
        })
        );

        setLogs(logsSnap.data || []);
    } catch (err) {
        console.error("Erro ao carregar dados da gamificação:", err);
    } finally {
        setLoading(false);
    }
    }


  const filtrados = usuarios
    .filter((u) =>
      filtro === "todos"
        ? true
        : filtro === "alunos"
        ? u.role === "aluno"
        : u.role === "professor"
    )
    .filter((u) =>
        (u?.nome || "")
            .toString()
            .toLowerCase()
            .includes((busca || "").toString().toLowerCase())
        )

    .sort((a, b) => (b.pontos || 0) - (a.pontos || 0));

  const ganhos = logs.filter((l) => l.tipo === "ganho").length;
  const perdas = logs.filter((l) => l.tipo === "perda").length;
  const totalPontos = logs.reduce(
    (acc, l) => acc + (l.tipo === "ganho" ? l.valor : -l.valor),
    0
  );

  const motivos = Object.entries(
    logs.reduce((acc, l) => {
      acc[l.motivo] = (acc[l.motivo] || 0) + 1;
      return acc;
    }, {})
  ).map(([motivo, qtd]) => ({ motivo, qtd }));

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#eab308", "#9333ea"];

  return (
    <div className="pagina-gamificacao">
      <div className="inicio-menug">
        <Link to="/gestao-portais" className="voltar-adm">
          <IoIosArrowBack /> Voltar
        </Link>
        <h2 className="titulo-usuarios">Gestão de Gamificação</h2>
      </div>

      {loading ? (
        <p className="carregando">Carregando dados...</p>
      ) : (
        <>
         
          <div className="filtros-gamificacao">
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="alunos">Alunos</option>
              <option value="professores">Professores</option>
            </select>
          </div>

         
          <h2 className="subtitulo-gamificacao">
            <FaTrophy /> Ranking
          </h2>

          <div className="acoes-game-gerais">
            <button
              className="botao-zerar"
              onClick={async () => {
                if (confirm("Tem certeza que deseja zerar todos os pontos e logs?")) {
                  try {
                    await axios.post(`${API}/api/gamificacao/zerar`);
                    toast.info("Gamificação zerada com sucesso!", {
                      position: "bottom-right",
                      theme: "colored",
                      transition: Zoom,
                    });
                    carregarDados();
                  } catch (err) {
                    toast.error("Erro ao zerar gamificação.", {
                      position: "bottom-right",
                      theme: "colored",
                      transition: Zoom,
                    });
                    console.error(err);
                  }
                }
              }}
            >
              <MdReplay /> Zerar Gamificação
            </button>
          </div>

          <div className="tabela-wrapper">
            <table className="ranking-tabela">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Pontos</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtrados.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`linha-ranking ${
                        u.recentChange === "up"
                          ? "subiu"
                          : u.recentChange === "down"
                          ? "desceu"
                          : ""
                      }`}
                    >
                      <td data-label="Posição">{i + 1}</td>
                      <td data-label="Nome">{u.nome}</td>
                      <td data-label="E-mail">{u.email}</td>
                      <td data-label="Pontos">{u.pontos || 0}</td>
                      <td data-label="Função">{u.role}</td>
                      <td data-label="Ações">
                        <button
                          className="btn-menos"
                          onClick={() =>
                            setUsuarios((prev) =>
                              prev.map((x) =>
                                x.id === u.id
                                  ? {
                                      ...x,
                                      pontos: Math.max(0, (x.pontos || 0) - 1),
                                      recentChange: "down",
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          −
                        </button>
                        <button
                          className="btn-mais"
                          onClick={() =>
                            setUsuarios((prev) =>
                              prev.map((x) =>
                                x.id === u.id
                                  ? {
                                      ...x,
                                      pontos: (x.pontos || 0) + 1,
                                      recentChange: "up",
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          +
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="acoes-salvar-game">
            <button
              className="botao-salvar-game"
              onClick={async () => {
                try {
                  await Promise.all(
                    usuarios.map((u) =>
                      axios.post(`${API}/api/gamificacao/salvar`, {
                        userId: u.id,
                        pontos: u.pontos || 0,
                      })
                    )
                  );
                  toast.success("💾 Alterações salvas com sucesso!", {
                    position: "bottom-right",
                    theme: "colored",
                    transition: Zoom,
                    style: {
                      background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                      color: "#fff",
                    },
                  });
                  carregarDados();
                } catch (err) {
                  toast.error("❌ Erro ao salvar alterações.", {
                    position: "bottom-right",
                    theme: "colored",
                    transition: Zoom,
                  });
                  console.error(err);
                }
              }}
            >
              <FaSave /> Salvar Alterações
            </button>
          </div>

          <ToastContainer position="bottom-right" theme="colored" />

          
          <h2 className="subtitulo-gamificacao">
            <VscGraph /> Análise de Pontuação
          </h2>

          <div className="graficos-game">
            <div className="grafico-game-card">
              <h4>Ganhos vs Perdas</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{ nome: "Pontos", ganhos, perdas }]}>
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ganhos" fill="#22c55e" />
                  <Bar dataKey="perdas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
              <p>Total líquido: <strong>{totalPontos}</strong> pontos</p>
            </div>

            <div className="grafico-game-card">
              <h4>Motivos mais frequentes</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={motivos}
                    dataKey="qtd"
                    nameKey="motivo"
                    outerRadius={80}
                    label
                  >
                    {motivos.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          
          <h2 className="subtitulo-gamificacao">
            <ImParagraphLeft /> Histórico de Ações
          </h2>

          <div className="filtros-logs">
            <input
              type="text"
              placeholder="Pesquisar por nome no histórico..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="alunos">Alunos</option>
              <option value="professores">Professores</option>
            </select>
          </div>

          <div className="tabela-wrapper">
            <table className="logs-tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Motivo</th>
                  <th>Total após ação</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .filter((l) => {
                    if (filtro === "todos") return true;
                    if (filtro === "alunos") return l.role === "aluno";
                    if (filtro === "professores") return l.role === "professor";
                    return true;
                  })
                  .filter((l) =>
                    (l?.nome || "")
                        .toString()
                        .toLowerCase()
                        .includes((busca || "").toString().toLowerCase())
                    )

                  .sort(
                    (a, b) => (b.data?._seconds || 0) - (a.data?._seconds || 0)
                  )
                  .map((l, i) => (
                    <tr key={i}>
                      <td data-label="Data">
                        {l.data?._seconds
                          ? new Date(l.data._seconds * 1000).toLocaleString("pt-BR")
                          : "-"}
                      </td>
                      <td data-label="Nome">{l.nome || "-"}</td>
                      <td
                      data-label="Tipo"
                        className={l.tipo === "ganho" ? "ganho" : "perda"}
                      >
                        {l.tipo}
                      </td>
                      <td data-label="Valor">{l.valor}</td>
                      <td data-label="Motivo">{l.motivo}</td>
                      <td data-label="Total">{l.pontosTotais}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

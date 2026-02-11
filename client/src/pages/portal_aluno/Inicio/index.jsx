import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import frases from "../../../data/frases.json";
import { FiClock, FiCheckCircle, FiPaperclip } from "react-icons/fi";
import { MdPlayArrow } from "react-icons/md";
import { LuSend } from "react-icons/lu";

// Abre arquivos Office no Google Docs Viewer em vez de baixar
const getViewUrl = (url) => {
  const ext = url.split(".").pop().split("?")[0].toLowerCase();
  const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  if (officeExts.includes(ext)) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=false`;
  }
  return url;
};

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [fraseHoje, setFraseHoje] = useState("");
  const [videos, setVideos] = useState([]);
  const [videoDestaque, setVideoDestaque] = useState(null);
  const [agendaHoje, setAgendaHoje] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [tarefasProfessor, setTarefasProfessor] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  // Converter URL do vídeo para embed
  const toEmbed = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const host = u.hostname.replace("www.", "");
      if (host.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}?rel=0`;
        if (u.pathname.startsWith("/embed/")) return url;
        if (u.pathname.startsWith("/shorts/")) {
          const id = u.pathname.split("/")[2];
          return `https://www.youtube.com/embed/${id}?rel=0`;
        }
      }
      if (host === "youtu.be") {
        const id = u.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}?rel=0`;
      }
      if (host.includes("vimeo.com")) {
        const id = u.pathname.split("/").filter(Boolean).pop();
        return `https://player.vimeo.com/video/${id}`;
      }
      if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u.pathname)) return url;
      return url;
    } catch {
      return url;
    }
  };

  // Formatar data para exibição
  const formatarData = () => {
    const hoje = new Date();
    const diasSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    return `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} De ${meses[hoje.getMonth()]}`;
  };

  // Carregar vídeos
  useEffect(() => {
    const carregarVideos = async () => {
      try {
        const res = await axios.get(`${API}/api/videos`);
        setVideos(res.data || []);
      } catch (e) {
        console.error("Erro ao listar vídeos:", e);
      }
    };
    carregarVideos();
  }, [API]);

  // Carregar frase do dia
  useEffect(() => {
    if (!user?.uid) return;
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const somaChar = user.uid.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const index = (diaDoAno + somaChar) % frases.length;
    setFraseHoje(frases[index]);
  }, [user]);

  // Selecionar vídeo destaque
  useEffect(() => {
    if (!videos?.length) return;
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const somaChar = (user?.uid || "guest").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const idx = ((diaDoAno + somaChar) % videos.length + videos.length) % videos.length;
    setVideoDestaque(videos[idx]);
  }, [videos, user]);

  // Carregar agenda do dia atual
  useEffect(() => {
    if (!user) return;
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const dia = hoje.getDate();

    axios
      .get(`${API}/api/tarefas`, {
        params: { usuarioId: user.uid, ano: ano, mes: mes },
      })
      .then((res) => {
        // Criar a chave no formato correto: "ano-mes-dia"
        const chaveHoje = `${ano}-${mes}-${dia}`;
        const tarefasHoje = res.data[chaveHoje] || [];
        setAgendaHoje(tarefasHoje);
      })
      .catch((err) => console.error("Erro ao carregar agenda:", err));
  }, [user, API]);

  // Carregar avisos do aluno
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API}/api/avisos`, { params: { alunoId: user.uid } })
      .then((res) => setAvisos(res.data || []))
      .catch((err) => console.error("Erro ao carregar avisos:", err));
  }, [user, API]);

  // Carregar tarefas dos professores
  useEffect(() => {
    axios
      .get(`${API}/api/tarefas-professor`)
      .then((res) => setTarefasProfessor(res.data || []))
      .catch((err) => console.error("Erro ao carregar tarefas:", err));
  }, [API]);

  // Determinar tipo visual do aviso baseado em palavras-chave
  const getTipoAviso = (titulo, descricao) => {
    const texto = `${titulo} ${descricao}`.toLowerCase();
    if (texto.includes("urgente") || texto.includes("reunião") || texto.includes("reuniao") || texto.includes("prova")) return "urgente";
    if (texto.includes("importante") || texto.includes("inscrição") || texto.includes("inscricao") || texto.includes("feira")) return "importante";
    return "info";
  };

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />

          {/* Banner com frase motivacional */}
          <div className="banner-frase">
            <p>{fraseHoje}</p>
          </div>

          {/* Container principal com 2 colunas */}
          <div className="da-container">
            {/* Coluna Esquerda - Vídeo em Destaque */}
            <div className="da-coluna-esquerda">
              <div className="secao-card">
                <div className="secao-header">
                  <MdPlayArrow className="secao-icon" />
                  <h2>Vídeo em Destaque</h2>
                </div>
                {videoDestaque ? (
                  <div className="video-destaque-content">
                    <div className="video-embed">
                      <iframe
                        src={toEmbed(videoDestaque.url)}
                        title={videoDestaque.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="conteudo-vazio">
                    <p>Nenhum vídeo disponível no momento.</p>
                  </div>
                )}
              </div>

              {/* Avisos Importantes */}
              <div className="secao-card avisos-card">
                <div className="secao-header">
                  <LuSend className="secao-icon avisos-icon" />
                  <h2>Avisos Importantes</h2>
                </div>
                <div className="avisos-lista">
                  {avisos.length > 0 ? (
                    avisos.slice(0, 5).map((aviso) => {
                      const tipo = getTipoAviso(aviso.titulo, aviso.descricao);
                      return (
                        <div key={aviso.id} className={`aviso-item aviso-${tipo}`}>
                          <div className="aviso-content">
                            <h3 className="aviso-titulo">{aviso.titulo}</h3>
                            <p className="aviso-descricao">{aviso.descricao}</p>
                          </div>
                          <span className={`aviso-badge aviso-badge-${tipo}`}>
                            {tipo === "urgente" ? "Urgente" : tipo === "importante" ? "Importante" : "Info"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="conteudo-vazio">
                      <p>Nenhum aviso no momento.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita - Agenda e Tarefas */}
            <div className="da-coluna-direita">
              {/* Agenda de Hoje */}
              <div className="secao-card agenda-card">
                <div className="secao-header">
                  <FiClock className="secao-icon agenda-icon" />
                  <h2>Agenda de Hoje</h2>
                </div>
                <p className="data-atual">{formatarData()}</p>
                <div className="agenda-lista">
                  {agendaHoje && agendaHoje.length > 0 ? (
                    agendaHoje.map((tarefa, index) => (
                      <div key={index} className="agenda-item">
                        <div className="agenda-horario">
                          <FiClock size={14} />
                          <span>{tarefa.lembrete || "00:00"}</span>
                        </div>
                        <div className="agenda-info">
                          <div className="agenda-badge">
                            {tarefa.prioridade === "alta" ? "entrega" : "aula"}
                          </div>
                          <p className="agenda-titulo">{tarefa.nome}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="conteudo-vazio">
                      <p>Nenhum evento agendado para hoje.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tarefas Pendentes */}
              <div className="secao-card tarefas-card">
                <div className="secao-header">
                  <FiCheckCircle className="secao-icon tarefas-icon" />
                  <div className="tarefas-header-content">
                    <h2>Tarefas Pendentes</h2>
                    <span className="tarefas-count">{tarefasProfessor.length} tarefa{tarefasProfessor.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="tarefas-lista">
                  {tarefasProfessor.length > 0 ? (
                    tarefasProfessor.map((tarefa) => (
                      <div key={tarefa.id} className="tarefa-item">
                        <input type="checkbox" className="tarefa-checkbox" />
                        <div className="tarefa-info">
                          <p className="tarefa-titulo">{tarefa.titulo}</p>
                          {tarefa.descricao && (
                            <p className="tarefa-descricao-aluno">{tarefa.descricao}</p>
                          )}
                          <div className="tarefa-meta">
                            {tarefa.professorNome && (
                              <span className="tarefa-materia">{tarefa.professorNome}</span>
                            )}
                            {tarefa.anexos && tarefa.anexos.length > 0 && (
                              <span className="tarefa-anexos-aluno">
                                <FiPaperclip size={12} />
                                {tarefa.anexos.map((a, i) => (
                                  <a key={i} href={getViewUrl(a.url)} target="_blank" rel="noreferrer">{a.nome}</a>
                                ))}
                              </span>
                            )}
                            <span className="tarefa-prazo">
                              {new Date(tarefa.criadaEm).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="conteudo-vazio">
                      <p>Nenhuma tarefa pendente.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

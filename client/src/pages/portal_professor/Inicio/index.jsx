import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import frases from "../../../data/frases.json";
import { FiClock, FiCheckCircle, FiPlus, FiPaperclip, FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
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
  const API = import.meta.env.VITE_API_URL;

  // Tarefas do professor
  const [tarefasProfessor, setTarefasProfessor] = useState([]);
  const [showFormTarefa, setShowFormTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({ titulo: "", descricao: "" });
  const [anexos, setAnexos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [editandoTarefa, setEditandoTarefa] = useState(null); // null = criar, { id, ... } = editar
  const [anexosExistentes, setAnexosExistentes] = useState([]); // anexos já salvos ao editar
  const fileInputRef = useRef(null);

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
        const chaveHoje = `${ano}-${mes}-${dia}`;
        const tarefasHoje = res.data[chaveHoje] || [];
        setAgendaHoje(tarefasHoje);
      })
      .catch((err) => console.error("Erro ao carregar agenda:", err));
  }, [user, API]);

  // Carregar avisos do professor
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API}/api/avisos`, { params: { professorId: user.uid } })
      .then((res) => setAvisos(res.data || []))
      .catch((err) => console.error("Erro ao carregar avisos:", err));
  }, [user, API]);

  // Determinar tipo visual do aviso baseado em palavras-chave
  const getTipoAviso = (titulo, descricao) => {
    const texto = `${titulo} ${descricao}`.toLowerCase();
    if (texto.includes("urgente") || texto.includes("reunião") || texto.includes("reuniao") || texto.includes("prova")) return "urgente";
    if (texto.includes("importante") || texto.includes("inscrição") || texto.includes("inscricao") || texto.includes("feira")) return "importante";
    return "info";
  };

  // Carregar tarefas criadas pelo professor
  const carregarTarefasProfessor = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/api/tarefas-professor`, {
        params: { professorId: user.uid },
      });
      setTarefasProfessor(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar tarefas do professor:", err);
    }
  };

  useEffect(() => {
    carregarTarefasProfessor();
  }, [user, API]);

  // Converter arquivo para base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  // Adicionar anexo
  const handleAnexo = async (e) => {
    const files = Array.from(e.target.files);
    const novos = files.map((f) => ({ file: f, nome: f.name }));
    setAnexos((prev) => [...prev, ...novos]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remover anexo
  const removerAnexo = (index) => {
    setAnexos((prev) => prev.filter((_, i) => i !== index));
  };

  // Enviar nova tarefa ou salvar edição
  const criarTarefa = async (e) => {
    e.preventDefault();
    if (!novaTarefa.titulo.trim()) return;
    setEnviando(true);

    try {
      // Upload dos novos anexos para Cloudinary
      const anexosUpload = [];
      for (const anexo of anexos) {
        const base64 = await fileToBase64(anexo.file);
        const resUpload = await axios.post(`${API}/api/uploads`, {
          fileBase64: base64,
          folder: "tarefas-professor",
        });
        anexosUpload.push({ nome: anexo.nome, url: resUpload.data.url });
      }

      const todosAnexos = [...anexosExistentes, ...anexosUpload];

      if (editandoTarefa) {
        // Editar tarefa existente
        await axios.put(`${API}/api/tarefas-professor?id=${editandoTarefa.id}`, {
          titulo: novaTarefa.titulo,
          descricao: novaTarefa.descricao,
          anexos: todosAnexos,
        });
      } else {
        // Criar nova tarefa
        await axios.post(`${API}/api/tarefas-professor`, {
          titulo: novaTarefa.titulo,
          descricao: novaTarefa.descricao,
          anexos: todosAnexos,
          professorId: user.uid,
          professorNome: user.nome || user.email || "",
        });
      }

      fecharModal();
      carregarTarefasProfessor();
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
      const msg = err?.response?.data?.error || err?.message || "Erro desconhecido";
      alert(`Erro ao salvar tarefa: ${msg}`);
    } finally {
      setEnviando(false);
    }
  };

  // Abrir modal para editar
  const editarTarefa = (tarefa) => {
    setEditandoTarefa(tarefa);
    setNovaTarefa({ titulo: tarefa.titulo, descricao: tarefa.descricao || "" });
    setAnexosExistentes(tarefa.anexos || []);
    setAnexos([]);
    setShowFormTarefa(true);
  };

  // Remover anexo já salvo (na edição)
  const removerAnexoExistente = (index) => {
    setAnexosExistentes((prev) => prev.filter((_, i) => i !== index));
  };

  // Fechar modal e limpar estado
  const fecharModal = () => {
    setShowFormTarefa(false);
    setEditandoTarefa(null);
    setNovaTarefa({ titulo: "", descricao: "" });
    setAnexos([]);
    setAnexosExistentes([]);
  };

  // Deletar tarefa
  const deletarTarefa = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta tarefa?")) return;
    try {
      await axios.delete(`${API}/api/tarefas-professor`, { params: { id } });
      carregarTarefasProfessor();
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
  };

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />

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

              {/* Tarefas para Alunos */}
              <div className="secao-card tarefas-card">
                <div className="secao-header">
                  <FiCheckCircle className="secao-icon tarefas-icon" />
                  <div className="tarefas-header-content">
                    <h2>Tarefas para Alunos</h2>
                    <span className="tarefas-count">{tarefasProfessor.length} tarefa{tarefasProfessor.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <button className="btn-criar-tarefa" onClick={() => { setEditandoTarefa(null); setNovaTarefa({ titulo: "", descricao: "" }); setAnexos([]); setAnexosExistentes([]); setShowFormTarefa(true); }}>
                  <FiPlus size={18} />
                  Criar Nova Tarefa
                </button>

                <div className="tarefas-lista">
                  {tarefasProfessor.length > 0 ? (
                    tarefasProfessor.map((tarefa) => (
                      <div key={tarefa.id} className="tarefa-item">
                        <div className="tarefa-info">
                          <p className="tarefa-titulo">{tarefa.titulo}</p>
                          {tarefa.descricao && (
                            <p className="tarefa-descricao">{tarefa.descricao}</p>
                          )}
                          <div className="tarefa-meta">
                            {tarefa.anexos && tarefa.anexos.length > 0 && (
                              <span className="tarefa-anexos-count">
                                <FiPaperclip size={12} />
                                {tarefa.anexos.length} anexo{tarefa.anexos.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            <span className="tarefa-prazo">
                              {new Date(tarefa.criadaEm).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                        <div className="tarefa-acoes">
                          <button className="btn-editar-tarefa" onClick={() => editarTarefa(tarefa)} title="Editar tarefa">
                            <FiEdit2 size={16} />
                          </button>
                          <button className="btn-deletar-tarefa" onClick={() => deletarTarefa(tarefa.id)} title="Excluir tarefa">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="conteudo-vazio">
                      <p>Nenhuma tarefa criada ainda.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal - Formulário de Nova Tarefa */}
              {showFormTarefa && (
                <div className="modal-overlay" onClick={() => !enviando && fecharModal()}>
                  <div className="modal-form" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>{editandoTarefa ? "Editar Tarefa" : "Nova Tarefa"}</h3>
                      <button className="modal-fechar" onClick={() => !enviando && fecharModal()}>
                        <FiX size={20} />
                      </button>
                    </div>

                    <form onSubmit={criarTarefa}>
                      <div className="form-grupo">
                        <label htmlFor="titulo-tarefa">Nome da Aula / Título</label>
                        <input
                          id="titulo-tarefa"
                          type="text"
                          placeholder="Ex: Física - Óptica Geométrica"
                          value={novaTarefa.titulo}
                          onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                          required
                          disabled={enviando}
                        />
                      </div>

                      <div className="form-grupo">
                        <label htmlFor="descricao-tarefa">Descrição</label>
                        <textarea
                          id="descricao-tarefa"
                          placeholder="Descreva brevemente a tarefa..."
                          value={novaTarefa.descricao}
                          onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                          rows={3}
                          disabled={enviando}
                        />
                      </div>

                      <div className="form-grupo">
                        <label>Anexos</label>
                        <div
                          className="anexo-area"
                          onClick={() => !enviando && fileInputRef.current?.click()}
                        >
                          <FiPaperclip size={20} />
                          <span>Clique para anexar documentos</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleAnexo}
                            style={{ display: "none" }}
                            disabled={enviando}
                          />
                        </div>

                        {anexosExistentes.length > 0 && (
                          <div className="anexos-lista">
                            {anexosExistentes.map((a, i) => (
                              <div key={`exist-${i}`} className="anexo-item anexo-existente">
                                <FiPaperclip size={14} />
                                <a href={getViewUrl(a.url)} target="_blank" rel="noreferrer">{a.nome}</a>
                                <button type="button" onClick={() => removerAnexoExistente(i)} disabled={enviando}>
                                  <FiX size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {anexos.length > 0 && (
                          <div className="anexos-lista">
                            {anexos.map((a, i) => (
                              <div key={i} className="anexo-item">
                                <FiPaperclip size={14} />
                                <span>{a.nome}</span>
                                <button type="button" onClick={() => removerAnexo(i)} disabled={enviando}>
                                  <FiX size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button type="submit" className="btn-enviar-tarefa" disabled={enviando}>
                        {enviando ? "Salvando..." : editandoTarefa ? "Salvar Alterações" : "Criar Tarefa"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

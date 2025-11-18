import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import prof from "../../../assets/logo.png";
import { MdAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import { FaSearch, FaQuoteLeft, FaBell } from "react-icons/fa";
import frases from "../../../data/frases.json";
import { adicionarPontos, removerPontos, mostrarToastPontosAdicionar, mostrarToastPontosRemover, regrasPontuacao } from "../../../services/gamificacao.jsx";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalSearch from "../../../components/portais/GlobalSearch";

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [fraseHoje, setFraseHoje] = useState("");
  const [videos, setVideos] = useState([]);
  const [videoDestaque, setVideoDestaque] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const API = import.meta.env.VITE_API_URL;

 
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

 
  useEffect(() => {
    if (!user?.uid) return;
    const fetchTurmas = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}&arquivada=false`);
        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    };
    fetchTurmas();
  }, [user]);


  const handleIngressar = async () => {
    if (!codigo.trim()) {
      toast.warn("Digite o código da turma.");
      return;
    }
    if (!user?.uid) {
      toast.error("Usuário não autenticado. Faça login novamente.");
      return;
    }

    try {
      await axios.post(`${API}/api/turmas/ingressar`, {
        codigo,
        alunoId: user.uid,
      });
      await adicionarPontos(
        user.uid,
        regrasPontuacao.participarTurma,
        "Ingressou em uma nova turma!"
      );
      mostrarToastPontosAdicionar(regrasPontuacao.participarTurma, "Ingressou em uma nova turma!");
      toast.success("Ingressou na turma com sucesso!");

      setOpen(false);
      setCodigo("");

      
      const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}&arquivada=false`);
      setTurmas(res.data);
    } catch (err) {
      console.error("Erro ao ingressar:", err.response?.data || err);
      toast.error(err.response?.data?.error || "Código inválido ou erro ao ingressar.");
    }
  };

  
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

  
  useEffect(() => {
    if (!user?.uid) return;
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const somaChar = user.uid.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const index = (diaDoAno + somaChar) % frases.length;
    setFraseHoje(frases[index]);
  }, [user]);

 
  useEffect(() => {
    if (!videos?.length) return;
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const somaChar = (user?.uid || "guest").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const idx = ((diaDoAno + somaChar) % videos.length + videos.length) % videos.length;
    setVideoDestaque(videos[idx]);
  }, [videos, user]);

  
  useEffect(() => {
    if (!user?.uid) return;
    const carregarAvisos = async () => {
      try {
        const res = await axios.get(`${API}/api/avisos?alunoId=${user.uid}`);
        setAvisos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar avisos:", err);
      }
    };
    carregarAvisos();
  }, [user]);

  return (
    <div className="layout">
      
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />
           <GlobalSearch /> <br/>

          <div className="inicio-dashboard">
            <div className="frase">
              <FaQuoteLeft />
              <p>{fraseHoje}</p>
            </div>

            <div className="mini-semana">
              <div className="topo-mini">
                <h3>
                  Semana de {new Date().toLocaleString("pt-BR", { month: "long" })}{" "}
                  {new Date().getFullYear()}
                </h3>
              </div>

              <div className="semana-atual">
                {(() => {
                  const hoje = new Date();
                  const primeiroDia = new Date(hoje);
                  primeiroDia.setDate(hoje.getDate() - hoje.getDay());
                  const diasSemana = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(primeiroDia);
                    d.setDate(primeiroDia.getDate() + i);
                    return d;
                  });

                  return diasSemana.map((dia) => {
                    const isHoje =
                      dia.getDate() === hoje.getDate() &&
                      dia.getMonth() === hoje.getMonth() &&
                      dia.getFullYear() === hoje.getFullYear();

                    return (
                      <div
                        key={dia.toISOString()}
                        className={`dia-semana ${isHoje ? "hoje-semana" : ""}`}
                      >
                        <span className="nome-dia">
                          {["D", "S", "T", "Q", "Q", "S", "S"][dia.getDay()]}
                        </span>
                        <span className="numero-dia">{dia.getDate()}</span>
                      </div>
                    );
                  });
                })()}
              </div>

              <Link to="/aluno/agenda" className="botao-mini-agenda">
                Ver Agenda Completa
              </Link>
            </div>
          </div>

          <strong className="titulo-turmas">Minhas Turmas Ativas</strong>
          <div className="turmas-grid">
            {turmas.length > 0 ? (
              turmas.map((turma) => (
                <Link to={`/aluno/turma/${turma.id}`} key={turma.id} className="container-turma">
                  <div className="turma-inicio">
                    <img
                      src={turma.imagem || "/src/assets/fundo-turma-padrao.jpg"}
                      alt="Fundo da turma"
                      className="img-turma"
                    />
                    <img
                      src={turma.professorFoto || user.foto || prof}
                      alt="Foto do professor"
                      className="foto-circulo-prof"
                    />
                    <p className="nome-turma">{turma.nomeTurma}</p>
                    <p className="materia-turma">{turma.materia}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="sem-turmas">Nenhuma turma ativa encontrada.</p>
            )}
          </div>

          <div className="dashboard">
            <div className="section-avisos">
              <h4>Avisos e Comunicados</h4>
              {avisos.length > 0 ? (
                <div className="aviso">
                  {avisos.slice(0, 3).map((aviso) => (
                    <div key={aviso.id} className="aviso-cards">
                      <h4>{aviso.titulo}</h4>
                      <p>{aviso.descricao}</p>
                      <strong className="responsavel">
                        Atenciosamente, {aviso.responsavel}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sem-avisos">Nenhum aviso encontrado.</p>
              )}

              <Link to="/aluno/avisos" className="todos-avisos">
                <FaBell /> Visualizar todos
              </Link>
            </div>

            <div className="video-destaque-wrapper">
              <p>Vídeo Destaque</p>
              {videoDestaque ? (
                <div className="video-destaque">
                  <h4 className="titulo-video">{videoDestaque.titulo}</h4>
                  <div className="video-iframe">
                    <iframe
                      src={toEmbed(videoDestaque.url)}
                      title={videoDestaque.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: "100%", aspectRatio: "16/9", border: 0, borderRadius: 12 }}
                    />
                  </div>
                  <p className="descricao-video">{videoDestaque.descricao}</p>
                </div>
              ) : (
                <div className="video-destaque vazio">
                  <p>Nenhum vídeo disponível.</p>
                </div>
              )}
            </div>
          </div>

          <button className="botao-flutuante" onClick={() => setOpen(true)}>
            <MdAdd size={28} />
          </button>

          {open && (
            <div className="modal-criar">
              <div className="modal-content">
                <h2>Ingressar em uma turma</h2>
                <input
                  placeholder="Código da Turma"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <button onClick={handleIngressar}>Ingressar</button>
                <button onClick={() => setOpen(false)} className="cancelar">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

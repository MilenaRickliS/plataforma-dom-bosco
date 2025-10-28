import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import prof from "../../../assets/site/Enri-Clemente-Leigman-scaled-removebg-preview.png";
import { GoKebabHorizontal } from "react-icons/go";
import { MdOutlinePushPin, MdAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import { FaSearch } from "react-icons/fa";
import { FaQuoteLeft } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import frases from "../../../data/frases.json";

export default function Inicio() {
  const { user } = useContext(AuthContext); 
  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [fraseHoje, setFraseHoje] = useState("");
  const [videos, setVideos] = useState([]); 
  const [videoDestaque, setVideoDestaque] = useState(null);
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
        const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}`);
        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao carregar turmas do aluno:", err);
      }
    };
    fetchTurmas();
  }, [user]);

 
  const handleIngressar = async () => {
    if (!codigo.trim()) {
      alert("Digite o código da turma.");
      return;
    }
    if (!user?.uid) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    try {
      await axios.post(`${API}/api/turmas/ingressar`, {
        codigo,
        alunoId: user.uid, 
      });
      alert("Ingressou na turma com sucesso!");
      setOpen(false);
      setCodigo("");

      
      const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}`);
      setTurmas(res.data);
    } catch (err) {
      console.error("Erro ao ingressar:", err.response?.data || err);
      alert(err.response?.data?.error || "Código inválido ou erro ao ingressar.");
    }
  };

  const carregarVideos = async () => {
    try {
      const res = await axios.get(`${API}/api/videos`);
      setVideos(res.data || []);
    } catch (e) {
      console.error("Erro ao listar vídeos:", e);
    }
  };

  useEffect(() => {
    carregarVideos();
  }, [API]);

  useEffect(() => {
    if (!user?.uid) return;

    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );

    
    const somaChar = user.uid
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

   
    const index = (diaDoAno + somaChar) % frases.length;

    setFraseHoje(frases[index]);
  }, [user]);

  useEffect(() => {
    if (!videos?.length) {
      setVideoDestaque(null);
      return;
    }
    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const somaChar = (user?.uid || "guest")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const idx = ((diaDoAno + somaChar) % videos.length + videos.length) % videos.length;
    setVideoDestaque(videos[idx]);
  }, [videos, user]);

  useEffect(() => {
    if (!user?.uid) return;

    const carregarAvisosNaoLidos = async () => {
      try {
        const res = await axios.get(`${API}/api/avisos?alunoId=${user.uid}`);
        const naoLidos = res.data.filter((a) => !a.lido).length;
        
        
        localStorage.setItem("avisosNaoLidos", naoLidos.toString());
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Erro ao atualizar avisos não lidos:", err);
      }
    };

    carregarAvisosNaoLidos();
  }, [user]);

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />
          <div className="barra-pesquisa-dashboard">
            <p>Pesquisar...</p>
            <FaSearch />
          </div>
          <div className="inicio-dashboard">
             <div className="frase">
            <FaQuoteLeft />
            <p>{fraseHoje}</p>
          </div>
          <div className="mini-semana">
                  <div className="topo-mini">
                    <h3>
                      Semana de{" "}
                      {new Date().toLocaleString("pt-BR", { month: "long" })}{" "}
                      {new Date().getFullYear()}
                    </h3>
                  </div>
                  <div className="semana-atual">
                    {(() => {
                      const hoje = new Date();
                      const primeiroDiaSemana = new Date(hoje);
                      primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay()); // domingo

                      const diasSemana = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(primeiroDiaSemana);
                        d.setDate(primeiroDiaSemana.getDate() + i);
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
         
          <strong className="titulo-turmas">Turmas</strong>
              <div className="turmas-grid">
                {turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <Link
                      key={turma.codigo}
                      to={`/aluno/turma/${turma.codigo}`}
                      className="container-turma"
                    >
                      <div className="turma-inicio">                       
                          <img src={turma.imagem || prof} alt="turma" className="img-turma"/>                       
                          <p>{turma.nomeTurma}</p>
                          <p>{turma.materia}</p>
                      </div>
                      
                    </Link>
                  ))
                ) : (
                  <p className="sem-turmas">Nenhuma turma encontrada.</p>
                )}
              </div>
          
           <div className="dashboard">
            <div className="section-avisos">
                <strong>Avisos e Comunicados</strong>
                <div className="aviso">
                  <div>
                    <strong>Titulo</strong>
                    <p>descricao</p>
                    <strong>Atensiosamente,<br/>Nome Completo</strong>
                  </div>
                  <div>
                    <strong>Titulo</strong>
                    <p>descricao</p>
                    <strong>Atensiosamente,<br/>Nome Completo</strong>
                  </div>
                  <div>
                    <strong>Titulo</strong>
                    <p>descricao</p>
                    <strong>Atensiosamente,<br/>Nome Completo</strong>
                  </div>
                  
                </div><br/>
                <Link to="/aluno/avisos" className="todos-avisos"><FaBell /> Visualizar todos</Link>
              </div> 
               <div className="video-destaque-wrapper">
                <p>Vídeo Destaque</p>

              {videoDestaque ? (
                <div className="video-destaque">
                  <h4 className="titulo-video">{videoDestaque.titulo}</h4>

                  
                  {(() => {
                    const embed = toEmbed(videoDestaque.url);
                    const isDirectVideo =
                      embed && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(embed);

                    if (isDirectVideo) {
                      return (
                        <video
                          key={embed}
                          src={embed}
                          controls
                          playsInline
                          style={{ width: "100%", borderRadius: 12 }}
                        />
                      );
                    }

                    
                    if (embed) {
                      return (
                        <div className="video-iframe">
                          <iframe
                            key={embed}
                            src={embed}
                            title={videoDestaque.titulo}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{
                              width: "100%",
                              aspectRatio: "16/9",
                              border: 0,
                              borderRadius: 12,
                            }}
                          />
                        </div>
                      );
                    }

                    
                    return (
                      <a href={videoDestaque.url} target="_blank" rel="noreferrer">
                        Abrir vídeo
                      </a>
                    );
                  })()}

                  {videoDestaque.descricao ? (
                    <p className="descricao-video">{videoDestaque.descricao}</p>
                  ) : null}

                 
                  <div className="meta-video">
                    {videoDestaque.categoria && (
                      <span className="chip">{videoDestaque.categoria}</span>
                    )}
                  </div>
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
                <button onClick={() => setOpen(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

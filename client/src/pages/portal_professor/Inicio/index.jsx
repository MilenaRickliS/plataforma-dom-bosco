import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import { MdAdd, MdOutlinePushPin } from "react-icons/md";
import { GoKebabHorizontal } from "react-icons/go";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import prof from "../../../assets/logo.png";
import "./style.css";
import { FaSearch } from "react-icons/fa";
import { FaQuoteLeft } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import frases from "../../../data/frases.json";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  adicionarPontos,
  mostrarToastPontosAdicionar,
  regrasPontuacao
} from "../../../services/gamificacao.jsx";
import GlobalSearch from "../../../components/portais/GlobalSearch";

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [nomeTurma, setNomeTurma] = useState("");
  const [materia, setMateria] = useState("");
  const [imagem, setImagem] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [fraseHoje, setFraseHoje] = useState("");
  const API = import.meta.env.VITE_API_URL;
  const [avisos, setAvisos] = useState([]);
  
  const [videos, setVideos] = useState([]); 
  const [videoDestaque, setVideoDestaque] = useState(null);
  
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
        const res = await axios.get(`${API}/api/turmas?professorId=${user.uid}&arquivada=false`);

        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    };
    fetchTurmas();
  }, [user]);

  const handleUpload = async () => {
    if (!imagem) return null;
    const data = new FormData();
    data.append("file", imagem);
    data.append("upload_preset", "plataforma_dom_bosco");
    data.append("folder", "turmas");
    const res = await axios.post(`https://api.cloudinary.com/v1_1/dfbreo0qd/image/upload`, data);
    return res.data.secure_url;
  };

  const handleCriar = async () => {
    if (!user?.uid) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }
    if (!nomeTurma.trim() || !materia.trim()) {
      toast.warn("Preencha o nome da turma e a matéria antes de criar.");
      return;
    }

    if (!imagem) {
      toast.warn("Selecione uma imagem de fundo para a turma.");
      return;
    }

   
    const regexValido = /^[A-Za-zÀ-ú0-9\s.,;:/()º°'"!?\-_]+$/;


    if (!regexValido.test(nomeTurma)) {
      toast.error("O nome da turma contém caracteres inválidos.");
      return;
    }

    if (!regexValido.test(materia)) {
      toast.error("A matéria contém caracteres inválidos.");
      return;
    }

    try {
      const imgUrl = await handleUpload();
      const { data } = await axios.post(`${API}/api/turmas/criar`, {
        nomeTurma,
        materia,
        imagem: imgUrl,
        professorId: user.uid,
        
      });
      toast.success(`Turma criada com sucesso!\nCódigo: ${data.codigo}`);
     await adicionarPontos(
        user.uid,
        regrasPontuacao.criarTurma,
        `Criou a turma ${nomeTurma}`
      );
      mostrarToastPontosAdicionar(regrasPontuacao.criarTurma, "Criou uma nova turma!");
      setOpen(false);
      setNomeTurma("");
      setMateria("");
      setImagem(null);
      document.getElementById("preview-img").style.display = "none";
      setTurmas((prev) => [...prev, { nomeTurma, materia, imagem: imgUrl, codigo: data.codigo }]);
    } catch (error) {
      console.error("Erro ao criar turma:", error.response?.data || error);
      toast.error("Erro ao criar turma. Verifique os dados e tente novamente.");
      
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

  const carregarAvisos = async () => {
    if (!user?.uid) return;
    try {
      
      const res = await axios.get(`${API}/api/avisos?professorId=${user.uid}`);
      setAvisos(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar avisos:", err);
    }
  };

  useEffect(() => {
    carregarAvisos();
  }, [user]);


  if (!user) {
    return <p>Carregando informações do professor...</p>;
  }

  return (
    <div className="layout">
     
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
          <GlobalSearch /><br/>
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
                  <Link to="/professor/agenda" className="botao-mini-agenda">
                    Ver Agenda Completa
                  </Link>
                </div>          
            </div>

            <strong className="titulo-turmas">Turmas</strong>
            <div className="turmas-grid">
            {turmas.length > 0 ? (
              turmas.map((turma) => (
                <Link to={`/professor/turma/${turma.id}`} key={turma.id} className="container-turma">

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
              <p className="sem-turmas">Nenhuma turma encontrada.</p>
            )}
          </div>

          <div className="dashboard">
            <div className="section-avisos">
                <strong>Avisos e Comunicados</strong>

                {avisos.length > 0 ? (
                  <div className="aviso">
                    {avisos.slice(0, 3).map((aviso) => (
                      <div key={aviso.id} className="aviso-cards">
                        <h4>{aviso.titulo}</h4>
                        <p>{aviso.descricao}</p>
                        <p className="turmas">
                          Turmas: {aviso.turmasNomes?.join(", ") || "—"}
                        </p>
                        <strong className="responsavel">Atenciosamente, {aviso.responsavel}</strong>
                        
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sem-avisos">Nenhum aviso encontrado.</p>
                )}

                <Link to="/professor/avisos" className="todos-avisos">
                  <FaBell /> Visualizar todos
                </Link>
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
                <h2>Criar Turma</h2>

                <input
                  placeholder="Nome da Turma"
                  value={nomeTurma}
                  onChange={(e) => setNomeTurma(e.target.value)}
                />

                <input
                  placeholder="Matéria"
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                />

                <div className="upload-section-criarTurma">
                  <label htmlFor="file-upload" className="label-upload-criarTurma">
                    Escolher imagem de fundo
                  </label>

                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setImagem(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const preview = document.getElementById("preview-img");
                          preview.src = reader.result;
                          preview.style.display = "block";
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  <img id="preview-img" className="preview-img-criarTurma" alt="Prévia da imagem" />
                </div>

                <button onClick={handleCriar}>Criar</button>
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

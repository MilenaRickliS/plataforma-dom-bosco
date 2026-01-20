import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";
import { FaQuoteLeft } from "react-icons/fa";
import frases from "../../../data/frases.json";
import "react-toastify/dist/ReactToastify.css";

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [fraseHoje, setFraseHoje] = useState("");
  const API = import.meta.env.VITE_API_URL;
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

  if (!user) {
    return <p>Carregando informações do professor...</p>;
  }

  return (
    <div className="layout">
     
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
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

            

          <div className="dashboard">
            

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
                          muted
                          playsInline
                          autoPlay
                          style={{ width: "100%", borderRadius: 12 }}
                        />

                      );
                    }

                    
                    if (embed) {
                      return (
                        <div className="video-iframe">
                          <iframe
                            key={embed}
                            src={
                              (() => {
                                const base = embed;
                                const params = "autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1";
                                return base.includes("?") ? `${base}&${params}` : `${base}?${params}`;
                              })()
                            }
                            title={videoDestaque.titulo}
                            allow="autoplay; encrypted-media; picture-in-picture"
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
        </main>
      </div>
    </div>
  );
}

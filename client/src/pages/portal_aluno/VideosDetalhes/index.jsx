import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./style.css";
import axios from "axios";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import "react-toastify/dist/ReactToastify.css";


export default function DetalhesVideo() {
  const { user } = useContext(AuthContext);
 const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assistirVideo, setAssistiuVideo] = useState(false);
  


  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await axios.get(`${API}/api/videos/${id}`);
        setVideo(data);
      } catch (error) {
        console.error("Erro ao buscar vídeo:", error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  function LoadingVideo() {
    return (
      <div className="loading-video-page">
        <div className="loading-header skeleton"></div>

        <div className="loading-player skeleton">
          <div className="spinner"></div>
        </div>

        <div className="loading-desc">
          <div className="skeleton line"></div>
          <div className="skeleton line"></div>
          <div className="skeleton line short"></div>
        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="layout">
        <MenuLateralAluno />
        <div className="page2">
          <MenuTopoAluno />
          <LoadingVideo />
        </div>
      </div>
    );
  }

  if (!video) return <p>Vídeo não encontrado.</p>;

  const isYouTube = video?.url?.includes("youtube.com") || video?.url?.includes("youtu.be");
  console.log("Vídeo carregado:", video);
  console.log("Tipo:", `"${video?.tipo}"`);

  const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
};


  return (
    <div className="layout">
     

      <MenuLateralAluno />  
      <div className="page2">
        <main className="detalhes-video">
          <MenuTopoAluno/>

          <h2 className="titulo-video-detalhes">{video.titulo}</h2><br />
          <span className="titulo-categoria">{video.categoria}</span>
          <br /> <br />

          <div className="player-container">
          {video?.tipo === "upload" ? (
            <video
              src={video?.url}
              controls
              width="100%"
              height="400"
              style={{ borderRadius: "12px", backgroundColor: "#000" }}
              onTimeUpdate={(e) => {
                const vid = e.target;
                const progresso = (vid.currentTime / vid.duration) * 100;
                vid.dataset.progresso = progresso;
              }}
              onEnded={async (e) => {
                const vid = e.target;
                const progresso = parseFloat(vid.dataset.progresso || 0);

                if (progresso >= 80) {
                  setAssistiuVideo(true); 
                  const chaveAssistido = `${user.uid}-video-${video.id}`;
                  
                }
              }}
              onPause={async (e) => {
                const vid = e.target;
                const progresso = parseFloat(vid.dataset.progresso || 0);

               
              }}
            >

              Seu navegador não suporta vídeos.
            </video>
          ) : isYouTube ? (
            <iframe
              src={getEmbedUrl(video.url)}
              title={video?.titulo}
              allowFullScreen
              width="100%"
              height="400"
              style={{ borderRadius: "12px" }}
            ></iframe>

          ) : (
            <a
              href={video?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-externo"
            >
              Acessar vídeo externo
            </a>
          )}
        </div>
        <div className="descricao-video">
            <p className="titulo-descricao">Descrição</p>
            <p>{video.descricao}</p>
        </div>
          

          
        </main>
      </div>
    </div>
  );
}

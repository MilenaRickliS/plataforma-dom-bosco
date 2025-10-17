import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";
import axios from "axios";

export default function DetalhesVideo() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Carregando...</p>;
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
      <MenuLateralProfessor />  
      <div className="page2">
        <main className="detalhes-video">
          <MenuTopoProfessor/>

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

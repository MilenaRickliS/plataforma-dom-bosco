import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./style.css";
import axios from "axios";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";

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
      <MenuLateralAluno />  
      <div className="page2">
        <main className="detalhes-video">
          <MenuTopoAluno/>

          <h2>{video.titulo}</h2>
          <p className="descricao">{video.descricao}</p>
          <span className="categoria">Categoria: {video.categoria}</span>
          <br />

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


          
        </main>
      </div>
    </div>
  );
}

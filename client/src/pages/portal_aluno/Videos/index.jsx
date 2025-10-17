import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./style.css";
import axios from "axios";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";

export default function Videos() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await axios.get(`${API}/api/videos`);
        setVideos(data);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
      }
    };
    carregar();
  }, []);

  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main>
          <MenuTopoAluno/>
          

          <div className="grid-videos">
            {videos.map((v) => (
              <Link
                to={`/aluno/videos/${v.id}`}
                key={v.id}
                className="container-video"
              >
                
                {v.tipo === "upload" ? (
                  <video src={v.url} className="thumb-video" />
                ) : (
                  
                  <img
                    src={`https://img.youtube.com/vi/${v.url
                      .split("v=")[1]
                      ?.split("&")[0] || "default"}/0.jpg`}
                    alt={v.titulo}
                    className="thumb-video"
                  />
                )}
                <p className="titulo-video">{v.titulo}</p>
                <span className="categoria-video">{v.categoria}</span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

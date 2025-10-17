import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import { PiVideoLight } from "react-icons/pi";
import Slider from "react-slick";
import axios from "axios";
import './style.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";

export default function Videos() {
  const API =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

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

 
  const videosPorCategoria = videos.reduce((acc, v) => {
    const categoria = v.categoria || "Outros";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(v);
    return acc;
  }, {});


  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor/>
          <Link to="/add-videos-professor" className="botao-postar">
            <PiVideoLight /> Postar vídeo
          </Link>

          
          {Object.entries(videosPorCategoria).map(([categoria, lista]) => (
            <section key={categoria} className="secao-videos">
              <h3 className="titulo-categoria">{categoria}</h3>

              <Slider {...sliderSettings} className="carrossel-videos">
                {lista.map((v) => (
                  <div key={v.id} className="slide-video">
                    <Link to={`/professor/videos/${v.id}`} className="container-video">
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
                    </Link>
                  </div>
                ))}
              </Slider>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

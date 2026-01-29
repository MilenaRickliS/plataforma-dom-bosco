import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import axios from "axios";
import "./style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";

export default function Videos() {
  const API =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/videos`);
        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [API]);

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

  
  const categoriasSkeleton = [
    "Carregando...",
    "Carregando...",
    "Carregando...",
  ];

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />

          {loading ? (
            <div className="videos-loading">
              <div className="videos-loading-header">
                <div className="sk sk-title" />
                <div className="sk sk-sub" />
              </div>

              {categoriasSkeleton.map((_, idx) => (
                <section key={idx} className="secao-videos">
                  <div className="sk sk-cat" />
                  <div className="videos-skel-grid">
                    {Array.from({ length: 6 }).map((__, i) => (
                      <div key={i} className="sk-card-video">
                        <div className="sk sk-thumb" />
                        <div className="sk sk-line" />
                        <div className="sk sk-line small" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            Object.entries(videosPorCategoria).map(([categoria, lista]) => (
              <section key={categoria} className="secao-videos">
                <h3 className="titulo-categoria">{categoria}</h3>

                <Slider {...sliderSettings} className="carrossel-videos">
                  {lista.map((v) => (
                    <div key={v.id} className="slide-video">
                      <Link to={`/aluno/videos/${v.id}`} className="container-video">
                        {v.tipo === "upload" ? (
                          <video src={v.url} className="thumb-video" />
                        ) : (
                          <img
                            src={`https://img.youtube.com/vi/${
                              v.url.split("v=")[1]?.split("&")[0] || "default"
                            }/0.jpg`}
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
            ))
          )}
        </main>
      </div>
    </div>
  );
}

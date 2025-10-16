import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './style.css';

export default function Galeria() {
  const API = import.meta.env.VITE_API_URL;
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 9;

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const res = await axios.get(`${API}/api/galeria`);

        
        const ordenadas = res.data
          .sort((a, b) => {
            const dataA = new Date(a.createdAt || 0);
            const dataB = new Date(b.createdAt || 0);
            return dataB - dataA; 
          })
          .map((item) => ({
            id: item.id,
            src: item.imageUrl,
            title: item.title,
          }));

        setFotos(ordenadas);
      } catch (error) {
        console.error("Erro ao carregar galeria:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFotos();
  }, []);

  const totalPages = Math.ceil(fotos.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = fotos.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="galeria-page">
      <Header />
      <main className="galeria-main">
        <div className="galeria-container">
          <h1 className="galeria-title">Galeria</h1>

         
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando fotos...</p>
            </div>
          ) : fotos.length === 0 ? (
            <p className="sem-fotos">Nenhuma foto foi adicionada ainda.</p>
          ) : (
            <>
              <div className="galeria-grid">
                {currentImages.map((image, index) => (
                  <div key={image.id} className="galeria-item fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <img src={image.src} alt={image.title} loading="lazy" />
                    <div className="galeria-overlay">
                      <h3>{image.title}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="galeria-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => {
                    goToPreviousPage();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                >
                  <IoIosArrowBack /> Anterior
                </button>

                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  onClick={() => {
                    goToNextPage();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                >
                  Próxima <IoIosArrowForward />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

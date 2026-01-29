import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { IoIosArrowBack, IoIosArrowForward, IoIosClose } from "react-icons/io";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";
import "./style.css";

export default function Galeria() {
  const API =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 9;

 
  const [selected, setSelected] = useState(null); 
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
  }, [API]);

  const totalPages = Math.ceil(fotos.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = fotos.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

 
  const openModal = (img) => {
    setSelected(img);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    document.body.style.overflow = "hidden"; 
  };

  const closeModal = useCallback(() => {
    setSelected(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
    document.body.style.overflow = ""; 
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(4, +(z + 0.2).toFixed(2)));
  const zoomOut = () => {
    setZoom((z) => {
      const nz = Math.max(1, +(z - 0.2).toFixed(2));
      if (nz === 1) setOffset({ x: 0, y: 0 });
      return nz;
    });
  };


  useEffect(() => {
    const onKeyDown = (e) => {
      if (!selected) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-" || e.key === "_") zoomOut();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, closeModal]);


  const onWheel = (e) => {
    if (!selected) return;
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    if (delta > 0) zoomOut();
    else zoomIn();
  };

  
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setDragging(false);

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
                  <button
                    key={image.id}
                    className="galeria-item fade-in galeria-btn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => openModal(image)}
                    type="button"
                  >
                    <img src={image.src} alt={image.title} loading="lazy" />
                    <div className="galeria-overlay">
                      <h3>{image.title}</h3>
                    </div>
                  </button>
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

      
      {selected && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div className="lightbox-topbar" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-title">{selected.title}</div>

            <div className="lightbox-actions">
              <button className="icon-btn" onClick={zoomOut} type="button" aria-label="Diminuir zoom">
                <FiZoomOut />
              </button>
              <button className="icon-btn" onClick={zoomIn} type="button" aria-label="Aumentar zoom">
                <FiZoomIn />
              </button>
              <button className="icon-btn close" onClick={closeModal} type="button" aria-label="Fechar">
                <IoIosClose />
              </button>
            </div>
          </div>

          <div
            className="lightbox-stage"
            onClick={(e) => e.stopPropagation()}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img
              className={`lightbox-img ${dragging ? "dragging" : ""}`}
              src={selected.src}
              alt={selected.title}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              }}
              draggable={false}
            />
          </div>

          <div className="lightbox-hint" onClick={(e) => e.stopPropagation()}>
            {zoom > 1 ? "Arraste para mover • Scroll para zoom • ESC para fechar" : "Scroll para zoom • ESC para fechar"}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

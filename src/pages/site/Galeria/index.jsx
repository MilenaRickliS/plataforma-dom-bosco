import { useState } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './style.css';

import img1 from '../../../assets/site/Arraia-Dom-Bosco-2024_07-e-08.06-2-scaled.jpg';
import img2 from '../../../assets/site/celebracao.webp';
import img3 from '../../../assets/site/Dia-das-criancas_11.10-12-scaled.webp';
import img4 from '../../../assets/site/DSC_0221-scaled.webp';
import img5 from '../../../assets/site/Entrega-alimentos-Mesa-Brasil_16.08-4.webp';
import img6 from '../../../assets/site/Entrega-de-pizzas_11.10-3-scaled.webp';
import img7 from '../../../assets/site/JEPS_10.05.24_Joaquim-Prestes_editadas-5-scaled.webp';
import img8 from '../../../assets/site/Portal-RSN-Jogos-Escolares-Foto-Aen.webp';
import img9 from '../../../assets/site/Semaforo-Solidario-dia-de-doar_28.11-2-scaled.webp';
import img10 from '../../../assets/site/Torneio-de-Penaltis-Butiero-2a-edicao_07.09.24_IADB-1-scaled.jpg';
import img11 from '../../../assets/site/Visita-P.-Inspetor-Ademir-Ricardo-SDB_12-13-e-14-3.webp';
import img12 from '../../../assets/site/Visita-P.-Inspetor-Ademir-Ricardo-SDB_12-13-e-14-4-1024x768.webp';
import img13 from '../../../assets/site/WhatsApp-Image-2024-08-27-at-10.50.37.webp';
import img14 from '../../../assets/site/11o-FEMUS-Dom-Bosco_07-e-08.06-10.webp';
import img15 from '../../../assets/site/1o-Torneio-de-Penaltis-Butiero_21.04-7-scaled.webp';
import img16 from '../../../assets/site/18-11-2019_09-50-27.jpg';
import img17 from '../../../assets/site/18-11-2019_09-50-38.jpg';
import img18 from '../../../assets/site/Beautiful My Photos.jpg';

//por enquanto esta bem estatico estas imagens, depois deixo algo dinamico e mais facil de manter e escalar -bruno
const galleryImages = [
  { id: 1, src: img1, alt: "Arraiá Dom Bosco 2024", title: "Arraiá Dom Bosco 2024" },
  { id: 2, src: img2, alt: "Celebração", title: "Celebração" },
  { id: 3, src: img3, alt: "Dia das Crianças", title: "Dia das Crianças" },
  { id: 4, src: img4, alt: "Evento Dom Bosco", title: "Evento Dom Bosco" },
  { id: 5, src: img5, alt: "Entrega de Alimentos Mesa Brasil", title: "Entrega de Alimentos Mesa Brasil" },
  { id: 6, src: img6, alt: "Entrega de Pizzas", title: "Entrega de Pizzas" },
  { id: 7, src: img7, alt: "JEPS Joaquim Prestes", title: "JEPS Joaquim Prestes" },
  { id: 8, src: img8, alt: "Portal RSN Jogos Escolares", title: "Portal RSN Jogos Escolares" },
  { id: 9, src: img9, alt: "Semáforo Solidário", title: "Semáforo Solidário" },
  { id: 10, src: img10, alt: "Torneio de Pênaltis", title: "Torneio de Pênaltis" },
  { id: 11, src: img11, alt: "Visita P. Inspetor", title: "Visita P. Inspetor" },
  { id: 12, src: img12, alt: "Visita P. Inspetor 2", title: "Visita P. Inspetor 2" },
  { id: 13, src: img13, alt: "WhatsApp Image", title: "Atividades Dom Bosco" },
  { id: 14, src: img14, alt: "11º FEMUS Dom Bosco", title: "11º FEMUS Dom Bosco" },
  { id: 15, src: img15, alt: "1º Torneio de Pênaltis", title: "1º Torneio de Pênaltis" },
  { id: 16, src: img16, alt: "Evento 2019", title: "Evento 2019" },
  { id: 17, src: img17, alt: "Evento 2019 - 2", title: "Evento 2019 - 2" },
  { id: 18, src: img18, alt: "Beautiful My Photos", title: "Beautiful My Photos" }
];

export default function Galeria() {
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 9;
  const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = galleryImages.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="page">
      <Header />
      <main className="galeria-main">
        <div className="galeria-container">
          <h1 className="galeria-title">Galeria</h1>
          
          <div className="galeria-grid">
            {currentImages.map((image) => (
              <div key={image.id} className="galeria-item">
                <img src={image.src} alt={image.alt} />
                <div className="galeria-overlay">
                  <h3>{image.title}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="galeria-pagination">
            <button 
              className="pagination-btn" 
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <IoIosArrowBack /> Anterior
            </button>
            
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button 
              className="pagination-btn" 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Próxima <IoIosArrowForward />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

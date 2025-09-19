import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { IoArrowForwardCircleOutline, IoArrowBackCircleOutline } from "react-icons/io5";

import './style.css';

export default function Educacao() {
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; 
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="page">
        <Header />
        <main>
          <h1>Cursos</h1>
          <div className="carrosel-container">
            <IoArrowBackCircleOutline className="arrow" onClick={() => scroll("left")} />
            <div className="carrosel-cursos" ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}>
              <Link to="/detalhes-curso" className="curso1">
                <h3>Jovem<br/>Aprendiz</h3>
                <p>A oportunidade que abre portas para o seu futuro!</p>
              </Link>
              <Link to="/detalhes-curso" className="curso2">
                <h3>Música</h3>
                <p>Aprenda a tocar instrumentos do básico ao avançado com professores capacitados!</p>
              </Link>
              <Link to="/detalhes-curso" className="curso3">
                <h3>Informática</h3>
                <p>Uso básico de computador e internet, Office/Google, e-mail e nuvem, segurança online e noções de hardware/programação para o dia a dia.</p>
              </Link>
              <Link to="/detalhes-curso" className="curso4">
                <h3>Esportes</h3>
                <p>Aprenda ou aprimore suas habilidades no seu esporte favorito!</p>
              </Link>
              <Link to="/detalhes-curso" className="curso5">
                <h3>Pré-<br/>apredizagem</h3>
                <p>Estimula o aprendizado de habilidades essenciais!</p>
              </Link>
            </div>
            <IoArrowForwardCircleOutline className="arrow" onClick={() => scroll("right")} />
          </div>
          <div className="projetos">
            <div className="proj-titulo">
                <h1>Projetos e<br/>Oficina</h1>
                <div className="arrow2">
                  <IoArrowBackCircleOutline />
                  <IoArrowForwardCircleOutline />
                </div>
                <Link to="/projetos&oficinas" className="link-proj">Ver todos</Link>
            </div>
            <div className="proj-view">
              <div className="exemplo">
                Projeto 1
              </div>
              <div className="exemplo">
                Projeto 2
              </div>
              <div className="exemplo">
                Projeto 3
              </div>
              <div className="exemplo">
                Projeto 4
              </div>
            </div>
            
          </div>
                
        </main>
        <Footer />
    </div>
  );
}

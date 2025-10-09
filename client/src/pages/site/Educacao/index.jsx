import { useRef } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline, IoArrowForwardCircleOutline } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './style.css';

export default function Educacao() {
  const sliderRef = useRef(null);
  
  const cursos = [
    { id: 1, nome: "Jovem Aprendiz", subtitulo: "A oportunidade que abre portas para o seu futuro!", bg: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)", link: "/detalhes-curso"},
    { id: 2, nome: "Música", subtitulo: "Aprenda a tocar instrumentos do básico ao avançado com professores capacitados!", bg: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)", link: "/detalhes-curso" },
    { id: 3, nome: "Informática", subtitulo: "Uso básico de computador e internet, Office/Google, e-mail e nuvem, segurança online e noções de hardware/programação para o dia a dia.", bg: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)", link: "/detalhes-curso" },
    { id: 4, nome: "Esportes", subtitulo: "Aprenda ou aprimore suas habilidades no seu esporte favorito!", bg: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", link: "/detalhes-curso" },
    { id: 5, nome: "Pré-aprendizagem", subtitulo: "Estimula o aprendizado de habilidades essenciais!", bg: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)", link: "/detalhes-curso" },
  ];

  return (
    <div className="page">
      <Header />
      <main>
        <h1>Cursos</h1>
        <div className="menu-cursos">
            {cursos.map((curso) => (
              <div key={curso.id} className="card-curso">
                <h4>{curso.nome}</h4>
                <p>{curso.subtitulo}</p>
                <Link to={curso.link}>Saiba mais!</Link>
              </div>
            ))}
          </div>
        <br/>

        <section className="sessao-projetos">
          <div className="div-projetos">
            <h1>
              Projetos e<br />Oficina
            </h1>
            <div className="projetos-navigation">
              <button className="projetos-arrow-custom prev" onClick={() => sliderRef.current?.slickPrev()}>
                <IoArrowBackCircleOutline size={50} />
              </button>
              <button className="projetos-arrow-custom next" onClick={() => sliderRef.current?.slickNext()}>
                <IoArrowForwardCircleOutline size={50} />
              </button>
            </div>
            <Link to="/projetos&oficinas" className="link-proj">Ver todos</Link>
          </div>
          <div className="projetos-carrossel-wrapper">
            <ProjetosCarrossel sliderRef={sliderRef} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ProjetosCarrossel({ sliderRef }) {
  const projetos = [
    {
      id: 1,
      titulo: "Projeto Musical",
      imagem: "/src/assets/site/18-11-2019_09-50-27.jpg",
      link: "/projetos&oficinas",
    },
    {
      id: 2,
      titulo: "Oficina de Esportes",
      imagem: "/src/assets/site/18-11-2019_09-50-38.jpg",
      link: "/projetos&oficinas",
    },
    {
      id: 3,
      titulo: "Atividades Culturais",
      imagem: "/src/assets/site/11o-FEMUS-Dom-Bosco_07-e-08.06-10.webp",
      link: "/projetos&oficinas",
    },
    {
      id: 4,
      titulo: "Desenvolvimento Jovem",
      imagem: "/src/assets/site/1o-Torneio-de-Penaltis-Butiero_21.04-7-scaled.webp",
      link: "/projetos&oficinas",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider ref={sliderRef} {...settings} className="projetos-slider">
      {projetos.map(proj => (
        <div key={proj.id} className="projeto-item">
          <div className="projeto-imagem-wrapper">
            <img src={proj.imagem} alt={proj.titulo} className="projeto-imagem" />
          </div>
          <h4 className="projeto-titulo">{proj.titulo}</h4>
          <Link to={proj.link} className="projeto-botao">Ver mais</Link>
        </div>
      ))}
    </Slider>
  );
}

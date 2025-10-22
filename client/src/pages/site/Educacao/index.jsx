import { useRef, useEffect, useState } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline, IoArrowForwardCircleOutline } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './style.css';
import { FaLongArrowAltRight } from "react-icons/fa";
import axios from "axios";

export default function Educacao() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const sliderRef = useRef(null);

  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/api/cursos`)
      .then((res) => setCursos(res.data))
      .catch((err) => console.error("Erro ao carregar cursos:", err));
  }, []);

  const getCursoGradient = (nome) => {
    if (!nome) return "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)";

    const n = nome.toLowerCase();
    if (n.includes("jovem aprendiz")) return "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)";
    if (n.includes("música")) return "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)";
    if (n.includes("informática")) return "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)";
    if (n.includes("esporte")) return "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)";
    if (n.includes("pré")) return "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)";

    return "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)";
  };



  return (
    <div className="page">
      <Header />
      <main>
        <h1>Cursos</h1>

        <div className="menu-cursos">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className="card-curso"
              style={{ background: getCursoGradient(curso.nome) }}
            >
              <h4>{curso.nome}</h4>
              <p>{curso.descricao?.split(" ").slice(0, 15).join(" ")}...</p>
              <Link to={`/detalhes-curso/${curso.id}`}>Saiba mais!</Link>
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
            <Link
              to="/projetos&oficinas"
              className="link-proj"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Ver todos
            </Link>
          </div>

          <div className="projetos-carrossel-wrapper">
            <ProjetosCarrossel sliderRef={sliderRef} />
          </div>
        </section>

        <section className="proposta">
          <h2>Proposta pedagógica</h2>
          <p>
            O Instituto Dom Bosco acredita que <strong>todo jovem tem potencial</strong> e merece crescer em um ambiente cheio de oportunidades. Nossa missão é <strong>educar com amor</strong>, seguindo o jeito salesiano de Dom Bosco: <strong>razão, religião e carinho.</strong>
          </p>
          <p>Aqui, as crianças e adolescentes encontram:</p>
          <ul>
            <li>Apoio nos estudos e reforço escolar;</li>
            <li>Esporte, arte, música e cultura;</li>
            <li>Cursos e oficinas para o mundo do trabalho;</li>
            <li>Momentos de espiritualidade e convivência;</li>
            <li>Acolhimento e apoio para as famílias.</li>
          </ul>
          <p>
            Mais do que ensinar, queremos formar <strong>cidadãos conscientes, solidários e felizes.</strong> O Instituto é um espaço de <strong>aprendizado, amizade e esperança</strong>, onde cada jovem pode sonhar, acreditar em si e construir um futuro melhor.
          </p>
        </section>

        <section className="perguntas">
          <h2>Perguntas frequentes</h2>
          <ul>
            <li><FaLongArrowAltRight /> Como faço para me inscrever em um curso?</li>
            <li><FaLongArrowAltRight /> Existe idade mínima ou máxima para participar dos cursos?</li>
            <li><FaLongArrowAltRight /> Posso participar de mais de um curso ao mesmo tempo?</li>
            <li><FaLongArrowAltRight /> Qual a duração média dos cursos?</li>
            <li><FaLongArrowAltRight /> Quais documentos são necessários para matrícula?</li>
            <li><FaLongArrowAltRight /> Como sei se minha matrícula foi confirmada?</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ProjetosCarrossel({ sliderRef }) {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [projetos, setProjetos] = useState([]);
    const getCursoCor = (curso) => {
      switch (curso) {
        case "Música": return "#df7d80";
        case "Esportes": return "#f7971e";
        case "Informática": return "#43cea2";
        case "Pré-aprendizagem": return "#ff512f";
        case "Jovem Aprendiz": return "#6a11cb";
        default: return "#555";
      }
    };


  useEffect(() => {
    axios.get(`${API}/api/oficinas`).then((res) => {
      const dados = res.data;
      const cursos = ["Música", "Esportes", "Informática", "Pré-aprendizagem", "Jovem Aprendiz"];

      
      const representativos = cursos
        .map((curso) => dados.find((p) => p.curso === curso))
        .filter(Boolean);

      setProjetos(representativos);
    });
  }, []);

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
      {projetos.map((proj) => (
        <div key={proj.id} className="projeto-item">
          <p className="curso" style={{ color: getCursoCor(proj.curso) }} >{proj.curso}</p>
          <div className="projeto-imagem-wrapper">
            <img src={proj.imagemUrl} alt={proj.titulo} className="projeto-imagem" />
          </div>
          <h4 className="projeto-titulo">{proj.titulo}</h4>
          <Link
            to="/projetos&oficinas"
            state={{ categoria: proj.curso }}
            className="projeto-botao"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Ver mais
          </Link>
        </div>
      ))}
    </Slider>
  );
}

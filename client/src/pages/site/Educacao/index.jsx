import { useRef, useEffect, useState } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './style.css';
import { FaLongArrowAltRight } from "react-icons/fa";
import axios from "axios";
import Slider from "react-slick";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function Educacao() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const sliderRef = useRef(null);
  const [cursos, setCursos] = useState([]);
  const [aberta, setAberta] = useState(null);

  const PrevArrow = ({ onClick }) => (
    <button className="arrow-cursos prev" onClick={onClick}>
      <IoIosArrowBack />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button className="arrow-cursos next" onClick={onClick}>
      <IoIosArrowForward />
    </button>
  );

  const sliderSettings = {
    dots: false,
    arrows: true,
    infinite: cursos.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  useEffect(() => {
    axios
      .get(`${API}/api/cursos`)
      .then((res) => setCursos(res.data))
      .catch((err) => console.error("Erro ao carregar cursos:", err));
  }, []);

  const getCursoGradient = (nome) => {
    if (!nome) return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";

    const n = nome.toLowerCase();
    if (n.includes("jovem aprendiz")) return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";
    if (n.includes("música")) return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";
    if (n.includes("informática")) return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";
    if (n.includes("esporte")) return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";
    if (n.includes("pré")) return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";

    return "linear-gradient(135deg, #2D408E 0%, #46A1D1 100%)";
  };

  const perguntas = [
      {
        pergunta: "Como faço para me inscrever em um curso?",
        resposta:
          "As inscrições são realizadas diretamente pelo site, na página do curso desejado. Basta clicar em 'Inscreva-se' e preencher o formulário.",
      },
      {
        pergunta: "Existe idade mínima ou máxima para participar dos cursos?",
        resposta:
          "Sim. A idade varia conforme o curso. A maioria dos cursos é voltada para jovens entre 14 e 24 anos, mas alguns projetos aceitam outras faixas etárias.",
      },
      {
        pergunta: "Posso participar de mais de um curso ao mesmo tempo?",
        resposta:
          "Depende da disponibilidade de horários e da compatibilidade entre os cursos. Entre em contato com a coordenação para verificar as possibilidades.",
      },
      {
        pergunta: "Qual a duração média dos cursos?",
        resposta:
          "Os cursos têm duração variável, geralmente entre 3 e 12 meses, dependendo da carga horária e do conteúdo programático.",
      },
      {
        pergunta: "Quais documentos são necessários para matrícula?",
        resposta:
          "Documento de identidade, CPF, comprovante de residência e, no caso de menores de idade, documentos do responsável legal.",
      },
      {
        pergunta: "Como sei se minha matrícula foi confirmada?",
        resposta:
          "Você receberá um e-mail ou mensagem de confirmação após a análise da inscrição. Também é possível confirmar diretamente com o Instituto.",
      },
    ];

  return (
    <div className="page">
      <Header />
      <main>
        <h1>Cursos</h1>

        <div className="menu-cursos">
          <Slider {...sliderSettings} ref={sliderRef}>
            {cursos.map((curso) => (
              <div key={curso.id}>
                <div
                  className="card-curso"
                  style={{ background: getCursoGradient(curso.nome) }}
                >
                  <h4>{curso.nome}</h4>
                  <p>{curso.descricao?.split(" ").slice(0, 15).join(" ")}...</p>
                  <Link to={`/detalhes-curso/${curso.id}`}>Saiba mais!</Link>
                </div>
              </div>
            ))}
          </Slider>
        </div>



        <br/>

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
            {perguntas.map((item, i) => (
              <li
                key={i}
                onClick={() => setAberta(aberta === i ? null : i)}
                className={aberta === i ? "aberta" : ""}
              >
                <FaLongArrowAltRight /> {item.pergunta}
                {aberta === i && <p className="resposta">{item.resposta}</p>}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}


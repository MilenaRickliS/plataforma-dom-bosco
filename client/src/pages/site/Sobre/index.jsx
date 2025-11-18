import Header from "../../../components/site/Header";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../../../components/site/Footer";
import local from '../../../../public/assets/banco de imagens/DSC_9817.png';
import './style.css';
import jovens from "../../../assets/site/grupojovens.png";
import equipefoto from "../../../assets/site/Desperta-ai_10.08-7-768x512.webp";
import instituto from "../../../assets/site/local2 (2).png";
import { IoIosStarOutline } from "react-icons/io";
import { IoPin,  IoRocket } from "react-icons/io5";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LiaLightbulbSolid } from "react-icons/lia";
import { TbCrossFilled } from "react-icons/tb";
import { PiHeartDuotone } from "react-icons/pi";


export default function Sobre() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [equipe, setEquipe] = useState([]);
  
  const NextArrow = ({ onClick }) => (
    <div className="arrow-equipe arrow-equipe-right" onClick={onClick}>
      <FaArrowRight />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div className="arrow-equipe arrow-equipe-left" onClick={onClick}>
      <FaArrowLeft />
    </div>
  );
  useEffect(() => {
    axios.get(`${API}/api/equipe`).then(res => setEquipe(res.data));
  }, []);

  return (
    <div className="page">
        <Header />
        <main className="sobre-main">
          <section className="inicio-sobre">
            <img src={jovens} alt="jovens"/>
            <div className="fazer-parte">
              <h2>Instituto Assistencial Dom Bosco: o lugar certo para quem quer crescer!</h2>
              <Link to="https://linktr.ee/iadbguarapuava?fbclid=PAZXh0bgNhZW0CMTEAAadQF_7QCdI4kK_rNe_PrE1gHAkCWdUl1NhFXvClUsq8Te0YWR3-F8sQi13bJA_aem_ly9CNBKwfBqnXQ9xKXA1cA">Quero fazer parte!</Link>
            </div>
          </section>

          <section className="historia-section">
            <div className="historia">
              <div className="imagens-historia">
                <div className="img-principal">
                  <img src={equipefoto} alt="equipe" className="principal"/>
                  <img src={instituto} alt="local" className="img-secundaria" />
                </div>
              </div>
              <div className="texto-historia">
                <h2>Nossa História</h2>
                <p><IoIosStarOutline />Nossa história começou em 1977, com o Oratório Domingos Sávio, criado pelo Pe. Honorino Muraro. Nos fins de semana, o Irmão Vicente reunia a galera para esportes e lazer — que eram raridade na época!</p>
                <p>Com o tempo, o espaço cresceu e, com a chegada do Irmão Aroldo Martins, ganhou ainda mais vida: marcenaria, artesanato, datilografia, violão e muito mais passaram a fazer parte do dia a dia.</p>
                <p>Em 1989, nasceu oficialmente o Instituto Educacional Dom Bosco, dando força à juventude, participando até da criação do ECA (Estatuto da Criança e do Adolescente) e ajudando a implantar políticas socioeducativas.</p>
                <p><IoPin />Hoje, em Guarapuava  PR, somos o Instituto Assistencial Dom Bosco, sob direção do Pe. Enri Clemente Leigman. Continuamos firmes no propósito: atender adolescentes e jovens de forma personalizada, ajudando-os a se tornarem protagonistas da própria história, preparados para o trabalho e para a vida.<IoRocket /></p>
              </div>              
            </div>
            
            <div className="mvv-container">
              <div className="mvv-item missao">
                <h3>Missão</h3>
                <p>
                  Acolher adolescentes e jovens do meio popular, despertando seu
                  protagonismo através do Sistema Preventivo de Dom Bosco.
                </p>
              </div>
              <div className="mvv-item visao">
                <h3>Visão</h3>
                <p>
                  Ser uma entidade de referência na transformação social, junto aos
                  adolescentes e jovens no crescimento humano e cristão.
                </p>
              </div>
              <div className="mvv-item valores">
                <h3>Valores</h3>
                <p>
                  Respeito, confiança e responsabilidade: pilares que formam nossa
                  caminhada junto aos jovens.
                </p>
              </div>
            </div>
          </section>

          <section className="filosofia">
            <h2>Filosofia Salesiana</h2>
            <div className="pilares">
              <div>
                <h3><LiaLightbulbSolid />Razão</h3>
                <p>Educar para a dimensão crítica: favorece o espírito crítico e a formação de convicções pessoais. Usa-se a persuasão em forma preventiva e motivadora.</p>
              </div>
              <div>
                <h3><TbCrossFilled />Religião</h3>
                <p>Que os jovens descubram o sentido da vida e a alegria de viver na graça de Deus. É ajudar os jovens a encontrarem na fé respostas a seus urgentes problemas.</p>
              </div>
              <div>
                <h3><PiHeartDuotone />Amorevolleza</h3>
                <p>É o sincero afeto para com o jovem; isso gera confiança em si mesmo, ajudando-o a crescer no amadurecimento afetivo. “Que os jovens não somente sejam amados, mas sintam que são amados”.</p>
              </div>
            </div>
          </section>


          <section className="equipe-section">
            <h2>Nossa equipe</h2>

            <Slider
              {...{
                dots: false,
                infinite: true,
                speed: 700,
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                nextArrow: <NextArrow />,
                prevArrow: <PrevArrow />,
                responsive: [
                  {
                    breakpoint: 1024,
                    settings: { slidesToShow: 3 },
                  },
                  {
                    breakpoint: 768,
                    settings: { slidesToShow: 2 },
                  },
                  {
                    breakpoint: 480,
                    settings: { slidesToShow: 1 },
                  },
                ],
              }}
            >
              {equipe.map(pessoa => (
                <div className="card-equipe" key={pessoa.id}>
                  <img src={pessoa.foto} alt={pessoa.nome} />
                  <p className="nome">{pessoa.nome}</p>
                  <p className="cargo">{pessoa.cargo}</p>
                </div>
              ))}

            </Slider>
          </section>
          {/* a imagem esta com baixa qualidade, achar uma melhor depois. */}
          <div className="ver-galeria">
            <img src={local} alt="foto estrutura"/> 
            <div>
                <p>Somos uma obra social salesiana, com a missão de despertar o protagonismo dos adolescentes e jovens do meio popular, através de: atividades artísticas, culturais, formação pessoal, tecnológicas e o Programa Jovem Aprendiz. A nossa Equipe se mantém em constante capacitação, tendo como foco principal cada um dos adolescentes e jovens que participam de nossos projetos, para que eles recebam um trabalho personalizado, dentro da proposta do sistema preventivo de Dom Bosco. </p>
                <Link to="/galeria" className="link-galeria"   onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Ver galeria <FaArrowRight /></Link>  
            </div>  
          </div>  
        </main>
        <Footer />
    </div>
  );
}

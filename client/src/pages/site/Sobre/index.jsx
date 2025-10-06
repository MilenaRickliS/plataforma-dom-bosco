import Header from "../../../components/site/Header";
import { Link } from "react-router-dom";
import Footer from "../../../components/site/Footer";
import local from '../../../assets/site/salao.png';
import './style.css';
import jovens from "../../../assets/site/grupojovens.png";
import equipe from "../../../assets/site/Desperta-ai_10.08-7-768x512.webp";
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
import adriano from "../../../assets/equipe/Adriano-Fragozo-768x512.jpg";
import crislaine from "../../../assets/equipe/Crislaine-Losso-Gechele-768x512.jpeg";
import diego from "../../../assets/equipe/Diego-da-Silva-768x512.jpg";
import dioni from "../../../assets/equipe/Dioni-Furquim-Falcao-768x512.jpeg";
import edilson from "../../../assets/equipe/Edilson-Carlos-de-Lima-768x1024.jpeg";
import eduardo from "../../../assets/equipe/Eduardo-Elias-768x512.jpg";
import enri from "../../../assets/equipe/Enri-Clemente-Leigman-1152x1536.jpeg";
import ester from "../../../assets/equipe/Ester-da-Silva-768x512.jpg";
import gabriel from "../../../assets/equipe/Gabriel-Santos-de-Paula-768x512.jpg";
import jislaine from "../../../assets/equipe/Jislaine-Pires-768x512.jpeg";
import joelma from "../../../assets/equipe/Joelma-Silverio-de-Moraes-768x512.jpg";
import livia from "../../../assets/equipe/Livia-Menon-Follador-2-768x512.jpg";
import lorayne from "../../../assets/equipe/Lorayne-Cordeiro-de-Lima-768x512.jpeg";
import maria from "../../../assets/equipe/Maria-Antonia-Alves-Rosa-768x512.jpeg";
import mariana from "../../../assets/equipe/Maria-Antonia-Alves-Rosa-768x512.jpeg";
import michely from "../../../assets/equipe/Michely-Nunes-dos-Santos-1024x682.jpeg";
import nilton from "../../../assets/equipe/Nilton-Kaio-Bobloski-Xistiuk-768x512.jpeg";
import silvete from "../../../assets/equipe/Silvete-Kovalski-768x512.jpg";
import susana from "../../../assets/equipe/Susana-Aparecida-768x512.jpg";
import viviane from "../../../assets/equipe/Viviane-Aparecida-768x512.jpeg";


export default function Sobre() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,      
    autoplaySpeed: 4000, 
    arrows: false,
  };
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
                  <img src={equipe} alt="equipe" className="principal"/>
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
            <div className="carrossel-mvv">
              <Slider {...settings}> 
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
              </Slider>
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
              {[
                { img: enri, nome: "P. Enri Clemente Leigman", cargo: "Diretoria" },
                { img: michely, nome: "Michely Nunes dos Santos", cargo: "Coord. Administrativa" },
                { img: lorayne, nome: "Lorayne Cordeiro de Lima", cargo: "Coord. Educativa Pastoral" },
                { img: maria, nome: "Maria Antonia Alves Rosa", cargo: "Coord. Jovem Aprendiz" },
                { img: viviane, nome: "Viviane Aparecida", cargo: "Serviços Gerais" },
                { img: gabriel, nome: "Gabriel Santos de Paula", cargo: "Diretor Executivo" },
                { img: jislaine, nome: "Jislaine Pires", cargo: "Orientadora Pedagógica" },
                { img: mariana, nome: "Marina de Campos", cargo: "Educadora Social" },
                { img: susana, nome: "Susana Aparecida", cargo: "Cozinheira" },
                { img: nilton, nome: "Nilton Kaio Bobloski Xistiuk", cargo: "Educador Social" },
                { img: livia, nome: "Lívia Menon Follador", cargo: "Comunicadora" },
                { img: joelma, nome: "Joelma Silvério de Moraes", cargo: "Educadora de Pátio" },
                { img: adriano, nome: "Adriano Fragozo", cargo: "Porteiro" },
                { img: silvete, nome: "Silvete Kovalski", cargo: "Assistente Social" },
                { img: crislaine, nome: "Crislaine Losso Gechele", cargo: "Educadora Social" },
                { img: diego, nome: "P. Diego Silva", cargo: "Assessor de Pastoral" },
                { img: eduardo, nome: "Eduardo Elias do Nascimento", cargo: "Aux. Administrativo" },
                { img: ester, nome: "Ester da Silva", cargo: "Cozinheira" },
                { img: edilson, nome: "Edilson Carlos de Lima", cargo: "Educador Social" },
                { img: dioni, nome: "Dioni Furquim Falcão", cargo: "Serviços Gerais" },
              ].map((pessoa, i) => (
                <div className="card-equipe" key={i}>
                  <img src={pessoa.img} alt={pessoa.nome} />
                  <p className="nome">{pessoa.nome}</p>
                  <p className="cargo">{pessoa.cargo}</p>
                </div>
              ))}
            </Slider>
          </section>

          <div className="ver-galeria">
            <img src={local} alt="foto estrutura"/>
            <div>
                <p>Somos uma obra social salesiana, com a missão de despertar o protagonismo dos adolescentes e jovens do meio popular, através de: atividades artísticas, culturais, formação pessoal, tecnológicas e o Programa Jovem Aprendiz. A nossa Equipe se mantém em constante capacitação, tendo como foco principal cada um dos adolescentes e jovens que participam de nossos projetos, para que eles recebam um trabalho personalizado, dentro da proposta do sistema preventivo de Dom Bosco. </p>
                <Link to="/galeria" className="link-galeria">Ver galeria <FaArrowRight /></Link>  
            </div>  
          </div>  
        </main>
        <Footer />
    </div>
  );
}

import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline, IoArrowForwardCircleOutline } from "react-icons/io5";
import equipe from "../../../assets/site/equipe.jpg";



// adicionar fonte de acordo com o projeto - bruno

export default function Inicio() {
  return (
    <div className="page">
      <Header />
      <main className="inicio-main">
        <section className="inicio-hero">
          <div className="inicio-image-wrapper">
            <img
              className="inicio-image"
              src="/src/assets/site/transferir__1_-removebg-preview.png"
              alt="Jovem participando"
            />
          </div>

          <h1 className="inicio-title">
            <span className="line">Aqui o Jovem <span className="sonha">sonha</span>,</span>
            <span className="line">
              <span className="aprende">aprende</span>
              <span> e </span>
              <span className="conquista">conquista</span>!
            </span>
            <span className="line cta">Bora fazer parte?</span>
          </h1>
        </section>
        <br/>
        <section className="sessao-sobre">
          <div className="div-sobre">
            <h3>Um pouco sobre nós</h3>
            <div className="sobre1">
              <div>
                <span>missão</span>
                <p>Acolher adolescentes e jovens do meio popular, despertando seu protagonismo através do Sistema Preventivo de Dom Bosco.</p>
              </div>
              <div>
                <span>visão</span>
                <p>Ser uma entidade de referência na transformação social, junto aos adolescentes e jovens no crescimento humano e cristão.</p>
              </div>
              <div>
                <span>valores</span>
                <p>Respeito, confiança e responsabilidade: pilares que formam nossa caminhada junto aos jovens.</p>
              </div>
            </div>
            <br/>
            <Link to="/sobre" className="link-sobre">Conheça mais sobre nós! Clique aqui!</Link>
          </div>
        </section>

        <section className="sessao-eventos">
          <div className="div-eventos">
            <h3>Eventos &<br/>Nóticias</h3>
            <div className="botoes">
              <IoArrowBackCircleOutline />
              <IoArrowForwardCircleOutline />
            </div>
            <Link to="https://dombosco.net/category/obras-sociais-guarapuava-blog/">Ir para o blog</Link>
          </div>
          <br/><br/>
          <div className="eventos">
            <div className="post-evento">
              Tituloo
            </div>
            <div className="post-evento">
              Tituloo
            </div>
          </div>        
        </section>

        <section className="sessao-site">
          <div className="convite">
            <p>Descubra uma comunidade que vive para os jovens: conheça a <span>Inspetoria Salesiana</span> e inspire-se com nosso carisma e missão.</p>
            <Link to="https://dombosco.net/">Convite ao site: Salensianos do Sul</Link>
          </div>
          <img src={equipe} alt="equipe salensianos"/>
        </section>

        {/*
        <section className="sessao-site">
          <div className="convite">
            <p>Descubra uma comunidade que vive para os jovens: conheça a <span>Inspetoria Salesiana</span> e inspire-se com nosso carisma e missão.</p>
            <Link to="#">Convite ao site: Salensianos do Sul</Link>
          </div>
          <img src={equipe} alt="equipe salensianos"/>
        </section>

        <section>
          <h3>Depoimentos</h3>
          <div>
            <IoArrowBackCircleOutline />
            <div>
              <p>"Entrei no IADB neste ano de 2022 e desde o início me senti muiito bem acolhido por todos, conheci novas pessoas e tive diferentes experiências nesse tempo. No curso de comunicação eu aprendi novas linguagens e me tornei uma pessoa mais aberta e comunicativa, sabendo como agir ....”</p>
              <Link to="">Leia mais!</Link>
              <span>Juan Pablo Padilha - Aluno</span>
            </div>
             <IoArrowForwardCircleOutline />
          </div>
          <button>Deixe um depoimento!</button>
        </section> */}

      </main>
      <Footer />
    </div>
  );
}

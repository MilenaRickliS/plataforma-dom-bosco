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
  return (
    <div className="page">
        <Header />
        <main>
          <section>
            <img src={jovens} alt="jovens"/>
            <div>
              <h2>Instituto Assistencial Dom Bosco:<br/>o lugar certo para quem quer crescer!</h2>
              <Link to="https://linktr.ee/iadbguarapuava?fbclid=PAZXh0bgNhZW0CMTEAAadQF_7QCdI4kK_rNe_PrE1gHAkCWdUl1NhFXvClUsq8Te0YWR3-F8sQi13bJA_aem_ly9CNBKwfBqnXQ9xKXA1cA">Quero fazer parte!</Link>
            </div>
          </section>

          {/* <section>
            <div>
              <div>
                <img src={equipe} alt="equipe"/>
                <img src={instituto} alt="local" />
              </div>
              <div>
                <h2>Nossa História</h2>
                <p><IoIosStarOutline />Nossa história começou em 1977, com o Oratório Domingos Sávio, criado pelo Pe. Honorino Muraro. Nos fins de semana, o Irmão Vicente reunia a galera para esportes e lazer — que eram raridade na época!</p>
                <p>Com o tempo, o espaço cresceu e, com a chegada do Irmão Aroldo Martins, ganhou ainda mais vida: marcenaria, artesanato, datilografia, violão e muito mais passaram a fazer parte do dia a dia.</p>
                <p>Em 1989, nasceu oficialmente o Instituto Educacional Dom Bosco, dando força à juventude, participando até da criação do ECA (Estatuto da Criança e do Adolescente) e ajudando a implantar políticas socioeducativas.</p>
                <p><IoPin />Hoje, em Guarapuava  PR, somos o Instituto Assistencial Dom Bosco, sob direção do Pe. Enri Clemente Leigman. Continuamos firmes no propósito: atender adolescentes e jovens de forma personalizada, ajudando-os a se tornarem protagonistas da própria história, preparados para o trabalho e para a vida.<IoRocket /></p>
              </div>              
            </div>
            <div>
              <div>
                <h3>Missão</h3>
                <p>Acolher adolescentes e jovens do meio popular, despertando seu protagonismo através do Sistema Preventivo de Dom Bosco.</p>
              </div>
              <div>
                <h3>Visão</h3>
                <p>Ser uma entidade de referência na transformação social, junto aos adolescentes e jovens no crescimento humano e cristão.</p>
              </div>
              <div>
                <h3>Valores</h3>
                <p>Respeito, confiança e responsabilidade: pilares que formam nossa caminhada junto aos jovens.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Filosofia Salesiana</h2>
            <div>
              <div>
                <h3>Razão</h3>
                <p>Educar para a dimensão crítica: favorece o espírito crítico e a formação de convicções pessoais. Usa-se a persuasão em forma preventiva e motivadora.</p>
              </div>
              <div>
                <h3>Religião</h3>
                <p>Que os jovens descubram o sentido da vida e a alegria de viver na graça de Deus. É ajudar os jovens a encontrarem na fé respostas a seus urgentes problemas.</p>
              </div>
              <div>
                <h3>Amorevolleza</h3>
                <p>É o sincero afeto para com o jovem; isso gera confiança em si mesmo, ajudando-o a crescer no amadurecimento afetivo. “Que os jovens não somente sejam amados, mas sintam que são amados”.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Nossa equipe</h2>
            <FaArrowLeft />
            <div>
              <div>
                <img src={enri} alt="Enri"/>
                <p>P. Enri Clemente Leigman</p>
                <p>Diretoria</p>
              </div>
              <div>
                <img src={michely} alt="Michely"/>
                <p>Michely Nunes dos Santos</p>
                <p>Coordenadora Administrativa</p>
              </div>
              <div>
                <img src={lorayne} alt="Lorayne"/>
                <p>Lorayne Cordeiro de Lima</p>
                <p>Coordenadora Educativa Pastoral</p>
              </div>
              <div>
                <img src={maria} alt="Maria"/>
                <p>Maria Antonia Alves Rosa</p>
                <p>Coordenadora do Jovem Aprendiz</p>
              </div>
              <div>
                <img src={viviane} alt="Viviane"/>
                <p>Viviane Aparecida</p>
                <p>Serviços Gerais</p>
              </div>
              <div>
                <img src={gabriel} alt="Gabriel"/>
                <p>Gabriel Santos de Paula</p>
                <p>Diretor Executivo</p>
              </div>
              <div>
                <img src={jislaine} alt="Jislaine"/>
                <p>Jislaine Pires</p>
                <p>Orientadora Pedagógica</p>
              </div>
              <div>
                <img src={mariana} alt="Mariana"/>
                <p>Marina de Campos</p>
                <p>Educadora Social</p>
              </div>
              <div>
                <img src={susana} alt="Susana"/>
                <p>Susana Aparecida</p>
                <p>Cozinheira</p>
              </div>
              <div>
                <img src={nilton} alt="Nilton"/>
                <p>Nilton Kaio Bobloski Xistiuk</p>
                <p>Educador Social</p>
              </div>
              <div>
                <img src={livia} alt="Livia"/>
                <p>Lívia Menon Follador</p>
                <p>Comunicadora</p>
              </div>
              <div>
                <img src={joelma} alt="Joelma"/>
                <p>Joelma Silvério de Moraes</p>
                <p>Educador de Patio</p>
              </div>
              <div>
                <img src={adriano} alt="Adriano"/>
                <p>Adriano Fragozo</p>
                <p>Porteiro</p>
              </div>
              <div>
                <img src={silvete} alt="Silvete"/>
                <p>Silvete Kovalski</p>
                <p>Assistente Social</p>
              </div>
              <div>
                <img src={crislaine} alt="Crislaine"/>
                <p>Crislaine Losso Gechele</p>
                <p>Educador Social</p>
              </div>
              <div>
                <img src={diego} alt="Diego"/>
                <p>P. Diego Silva</p>
                <p>Assessor de Pastoral</p>
              </div>
              <div>
                <img src={eduardo} alt="Eduardo"/>
                <p>Eduardo Elias do Nascimento</p>
                <p>Auxiliar Administrativo</p>
              </div>
              <div>
                <img src={ester} alt="Ester"/>
                <p>Ester da Silva</p>
                <p>Cozinheira</p>
              </div>
              <div>
                <img src={edilson} alt="Edilson"/>
                <p>Edilson Carlos de Lima</p>
                <p>Educador Social</p>
              </div>
              <div>
                <img src={dioni} alt="Dioni"/>
                <p>Dioni Furquim Falcão</p>
                <p>Serviços Gerais</p>
              </div>
            </div>
            <FaArrowRight />
          </section> */}

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

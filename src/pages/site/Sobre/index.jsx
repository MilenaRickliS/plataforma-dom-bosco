import Header from "../../../components/site/Header";
import { Link } from "react-router-dom";
import Footer from "../../../components/site/Footer";
import local from '../../../assets/site/salao.png'

export default function Sobre() {
  return (
    <div className="page">
        <Header />
        <main>
          <div className="ver-galeria">
            <img src={local} alt="foto estrutura"/>
            <div>
                <p>Somos uma obra social salesiana, com a missão de despertar o protagonismo dos adolescentes e jovens do meio popular, através de: atividades artísticas, culturais, formação pessoal, tecnológicas e o Programa Jovem Aprendiz. A nossa Equipe se mantém em constante capacitação, tendo como foco principal cada um dos adolescentes e jovens que participam de nossos projetos, para que eles recebam um trabalho personalizado, dentro da proposta do sistema preventivo de Dom Bosco. </p>
                <Link to="/galeria">Ver galeria</Link>  
            </div>  
          </div>  
        </main>
        <Footer />
    </div>
  );
}

import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import './style.css';
import { FaArrowRightLong } from "react-icons/fa6";

export default function Eventos() {
  return (
    <div className="eventos-page">
        <main>
          <div className="container-eventos">
            <Header />
            <div className="inicio-eventos">              
              <div className="titulo-prox">
                <h1>Próximos<br/>Eventos</h1>
                <Link to="/proximos-eventos">Clique aqui para<br/>visualizar os eventos<br/>mais próximos <FaArrowRightLong /></Link>
              </div>
              <div className="prox-eventos">
                <div className="exemplo-evento">
                  <p>Evento 1</p>
                  <Link to="/detalhes-evento">Saiba mais!</Link>
                </div>
                <div className="exemplo-evento">
                  <p>Evento 2</p>
                  <Link to="/detalhes-evento">Saiba mais!</Link>
                </div>
                <div className="exemplo-evento">
                  <p>Evento 3</p>
                  <Link to="/detalhes-evento">Saiba mais!</Link>
                </div>
              </div>
            </div>
          </div>
                
        </main>
        <Footer />
    </div>
  );
}

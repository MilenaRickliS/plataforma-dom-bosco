import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function EventosGestao() {

  return (
    <div>
        <br/>
        <Link to="/menu-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
        <div className="container-gestao">
            <h1 className="h1-eventos">Todos os Eventos & Nóticias</h1>
            <Link to="/criar-evento-gestao" className="adicionar">+ adicionar evento</Link>
        </div>
    </div>
  );
}
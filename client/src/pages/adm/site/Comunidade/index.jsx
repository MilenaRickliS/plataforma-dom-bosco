import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function ComunidadeGestao() {

  return (
    <div>
        <br/>
        <Link to="/menu-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
        <div className="container-gestao">
            <h1 className="h1-comunidade">Projetos sociais e voluntariado</h1>
            <Link to="/criar-projeto-gestao" className="adicionar">+ adicionar projeto</Link>
        </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function CursosDetalhesGestao() {

  return (
    <div >
        <br/>
        <Link to="/cursos-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
    </div>
  );
}
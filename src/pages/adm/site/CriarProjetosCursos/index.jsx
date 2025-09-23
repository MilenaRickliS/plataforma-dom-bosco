import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function CriarProjetosCursos() {

  return (
    <div >
        <br/>
        <Link to="/projetos-de-cursos-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
    </div>
  );
}
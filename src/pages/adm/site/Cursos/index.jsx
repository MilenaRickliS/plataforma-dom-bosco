import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function CursosGestao() {

  return (
    <div>
        <br/>
        <Link to="/menu-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
        <div className="container-gestao">
            <h1>Cursos</h1>
            <p>Selecione o curso a editar</p>
            <Link to="/detalhes-curso-gestao" className="editar-curso">Jovem Aprendiz</Link>
        </div>
    </div>
  );
}
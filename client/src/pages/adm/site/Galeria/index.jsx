import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function GaleriaGestao() {

  return (
    <div className="galeria-page">
        <br/>
        <Link to="/menu-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
        <div className="container-gestao">
            <h1 className="h1-galeria">Galeria</h1>
            <Link to="#" className="adicionar">+ adicionar foto</Link>
        </div>
    </div>
  );
}
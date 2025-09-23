import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function CriarEvento() {

  return (
    <div >
        <br/>
        <Link to="/eventos-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
    </div>
  );
}
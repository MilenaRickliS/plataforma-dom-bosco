import { Link } from "react-router-dom";
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function CriarProjetos() {

  return (
    <div >
        <br/>
        <Link to="/comunidade-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
    </div>
  );
}
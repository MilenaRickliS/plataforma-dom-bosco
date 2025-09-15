import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import './style.css';
import logo from '../../../assets/logo2.png';
import { PiStarFourBold } from "react-icons/pi";
import { MdOutlineArrowCircleRight } from "react-icons/md";

export default function Header() {
  const { signed } = useContext(AuthContext);

  return (
    <nav>
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Logo"/>
        </Link>
      </div>

      <div className="menu">
        <Link className="link" to="/"><PiStarFourBold/> HOME</Link>
        <Link className="link" to="/sobre"><PiStarFourBold/> SOBRE NÓS</Link>
        <Link className="link" to="/educacao"><PiStarFourBold/> EDUCAÇÃO</Link>
        <Link className="link" to="/comunidade"><PiStarFourBold/> COMUNIDADE</Link>
        <Link className="link" to="/eventos"><PiStarFourBold/> NÓTICIAS &<br />EVENTOS</Link>
        <Link className="link" to="/contato"><PiStarFourBold/> CONTATO</Link>
      </div>

      <div>
        {!signed ? (   
          <Link className="login" to="/login">LOGIN <MdOutlineArrowCircleRight /></Link>
        ) : (
          <span>Bem-vindo!</span>
        )}
      </div>
    </nav>
  );
}


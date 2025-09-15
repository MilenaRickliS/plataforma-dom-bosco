import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import { PiStarFourBold, PiStarFourFill } from "react-icons/pi";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import logo from '../../../assets/logo2.png';
import './style.css';

export default function Header() {
  const { signed } = useContext(AuthContext);
  const location = useLocation();

  const links = [
    { path: "/", label: "HOME" },
    { path: "/sobre", label: "SOBRE NÓS" },
    { path: "/educacao", label: "EDUCAÇÃO" },
    { path: "/comunidade", label: "COMUNIDADE" },
    { path: "/eventos", label: <>NÓTICIAS &<br />EVENTOS</> },
    { path: "/contato", label: "CONTATO" },
  ];

  return (
    <nav>
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>

      <div className="menu">
        {links.map((link) => (
          <Link
            key={link.path}
            className={`link ${location.pathname === link.path ? "active" : ""}`}
            to={link.path}
          >
            {location.pathname === link.path ? <PiStarFourFill /> : <PiStarFourBold />}
            {link.label}
          </Link>
        ))}
      </div>

      <div>
        {!signed ? (
          <Link className="login" to="/login">
            LOGIN <MdOutlineArrowCircleRight />
          </Link>
        ) : (
          <span>Bem-vindo!</span>
        )}
      </div>
    </nav>
  );
}

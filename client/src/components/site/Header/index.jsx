import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import { PiStarFourBold, PiStarFourFill } from "react-icons/pi";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import logo from '../../../assets/logo2.png';
import './style.css';

export default function Header() {
  const { signed } = useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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

       <div className={`menu ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.path}
            className={`link ${location.pathname === link.path ? "active" : ""}`}
            to={link.path}
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {location.pathname === link.path ? <PiStarFourFill /> : <PiStarFourBold />}
            {link.label}
          </Link>
        ))}

        {!signed ? (
          <Link className="login" to="/login" onClick={() => {
            setMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}>
            LOGIN <MdOutlineArrowCircleRight />
          </Link>
        ) : (
          <span>Bem-vindo!</span>
        )}        
      </div>
      {menuOpen ? (
          <button className="close-menu" onClick={() => setMenuOpen(false)}>
            <FiX size={40} />
          </button>
        ) : (
          
          <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
            <FiMenu size={40} />
          </button>
        )}
    </nav>
  );
}

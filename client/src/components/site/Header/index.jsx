import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import { PiStarFourBold, PiStarFourFill } from "react-icons/pi";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import logo from '../../../assets/logo2.png';
import './style.css';

export default function Header() {
  const { signed, getRota } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { path: "/", label: "HOME" },
    { path: "/sobre", label: "SOBRE NÓS" },
    { path: "/educacao", label: "EDUCAÇÃO" },
    { path: "/comunidade", label: "COMUNIDADE" },
    { path: "/eventos", label: <>NÓTICIAS &<br />EVENTOS</> },
    { path: "/contato", label: "CONTATO" },
  ];

  function handleVoltarPortal() {
    const rota = getRota();
    if (rota === "aluno") navigate("/aluno/inicio");
    else if (rota === "professor") navigate("/professor/inicio");
    else if (rota === "admin") navigate("/inicio-adm");
    else navigate("/"); 
  }

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
          <Link
            className="login"
            to="/login"
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            LOGIN <MdOutlineArrowCircleRight />
          </Link>
        ) : (
          <button
            className="login voltar-portal-btn"
            onClick={handleVoltarPortal}
          >
            Voltar ao Portal
          </button>
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

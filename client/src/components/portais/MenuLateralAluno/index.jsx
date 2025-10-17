import { useState, useContext } from 'react';
import { Link, useLocation} from "react-router-dom";
import './style.css';
import { FaRegCalendar } from "react-icons/fa";
import { IoPlayForward } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { CgNotes } from "react-icons/cg";
import { FaBoxArchive } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { AuthContext } from "../../../contexts/auth";
import logo from "../../../assets/logo.png";

function MenuLateralAluno() {
  const [isOpen, setIsOpen] = useState(false); 
  const { logout } = useContext(AuthContext); 
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const menuItems = [
    { to: "/agenda-aluno", icon: <FaRegCalendar />, label: "Agenda" },
    { to: "/aluno/videos", icon: <IoPlayForward />, label: "Vídeos Professores" },
    { to: "/inicio-aluno", icon: <LuLayoutDashboard />, label: "Turmas" },
    { to: "/notas-aluno", icon: <CgNotes />, label: "Notas" },
    { to: "/documentos-aluno", icon: <FaBoxArchive />, label: "Documentos" },
  ];

  return (
    <>
      <div>
        <nav id="sidebar" className={isOpen ? 'open-sidebar' : ''}>
          <div id="sidebar_content">
            <div id="logo-menu">
              <img src={logo} alt="Avatar" />
            </div>

            <ul id="side_items">
                {menuItems.map(item => (
                    <li
                    key={item.to}
                    className={`side-item ${location.pathname === item.to ? "active" : ""}`}
                    >
                    <Link to={item.to}>
                        {item.icon}
                        <span className="item-description">{item.label}</span>
                    </Link>
                    </li>
                ))}
            </ul>

            <button id="open_btn" onClick={toggleSidebar}>
                {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
          </div> 

          <div id="logout">
            <button id="logout_btn" onClick={logout}>
              <IoIosLogOut />
              <span className="item-description">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

export default MenuLateralAluno;
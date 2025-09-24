import React, { useState, useContext } from 'react';
import './App.css';
import { FaRegCalendar } from "react-icons/fa";
import { IoPlayForward } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { CgNotes } from "react-icons/cg";
import { FaBoxArchive } from "react-icons/fa6";
import { MdOpenInFull } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { AuthContext } from "../../../contexts/auth";

function MenuLateralAluno() {
  const [isOpen, setIsOpen] = useState(true); 
  const { logout } = useContext(AuthContext); 

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <div>
        <nav id="sidebar" className={isOpen ? 'open-sidebar' : ''}>
          <div id="sidebar_content">
            <div id="logo-menu">
              <img src="src/assets/react.svg" alt="Avatar" />
            </div>

            <ul id="side_items">
              <li className="side-item active">
                <a href="/agenda-aluno">
                  <FaRegCalendar />
                  <span className="item-description">Agenda</span>
                </a>
              </li>

              <li className="side-item">
                <a href="/videos-professores">
                  <IoPlayForward />
                  <span className="item-description">Vídeos Professores</span>
                </a>
              </li>

              <li className="side-item">
                <a href="/inicio-aluno">
                  <LuLayoutDashboard />
                  <span className="item-description">Turmas</span>
                </a>
              </li>

              <li className="side-item">
                <a href="/notas-aluno">
                  <CgNotes />
                  <span className="item-description">Notas</span>
                </a>
              </li>

              <li className="side-item">
                <a href="/documentos-aluno">
                  <FaBoxArchive />
                  <span className="item-description">Documentos</span>
                </a>
              </li>
            </ul>

            <button id="open_btn" onClick={toggleSidebar}>
              <MdOpenInFull id="open_btn_icon" className={`fa-solid fa-chevron-${isOpen ? 'right' : 'left'}`}/>
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
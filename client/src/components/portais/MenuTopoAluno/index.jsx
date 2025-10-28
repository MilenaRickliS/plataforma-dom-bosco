import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import './style.css';
import { MdOutlineQuestionMark } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { IoPersonOutline } from "react-icons/io5";

function MenuTopoAluno() {
  const [qtdAvisos, setQtdAvisos] = useState(0);
  const location = useLocation();

  const atualizar = () => {
    const valor = localStorage.getItem("avisosNaoLidos");
    setQtdAvisos(Number(valor) || 0);
  };

  useEffect(() => {
    atualizar();
    window.addEventListener("storage", atualizar);
    return () => window.removeEventListener("storage", atualizar);
  }, []);

 
  useEffect(() => {
    atualizar();
  }, [location]);

  return (
    <div className="nav-menutopo">
      <ul>
        <li>
          <NavLink to="/aluno/ajuda">
            <MdOutlineQuestionMark />
          </NavLink>
        </li>

        <li className="icone-avisos">
          <NavLink to="/aluno/avisos">
            <FaRegBell />
            {qtdAvisos > 0 && (
              <span className="badge-notificacao">{qtdAvisos}</span>
            )}
          </NavLink>
        </li>

        <li>
          <NavLink to="/aluno/perfil">
            <IoPersonOutline />
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default MenuTopoAluno;

import { NavLink } from "react-router-dom";
import './style.css';
import { MdOutlineQuestionMark } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { IoPersonOutline } from "react-icons/io5";

function MenuTopoProfessor() {

  return (
    <>
      <div>
        <div className="nav-menutopo">
            <ul>
                <li>
                    <NavLink to="/professor/ajuda"><MdOutlineQuestionMark /></NavLink>
                </li> 
                <li>
                    <NavLink to="/professor/perfil"><IoPersonOutline /></NavLink>
                </li>         
            </ul>          
        </div>
      </div>
    </>
  );
}

export default MenuTopoProfessor;
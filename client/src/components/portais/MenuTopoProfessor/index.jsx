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
                    <NavLink to="/ajuda-professor"><MdOutlineQuestionMark /></NavLink>
                </li> 
                <li>
                    <NavLink to="/avisos-professor"><FaRegBell /></NavLink>
                </li>  
                <li>
                    <NavLink to="/perfil-professor"><IoPersonOutline /></NavLink>
                </li>         
            </ul>          
        </div>
      </div>
    </>
  );
}

export default MenuTopoProfessor;
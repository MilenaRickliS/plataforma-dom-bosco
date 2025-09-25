import { NavLink } from "react-router-dom";
import './style.css';
import { MdOutlineQuestionMark } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { IoPersonOutline } from "react-icons/io5";

function MenuTopoAluno() {

  return (
    <>
      <div>
        <div className="nav-menutopo">
            <ul>
                <li>
                    <NavLink to="/ajuda-aluno"><MdOutlineQuestionMark /></NavLink>
                </li> 
                <li>
                    <NavLink to="/avisos-aluno"><FaRegBell /></NavLink>
                </li>  
                <li>
                    <NavLink to="/perfil-aluno"><IoPersonOutline /></NavLink>
                </li>         
            </ul>          
        </div>
      </div>
    </>
  );
}

export default MenuTopoAluno;
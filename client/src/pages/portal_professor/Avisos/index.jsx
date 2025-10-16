import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import './style.css';

export default function Avisos() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
            <Link to="/add-avisos-professor" className="botao-postar-avisos"><FaPlus /> adicionar aviso</Link>
        </main>
      </div>
    </div>
  );
}

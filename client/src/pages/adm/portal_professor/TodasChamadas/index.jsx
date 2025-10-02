import MenuLateralProfessor from "../../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../../components/portais/MenuTopoProfessor";
import './style.css';
import { NavLink } from "react-router-dom";

export default function TodasChamadas() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main id="sala">
            <MenuTopoProfessor/>
          <div className="menu-turma">
            <NavLink to="/turma-professor">Painel</NavLink>
            <NavLink to="/atividades-professor">Todas as atividades</NavLink>
            <NavLink to="/alunos-professor">Alunos</NavLink>
          </div>
        </main>
      </div>
    </div>
  );
}

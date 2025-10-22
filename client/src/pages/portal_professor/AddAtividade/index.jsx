import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import './style.css';
import { NavLink } from "react-router-dom";

export default function AddAtividade() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main id="sala">
            <MenuTopoProfessor/>
            <div className="menu-turma">
              <NavLink to="/professor/turma">Painel</NavLink>
              <NavLink to="/professor/atividades">Todas as atividades</NavLink>
              <NavLink to="/professor/alunos-turma">Alunos</NavLink>
            </div>
        </main>
      </div>
    </div>
  );
}

import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import './style.css';
import { NavLink } from "react-router-dom";

export default function Alunos() {
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main id="sala">
            <MenuTopoAluno/>
          <div className="menu-turma">
            <NavLink to="/turma-aluno">Painel</NavLink>
            <NavLink to="/atividades-aluno">Todas as atividades</NavLink>
            <NavLink to="#">Alunos</NavLink>
          </div>
        </main>
      </div>
    </div>
  );
}

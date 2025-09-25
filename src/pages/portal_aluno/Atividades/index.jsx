import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import './style.css';
import { NavLink } from "react-router-dom";

export default function Atividades() {
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main id="sala">
            <MenuTopoAluno/>
          <div className="menu-turma">
            <NavLink to="/turma-aluno">Painel</NavLink>
            <NavLink to="#">Todas as atividades</NavLink>
            <NavLink to="/alunos">Alunos</NavLink>
          </div>
        </main>
      </div>
    </div>
  );
}

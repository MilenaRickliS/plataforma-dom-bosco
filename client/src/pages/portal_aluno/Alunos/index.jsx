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
            <NavLink to="/aluno/turma">Painel</NavLink>
            <NavLink to="/aluno/atividades">Todas as atividades</NavLink>
            <NavLink to="/aluno/alunos-turma">Alunos</NavLink>
          </div>
        </main>
      </div>
    </div>
  );
}

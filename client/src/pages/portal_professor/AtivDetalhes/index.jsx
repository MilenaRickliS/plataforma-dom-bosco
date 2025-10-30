import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import './style.css';
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";

export default function AtivDetalhes() {
   const { codigo } = useParams();
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main id="sala">
            <MenuTopoProfessor/>
          <div className="menu-turma">
            <NavLink to={codigo ? `/professor/turma/${codigo}` : "/professor/turma"}>
              Painel
            </NavLink>
            <NavLink
              to={codigo ? `/professor/atividades/${codigo}` : "/professor/atividades"}
            >
              Todas as atividades
            </NavLink>
            <NavLink
              to={codigo ? `/professor/alunos-turma/${codigo}` : "/professor/alunos-turma"}
              className="ativo"
            >
              Alunos
            </NavLink>
          </div>
        </main>
      </div>
    </div>
  );
}

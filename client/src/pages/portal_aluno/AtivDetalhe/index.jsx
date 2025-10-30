import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";

export default function AtivDetalhe() {
  const { codigo } = useParams();
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main id="sala">
            <MenuTopoAluno/>
          <div className="menu-turma">
            <NavLink to={codigo ? `/aluno/turma/${codigo}` : "/aluno/turma"}>Painel</NavLink>
            <NavLink to={codigo ? `/aluno/atividades/${codigo}` : "/aluno/atividades"}>Todas as atividades</NavLink>
            <NavLink to={codigo ? `/aluno/alunos-turma/${codigo}` : "/aluno/alunos-turma"}>Alunos</NavLink>
          </div>
        </main>
      </div>
    </div>
  );
}

import MenuLateralProfessor from "../../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../../components/portais/MenuTopoProfessor";
import './style.css';
import { Link, NavLink } from "react-router-dom";

export default function Alunos() {
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
          <div className="titulo-sala-alunos">
            <div>
                <h3>Informática</h3>
                <p>Turma A</p>
            </div>
            <div className="botoes-chamada">
                <Link to="/chamada-professor" className="botao-chamada">Realizar chamada</Link>
                <Link to="/todas-chamadas-professor" className="botao-visualizar-chamada">Ver todas as chamadas</Link>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

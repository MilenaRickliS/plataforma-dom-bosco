import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { VscKebabVertical } from "react-icons/vsc";
import { FaFolder } from "react-icons/fa";
import './style.css';
import { Link, NavLink } from "react-router-dom";

export default function Turma() {
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
          <div className="titulo-sala">
            <h3>Informática</h3>
            <p>Turma A</p>
          </div>
          <div className="ativ-sala">
            <div className="prox-ativ">
                <p>Próximas atividades</p>
                <ul>
                    <li>Data de entrega:15/09 - 00:00h - Atividade 1</li>
                </ul>
            </div>
            <Link to="/aluno/detalhes-ativ" className="atividade">
                <FaFolder className="folder"/>
                <div>
                   <h4>Título Atividade</h4>
                   <p>Prazo 00/00/00 - 00h</p> 
                </div>
                <VscKebabVertical />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

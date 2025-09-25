import MenuLateralProfessor from "../../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../../components/portais/MenuTopoProfessor";
import { VscKebabVertical } from "react-icons/vsc";
import { FaFolder } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import './style.css';
import { Link, NavLink } from "react-router-dom";

export default function Turma() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main id="sala">
            <MenuTopoProfessor/>
          <div className="menu-turma">
            <NavLink to="#">Painel</NavLink>
            <NavLink to="/atividades-professor">Todas as atividades</NavLink>
            <NavLink to="/alunos-professor">Alunos</NavLink>
          </div>
          <div className="titulo-sala-alunos">
            <div>
                <h3>Informática</h3>
                <p>Turma A</p>
            </div>
            <div className="botoes-chamada">
                <Link to="/add-atividade-professor" className="botao-postar-avisos"><FaPlus /> adicionar atividade</Link>
            </div>
            
          </div>
          <div className="ativ-sala">
            <div className="prox-ativ">
                <p>Próximas atividades</p>
                <ul>
                    <li>Data de entrega:15/09 - 00:00h - Atividade 1</li>
                </ul>
            </div>
                <Link to="/ativ-detalhes-professor" className="atividade">
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

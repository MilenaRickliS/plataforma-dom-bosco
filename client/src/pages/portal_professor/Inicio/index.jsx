import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import prof from "../../../assets/site/Enri-Clemente-Leigman-scaled-removebg-preview.png";
import { GoKebabHorizontal } from "react-icons/go";
import { MdOutlinePushPin } from "react-icons/md";
import { Link } from "react-router-dom";
import './style.css';

export default function Inicio() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
          <h1>Conteúdo do Professor</h1>
          <Link to="/turma-professor" className="container-turma">
            <div className="turma-inicio">
                <div className="img-turma">
                    <img src={prof} alt="professor"/>
                    <GoKebabHorizontal size={20} className="kebab-icon"/>
                </div>
                <p>Informática</p>
            </div>
            <div className="atividades-turma">
                <p><MdOutlinePushPin /> 5 atividades pendentes</p>
            </div>
          </Link>
        </main>
      </div>
    </div>
  );
}

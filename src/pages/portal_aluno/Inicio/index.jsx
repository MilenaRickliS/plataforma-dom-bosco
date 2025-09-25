import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import prof from "../../../assets/site/Enri-Clemente-Leigman-scaled-removebg-preview.png";
import { GoKebabHorizontal } from "react-icons/go";
import { MdOutlinePushPin } from "react-icons/md";
import { Link } from "react-router-dom";
import './style.css';

export default function Inicio() {
  return (
   <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        
        <main>
            <MenuTopoAluno/>
          <h1>Conteúdo do Aluno</h1>
          <Link to="/turma-aluno" className="container-turma">
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

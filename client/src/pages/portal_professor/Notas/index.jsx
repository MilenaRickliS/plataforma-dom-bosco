import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";
import { BiHappyHeartEyes } from "react-icons/bi";
import { TbMoodSadSquint } from "react-icons/tb";
import { FaRegFaceGrinBeamSweat } from "react-icons/fa6";

export default function Notas() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
          <div className="ranking">
            <div>perfil</div>
            <div>
              <p>Pontos acumulados</p>
              <p><BiHappyHeartEyes /> 1200 pontos</p>
            </div>
          </div>

          <div>
            <h2>Notas alunos</h2>
            <select>
              <option>Selecione o Ano</option>
            </select>
            <select>
              <option>Selecione uma Turma</option>
            </select>
            <table></table>

          </div>

          <div>
            <p>Medalhas</p>
            
          </div>
        </main>
      </div>
    </div>
  );
}

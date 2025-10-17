import { Link } from "react-router-dom";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import "./style.css";
import { TbPointFilled } from "react-icons/tb";

export default function Documentos() {
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main>
            <MenuTopoAluno/>
            <section className="sessao-documentos">
              <h2 className="titulo-documento">Documentos do Aluno</h2>
              <div className="div-documentos">
                <Link to="#" className="documento"><TbPointFilled /> Regras do Instituto</Link>
                <Link to="#" className="documento"><TbPointFilled /> Horários do Instituto</Link>
              </div>
              
            </section>
          
        </main>
      </div>
    </div>
  );
}

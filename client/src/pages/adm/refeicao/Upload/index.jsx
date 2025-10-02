import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoArrowUndoSharp } from "react-icons/io5";

export default function Upload() {

  return (
    <div>
      <br/>
            
      <Link to="/inicio-refeicao" className="voltar-ref"><IoArrowUndoSharp /></Link>
      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Alunos matriculados</h2>
      </div>
    </div>
  );
}
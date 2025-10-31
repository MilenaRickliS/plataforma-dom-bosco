import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { RiFileEditLine } from "react-icons/ri";
import { GiBinoculars } from "react-icons/gi";
import { FaUserPlus } from "react-icons/fa6";

export default function Inicio() {

  return (
    <div >
      <br/>
      
      <Link to="/inicio-adm" className="voltar-adm"><IoIosArrowBack />Voltar</Link>
      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Controle de refeições do instituto</h2>
      </div>
      <div className="opcoes-ref">
        <Link to="/adicionar-refeicao" className="opcao1">
          <FaPlus />
          Adicionar registro diário
        </Link>
        <Link to="/contar-refeicao" className="opcao1">
          <FaUserPlus />
          Fazer contagem de alunos
        </Link>
        <Link to="/relatorios-refeicao" className="opcao1">
          <RiFileEditLine />
          Relatórios
        </Link>
        <Link to="/registros-refeicao" className="opcao1">
          <GiBinoculars />
          Ver todos os registros
        </Link><Link to="/contar-alunos" className="opcao1">
          <FaUserPlus />
          Contar Esp32
        </Link>
      </div>
    </div>
  );
}
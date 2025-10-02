import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { RiFileEditLine } from "react-icons/ri";
import { GiBinoculars } from "react-icons/gi";

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
          <Link to="/adicionar-refeicao">Adicionar registro diário</Link>
        </Link>
        <Link to="/upload-refeicao" className="opcao1">
          <FiUpload />
          <Link to="/upload-refeicao" >Fazer upload de alunos matriculados</Link>
        </Link>
        <Link to="/relatorios-refeicao" className="opcao1">
          <RiFileEditLine />
          <Link to="/relatorios-refeicao" >Relatórios</Link>
        </Link>
        <Link to="/registros-refeicao" className="opcao1">
          <GiBinoculars />
          <Link to="/registros-refeicao" >Ver todos os registros</Link>
        </Link>
      </div>
    </div>
  );
}
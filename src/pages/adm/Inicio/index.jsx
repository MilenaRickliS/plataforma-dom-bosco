import { Link } from "react-router-dom";
import logo from '../../../assets/logo2.png';
import './style.css';
import { BiSolidDish } from "react-icons/bi";
import { FaUserLock } from "react-icons/fa6";

export default function Inicio() {

  return (
    <div className="fundo-admin">
        <div className="titulo-admin">
            <img src={logo} alt="Logo" />
            <p>Instituto Assistencial Dom Bosco - Portal do Administrador</p>
        </div>
        <div className="bemvindo-admin">
            <Link to="/inicio-refeicao" className="link-refeicao"><BiSolidDish /> Controle Refeições do Instituto</Link>
            <Link to="/menu-gestao" className="link-gestao"><FaUserLock /> Gestão Site Institucional</Link>                       
        </div>
    </div>
  );
}
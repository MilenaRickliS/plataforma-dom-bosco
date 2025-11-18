import "./style.css";
import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function MenuPortais() {
     return (
        <div>
             <div className="inicio-menug">
                <Link to="/inicio-adm" className="voltar-adm"><IoIosArrowBack />Voltar</Link>
                <div className="titulo-menug">
                    <img src={logo} alt="Logo" />
                    <p>Gestão dos Portais</p>
                </div>
                <div className="menu-portais">
                    <Link to="/usuarios" className="link-usuarios">Usuários</Link>
                    <Link to="/gerenciar-turmas" className="link-usuarios">Turmas</Link>
                    <Link to="/gamificacao" className="link-gamificacao">Gamificação</Link>
                </div>
                
                
            </div>
        </div>
    );
}
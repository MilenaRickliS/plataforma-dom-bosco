import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";

export default function MenuGestao() {
    return (
        <div>
            <div className="inicio-menug">
                <Link to="/inicio-adm" className="voltar-adm"><IoIosArrowBack />Voltar</Link>
                <div className="titulo-menug">
                    <img src={logo} alt="Logo" />
                    <p>Gestão Site Instituto</p>
                </div>
                
            </div>
            <p className="p-opcoes">Bem-vindo! Escolha uma das opções abaixo a editar:</p>
            <div className="opcoes-menug">
                <Link to="/galeria-gestao">GALERIA</Link>
                <Link to="/eventos-gestao">EVENTOS</Link>
                <Link to="/projetos-de-cursos-gestao">PROJETOS E OFICINAS</Link> 
                <Link to="/comunidade-gestao">PROJETOS SOCIAIS E VOLUNTARIADO</Link>   
                <Link to="/cursos-gestao">CURSOS</Link>                  
            </div>
        </div>
    );
}
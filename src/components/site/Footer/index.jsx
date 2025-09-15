import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp } from "react-icons/fa6";
import { PiPersonSimpleCircleBold } from "react-icons/pi";
import logo from '../../../assets/logo.png';
import './style.css';

export default function Footer() {
  const { signed } = useContext(AuthContext);

  return (
    <footer className="footer">
        <div className="footer-top">
            <div className="social-icons">
                <a href="#"><FaInstagram/></a>
                <a href="#"><FaFacebookF/></a>
                <a href="#"><FaYoutube/></a>
                <a href="#"><FaWhatsapp/></a>
            </div>
            <a href="#" className="doacao-btn">Faça uma doação!</a>
        </div>

        <div className="footer-links">
            <div>
                <Link to = '/' className="link-footer">Home</Link>
                <br/>
                <Link to = '/sobre' className="link-footer">Sobre nós</Link>
                <ul>
                    <li><a href="#">História</a></li>
                    <li><a href="#">Filosofia salesiana</a></li>
                    <li><a href="#">Equipe</a></li>
                    <li><a href="#">Galeria</a></li>
                </ul>
            </div>
            
            <div>
                <Link to = '/educacao' className="link-footer">Educação</Link>
                <ul>
                    <li><a href="#">Cursos</a></li>
                    <li><a href="#">Jovem Aprendiz</a></li>
                    <li><a href="#">Projetos e oficina</a></li>
                </ul>
                <Link to = '/comunidade' className="link-footer">Comunidade</Link>
                <ul>
                    <li><a href="#">Projetos sociais e voluntariado</a></li>
                    <li><a href="#">Parcerias</a></li>
                    <li><a href="#">Seja um parceiro!</a></li>
                </ul>
            </div>
        
            <div>
                <Link to = '/eventos' className="link-footer">Nóticias & Eventos</Link>
                <ul>
                    <li><a href="#">Eventos/Inscrições</a></li>
                    <li><a href="#">Blog</a></li>
                </ul>
                <Link to = '/contato' className="link-footer">Contato</Link>
            </div>
            <div>
                {!signed ? (
                    <Link id="login-footer" to="/login">
                        Login 
                    </Link>
                    ) : (
                      <span>Bem-vindo!</span>
                    )}
            </div>
            
        </div>

        <div className="footer-bottom">
            <img src={logo} alt="Logo" className="footer-logo"/>
            <p>@2025 - Instituto Assistencial Dom Bosco. 92.822.741/0003-38. R. Padre Caetano Vendrami, 303 - Vila Carli, Guarapuava - PR, 85040-050</p>  
            <PiPersonSimpleCircleBold />
        </div>
    </footer>

  );
}

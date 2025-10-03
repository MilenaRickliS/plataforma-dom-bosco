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
                <a href="https://www.instagram.com/iadbguarapuava/"><FaInstagram/></a>
                <a href="https://www.facebook.com/IADBGuarapuava"><FaFacebookF/></a>
                <a href="https://www.youtube.com/c/SalesianosSul"><FaYoutube/></a>
                <a href="https://api.whatsapp.com/send/?phone=5542984055914&text&type=phone_number&app_absent=0"><FaWhatsapp/></a>
            </div>
            <a href="https://iadb.doardigital.com.br/doacao" className="doacao-btn">Faça uma doação!</a>
        </div>

        <div className="footer-links">
            <div>
                <Link to = '/' className="link-footer">Home</Link>
                <br/>
                <Link to = '/sobre' className="link-footer">Sobre nós</Link>
                <ul>
                    <li><a href="/sobre">História</a></li>
                    <li><a href="/sobre">Filosofia salesiana</a></li>
                    <li><a href="/sobre">Equipe</a></li>
                    <li><a href="/galeria">Galeria</a></li>
                </ul>
            </div>
            
            <div>
                <Link to = '/educacao' className="link-footer">Educação</Link>
                <ul>
                    <li><a href="/educacao">Cursos</a></li>
                    <li><a href="/detalhes-curso">Jovem Aprendiz</a></li>
                    <li><a href="/projetos&oficinas">Projetos e oficina</a></li>
                </ul>
                <Link to = '/comunidade' className="link-footer">Comunidade</Link>
                <ul>
                    <li><a href="/comunidade">Projetos sociais e voluntariado</a></li>
                    <li><a href="/comunidade">Parcerias</a></li>
                    <li><a href="http://iadbguarapuava.com.br/seja-um-parceiro/">Seja um parceiro!</a></li>
                </ul>
            </div>
        
            <div>
                <Link to = '/eventos' className="link-footer">Nóticias & Eventos</Link>
                <ul>
                    <li><a href="/eventos">Eventos/Inscrições</a></li>
                    <li><a href="#">Blog</a></li>
                </ul>
                <Link to = '/contato' className="link-footer">Contato</Link>
            </div>
            <div>
                {!signed ? (
                    <Link id="login-footer" to="/login">
                        Portal do Aluno 
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

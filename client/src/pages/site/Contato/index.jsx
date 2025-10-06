import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import './style.css';
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { IoIosPin } from "react-icons/io";

export default function Contato() {
  return (
    <div className="page">
        <Header />
        <main>
          <h1>Contato</h1>
          <p className="subtitulo-contato">Tem alguma dúvida ou sugestão.<br/>Entre em contato conosco agora mesmo!</p>
          <div className="container-contato">
            <div className="opcoes-contato">
              <div>
                <p><FaPhone /> (42) 3624-2318</p>
              </div>
              <div>
                <p><MdEmail /> contatos@dombosco.net</p>
              </div>
              <div>
                <p><IoIosPin /> R. Padre Caetano Vendrami, 303 - Vila Carli, Guarapuava - PR, 85040-050</p>
              </div>
            </div>
            <form id="form-contato" className="form-contato">
              <input type="text" name="nome" placeholder="Nome completo" />
              <input type="text" name="email" placeholder="E-mail" />
              <input type="text" name="telefone" placeholder="Telefone"  />
              <input type="text" name="assunto" placeholder="Assunto" />
              <textarea name="mensagem" placeholder="Escreva sua mensagem" />
              <button type="submit">Enviar</button>
            </form>
          </div>
          <div className="div-mapa">
            <h2>Encontre-nos no Google Maps</h2>
            <div className="mapa-container">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3604.848202047173!2d-51.49376965952778!3d-25.376403477689262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ef37a39bf787a3%3A0xf95e737a46ee9a1c!2sInstituto%20Assistencial%20Dom%20Bosco!5e0!3m2!1spt-BR!2sbr!4v1759755000061!5m2!1spt-BR!2sbr" 
              allowfullscreen
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            
          </div>      
        </main>
        <Footer />
    </div>
  );
}

import { useState } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import './style.css';
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { IoIosPin } from "react-icons/io";
import axios from "axios";

export default function Contato() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  });
  const [toast, setToast] = useState({ message: "", type: "" });

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarTexto = (texto) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(texto.trim());
  
   const formatarTelefone = (valor) => {
    let v = valor.replace(/\D/g, ""); 
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      return v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "telefone") {
      value = formatarTelefone(value);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nome, email, telefone, assunto, mensagem } = formData;

    
    if (!nome || !email || !telefone || !assunto || !mensagem) {
      mostrarToast("Preencha todos os campos!", "erro");
      return;
    }

    if (!validarTexto(nome)) {
      mostrarToast("O nome deve conter apenas letras e acentos.", "erro");
      return;
    }

    if (!validarEmail(email)) {
      mostrarToast("Digite um e-mail válido (ex: exemplo@site.com).", "erro");
      return;
    }

    if (telefone.replace(/\D/g, "").length < 10) {
      mostrarToast("Digite um telefone válido.", "erro");
      return;
    }

    if (!validarTexto(assunto)) {
      mostrarToast("O assunto deve conter apenas letras e acentos.", "erro");
      return;
    }

    if (mensagem.trim().length < 3) {
      mostrarToast("A mensagem não pode estar vazia.", "erro");
      return;
    }

    try {
      await axios.post(`${API}/api/email`, formData);
      mostrarToast("Mensagem enviada com sucesso!", "sucesso");
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        assunto: "",
        mensagem: "",
      });
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao enviar a mensagem. Tente novamente.", "erro");
    }
  };

  const mostrarToast = (mensagem, tipo) => {
    setToast({ message: mensagem, type: tipo });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  return (
    <div className="page">
        <Header />
        {toast.message && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
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
            <form className="form-contato" onSubmit={handleSubmit}>
              <input type="text" name="nome" placeholder="Nome completo" value={formData.nome} onChange={handleChange} />
              <input type="text" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} />
              <input type="text" name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleChange} />
              <input type="text" name="assunto" placeholder="Assunto" value={formData.assunto} onChange={handleChange} />
              <textarea name="mensagem" placeholder="Escreva sua mensagem" value={formData.mensagem} onChange={handleChange} />
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

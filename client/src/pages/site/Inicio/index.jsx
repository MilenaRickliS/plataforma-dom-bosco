import { useState, useEffect, useRef } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline, IoArrowForwardCircleOutline } from "react-icons/io5";
import equipe from "../../../assets/site/equipe.jpg";



// adicionar fonte de acordo com o projeto - bruno

export default function Inicio() {
  const [depoimentos, setDepoimentos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    empresa: "",
    mensagem: "",
  });
  const carrosselRef = useRef(null);
  const scroll = (direction) => {
    const container = carrosselRef.current;
    const width = container.offsetWidth; 
    container.scrollBy({ left: direction * width, behavior: "smooth" });
  };

  useEffect(() => {
  fetch("http://localhost:5000/api/depoimentos")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) setDepoimentos(data);
      else setDepoimentos([]); 
    })
    .catch(err => {
      console.error("Erro ao carregar depoimentos:", err);
      setDepoimentos([]);
    });
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

  if (name === "nome" || name === "empresa") {
    
    const regex = /^[A-Za-zÀ-ú\s]*$/;
    if (!regex.test(value)) return; 
  }

  if (name === "telefone") {
    
    let numeros = value.replace(/\D/g, "");
    if (numeros.length > 11) numeros = numeros.slice(0, 11);

    if (numeros.length <= 2) {
      setForm({ ...form, telefone: `(${numeros}` });
    } else if (numeros.length <= 7) {
      setForm({ ...form, telefone: `(${numeros.slice(0,2)}) ${numeros.slice(2)}` });
    } else {
      setForm({ ...form, telefone: `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}` });
    }
    return;
  }

  setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim() || !form.empresa.trim() || !form.mensagem.trim()) {
      alert("Todos os campos são obrigatórios.");
      return;
    }
    const regexLetras = /^[A-Za-zÀ-ú\s]+$/;
    if (!regexLetras.test(form.nome)) {
      alert("O nome só pode conter letras e acentos.");
      return;
    }
    if (!regexLetras.test(form.empresa)) {
      alert("A empresa só pode conter letras e acentos.");
      return;
    }
    if (form.mensagem.trim().split(/\s+/).length < 5) {
      alert("A mensagem precisa ter pelo menos 5 palavras.");
      return;
    }

    if (!form.nome || !form.mensagem) {
      alert("Nome e mensagem são obrigatórios.");
      return;
    }
      const numerosTelefone = form.telefone.replace(/\D/g, "");
    if (numerosTelefone.length < 10 || numerosTelefone.length > 11) {
      alert("Telefone inválido.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/depoimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao enviar depoimento.");
      const novo = await res.json();
      setDepoimentos([...depoimentos, novo]);
      setForm({ nome: "", telefone: "", empresa: "", mensagem: "" });
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar depoimento.");
    }
  };

  return (
    <div className="page">
      <Header />
      <main className="inicio-main">
        <section className="inicio-hero">
          <div className="inicio-image-wrapper">
            <img
              className="inicio-image"
              src="/src/assets/site/transferir__1_-removebg-preview.png"
              alt="Jovem participando"
            />
          </div>

          <h1 className="inicio-title">
            <span className="line">Aqui o Jovem <span className="sonha">sonha</span>,</span>
            <span className="line">
              <span className="aprende">aprende</span>
              <span> e </span>
              <span className="conquista">conquista</span>!
            </span>
            <span className="line cta">Bora fazer parte?</span>
          </h1>
        </section>
        <br/>
        <section className="sessao-sobre">
          <div className="div-sobre">
            <h3>Um pouco sobre nós</h3>
            <div className="sobre1">
              <div>
                <span>missão</span>
                <p>Acolher adolescentes e jovens do meio popular, despertando seu protagonismo através do Sistema Preventivo de Dom Bosco.</p>
              </div>
              <div>
                <span>visão</span>
                <p>Ser uma entidade de referência na transformação social, junto aos adolescentes e jovens no crescimento humano e cristão.</p>
              </div>
              <div>
                <span>valores</span>
                <p>Respeito, confiança e responsabilidade: pilares que formam nossa caminhada junto aos jovens.</p>
              </div>
            </div>
            <br/>
            <Link to="/sobre" className="link-sobre">Conheça mais sobre nós! Clique aqui!</Link>
          </div>
        </section>

        <section className="sessao-eventos">
          <div className="div-eventos">
            <h3>Eventos &<br/>Nóticias</h3>
            <div className="botoes">
              <IoArrowBackCircleOutline />
              <IoArrowForwardCircleOutline />
            </div>
            <Link to="https://dombosco.net/category/obras-sociais-guarapuava-blog/">Ir para o blog</Link>
          </div>
          <br/><br/>
          <div className="eventos">
            <div className="post-evento">
              Tituloo
            </div>
            <div className="post-evento">
              Tituloo
            </div>
          </div>        
        </section>

        <section className="sessao-site">
          <div className="convite">
            <p>Descubra uma comunidade que vive para os jovens: conheça a <span>Inspetoria Salesiana</span> e inspire-se com nosso carisma e missão.</p>
            <Link to="https://dombosco.net/">Convite ao site: Salensianos do Sul</Link>
          </div>
          <img src={equipe} alt="equipe salensianos"/>
        </section>

        <section className="sessao-depoimentos">
          <div className="titulo-depoimento">
            <h2>Depoimentos</h2>
            <button
              onClick={() => document.getElementById("form-depoimento").scrollIntoView({ behavior: "smooth" })} className="enviar-depoimento">
              Deixe um depoimento!
            </button>
          </div>
          <div className="carrossel-container">
            <button className="arrow back" onClick={() => scroll(-1)}>
              <IoArrowBackCircleOutline size={40} />
            </button>
            <div className="carrossel" ref={carrosselRef}>
              {depoimentos.map((dep, index) => (
                <div key={index} className="depoimento-item">
                  <p>"{dep.mensagem}"</p>
                  <span>{dep.nome} - {dep.empresa || "Aluno"}</span>
                </div>
              ))}
            </div>
             <button className="arrow forward" onClick={() => scroll(1)}>
              <IoArrowForwardCircleOutline size={40} />
            </button>
          </div>

          <form id="form-depoimento" onSubmit={handleSubmit} className="form-depoimento">
            <input type="text" name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
            <input type="text" name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
            <input type="text" name="empresa" placeholder="Empresa / Tipo de voluntário" value={form.empresa} onChange={handleChange} />
            <textarea name="mensagem" placeholder="Escreva seu depoimento..." value={form.mensagem} onChange={handleChange} required />
            <button type="submit">Enviar</button>
          </form>
        </section>

      </main>
      <Footer />
    </div>
  );
}

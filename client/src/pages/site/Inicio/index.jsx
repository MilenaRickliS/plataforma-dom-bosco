import { useState, useEffect, useRef } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";
import { Link } from "react-router-dom";
import { IoArrowBackCircleOutline, IoArrowForwardCircleOutline } from "react-icons/io5";
import equipe from "../../../assets/site/equipe.jpg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export default function Inicio() {
  const [depoimentos, setDepoimentos] = useState([]);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    empresa: "",
    mensagem: "",
  });
  const [toast, setToast] = useState({ message: "", type: "" });
  const carrosselRef = useRef(null);
  const sliderRef = useRef(null);
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

  const mostrarToast = (mensagem, tipo) => {
      setToast({ message: mensagem, type: tipo });
      setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

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
    const { nome, telefone, empresa, mensagem } = form;

    
    const regexLetras = /^[A-Za-zÀ-ú\s]+$/;
    const telefoneNumeros = telefone.replace(/\D/g, "");

    if (!nome.trim() || !telefone.trim() || !empresa.trim() || !mensagem.trim()) {
      mostrarToast("Preencha todos os campos!", "erro");
      return;
    }
    if (!regexLetras.test(nome)) {
      mostrarToast("O nome deve conter apenas letras e acentos.", "erro");
      return;
    }
    if (!regexLetras.test(empresa)) {
      mostrarToast("A empresa deve conter apenas letras e acentos.", "erro");
      return;
    }
    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      mostrarToast("Digite um telefone válido.", "erro");
      return;
    }
    if (mensagem.trim().split(/\s+/).length < 5) {
      mostrarToast("A mensagem deve ter pelo menos 5 palavras.", "erro");
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
      mostrarToast("Depoimento enviado com sucesso!", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao enviar depoimento. Tente novamente.", "erro");
    }
  };
  const toggleMute = () => {
    setMuted(!muted);
    videoRef.current.muted = !videoRef.current.muted;
  };


  return (
    <div className="page">
      <Header />
      
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
      <main className="inicio-main">
        <section className="inicio-hero"> 
          <div className="inicio-image-wrapper">
            <video
              ref={videoRef}
              className="inicio-video"
              src="/src/assets/site/Quer saber um pouco mais sobre nós▶ Dê play no vídeo e descubra nosso impacto em mais de 40 anos.mp4"
              autoPlay
              loop
              muted={muted}
              playsInline
            />
            <button onClick={toggleMute} className="mute-btn">
              {muted ? "🔇 Ativar som" : "🔊 Silenciar"}
            </button>
          </div>

          <h1 className="inicio-title">
            <span className="line">Aqui o Jovem <span className="sonha">sonha</span>,</span>
            <span className="line">
              <span className="aprende">aprende</span>
              <span> e </span>
              <span className="conquista">conquista</span>!
            </span>
            <Link to="https://linktr.ee/iadbguarapuava?fbclid=PAZXh0bgNhZW0CMTEAAaeMxM1YWi0X1Vvw1BIGcfkkarCU6pIsVvN2Nll2VxxnrGcDkbcZTRR0BBhV1w_aem_8Tlkya6eB_wFMcrslJ27_Q"><span className="line cta">Bora fazer parte?</span></Link>
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
            <div className="eventos-navigation">
              <button className="eventos-arrow-custom prev" onClick={() => sliderRef.current?.slickPrev()}>
                <IoArrowBackCircleOutline size={35} />
              </button>
              <button className="eventos-arrow-custom next" onClick={() => sliderRef.current?.slickNext()}>
                <IoArrowForwardCircleOutline size={35} />
              </button>
            </div>
            <Link to="https://dombosco.net/category/obras-sociais-guarapuava-blog/" className="blog-link">Ir para o blog</Link>
          </div>
          <div className="eventos-carrossel-wrapper">
            <EventosCarrossel sliderRef={sliderRef} />
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

function EventosCarrossel({ sliderRef }) {
  const eventos = [
    {
      id: 1,
      titulo: "FEMUS 2025",
      imagem: "/src/assets/site/11o-FEMUS-Dom-Bosco_07-e-08.06-10.webp",
      link: "https://dombosco.net/category/obras-sociais-guarapuava-blog/",
    },
    {
      id: 2,
      titulo: "Torneio de Pênaltis",
      imagem: "/src/assets/site/1o-Torneio-de-Penaltis-Butiero_21.04-7-scaled.webp",
      link: "https://dombosco.net/category/obras-sociais-guarapuava-blog/",
    },
    {
      id: 3,
      titulo: "Almoço Encerramento 2023",
      imagem: "/src/assets/site/Almoco-encerramento-2023_16.12-8-1024x683.webp",
      link: "https://dombosco.net/category/obras-sociais-guarapuava-blog/",
    },
    {
      id: 4,
      titulo: "Galeria de Momentos",
      imagem: "/src/assets/site/18-11-2019_09-50-27.jpg",
      link: "https://dombosco.net/category/obras-sociais-guarapuava-blog/",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider ref={sliderRef} {...settings} className="eventos-slider">
      {eventos.map(ev => (
        <div key={ev.id} className="evento-item">
          <div className="evento-imagem-wrapper">
            <img src={ev.imagem} alt={ev.titulo} className="evento-imagem" />
          </div>
            <h4 className="evento-titulo">{ev.titulo}</h4>
            <Link to={ev.link} target="_blank" className="evento-botao">Ir para</Link>
        </div>
      ))}
    </Slider>
  );
}

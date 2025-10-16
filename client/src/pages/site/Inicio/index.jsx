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
import { FaCalendarAlt } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import axios from "axios";


export default function Inicio() {
  
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

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
  fetch(`${API}/api/depoimentos`)
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
      const res = await fetch(`${API}/api/depoimentos`, {
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
              src="/videos/Quer saber um pouco mais sobre nós▶ Dê play no vídeo e descubra nosso impacto em mais de 40 anos.mp4"
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
            <Link to="/sobre" className="link-sobre"  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Conheça mais sobre nós! Clique aqui!</Link>
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
              className="enviar-depoimento" onClick={() => window.scrollTo({ top: 3400, behavior: "smooth" })}>
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
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend.vercel.app";

  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [curtidos, setCurtidos] = useState({});
  const [curtidasContagem, setCurtidasContagem] = useState({});

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch(`${API}/api/eventos`);
        if (!res.ok) throw new Error("Erro ao buscar eventos");
        const data = await res.json();

        const agora = new Date();

        
        const futuros = data.filter((ev) => {
          if (!ev.dataHora) return false;
          const dataEvento = ev.dataHora._seconds
            ? new Date(ev.dataHora._seconds * 1000)
            : new Date(ev.dataHora);
          return dataEvento >= agora;
        });

        
        const ordenados = futuros.sort((a, b) => {
          const dataA = a.dataHora._seconds
            ? new Date(a.dataHora._seconds * 1000)
            : new Date(a.dataHora);
          const dataB = b.dataHora._seconds
            ? new Date(b.dataHora._seconds * 1000)
            : new Date(b.dataHora);
          return dataA - dataB;
        });

        
        setEventos(ordenados.slice(0, 5));
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
        setEventos([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchEventos();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, dots: true } },
      { breakpoint: 480, settings: { slidesToShow: 1, dots: true, autoplaySpeed: 4000 } },
    ],
  };


  if (carregando) {
    return <p className="carregando">Carregando eventos...</p>;
  }

  if (eventos.length === 0) {
    return <p className="sem-eventos">Nenhum evento futuro encontrado.</p>;
  }

  return (
    <Slider ref={sliderRef} {...settings} className="eventos-slider">
      {eventos.map((ev) => {
        const data = ev.dataHora._seconds
          ? new Date(ev.dataHora._seconds * 1000)
          : new Date(ev.dataHora);
        
            const curtido =
                  curtidos[ev.id] || !!localStorage.getItem(`curtido_${ev.id}`);

                const curtidas =
                  curtidasContagem[ev.id] !== undefined
                    ? curtidasContagem[ev.id]
                    : ev.curtidas || 0;

                const handleCurtir = async () => {
                  try {
                    const rota = curtido
                      ? `${API}/api/eventos/${ev.id}/descurtir`
                      : `${API}/api/eventos/${ev.id}/curtir`;

                    await axios.post(rota);

                    
                    setCurtidos((prev) => ({ ...prev, [ev.id]: !curtido }));
                    setCurtidasContagem((prev) => ({
                      ...prev,
                      [ev.id]: curtido ? curtidas - 1 : curtidas + 1,
                    }));

                    
                    if (!curtido)
                      localStorage.setItem(`curtido_${ev.id}`, true);
                    else localStorage.removeItem(`curtido_${ev.id}`);
                  } catch (err) {
                    console.error("Erro ao curtir:", err);
                  }
                };

        return (
          <div key={ev.id} className="evento-item">
            <div className="evento-imagem-wrapper">
              <img
                src={ev.imagemUrl}
                alt={ev.titulo}
                className="evento-imagem"
              />
            </div>

            <h4 className="evento-titulo">{ev.titulo}</h4>

            
            <div className="curtidas-evento" onClick={handleCurtir}>
                      {curtido ? (
                        <FaHeart className="icon-curtidas ativo" />
                      ) : (
                        <FaHeart className="icon-curtidas" />
                      )}
                      <span>{curtidas}</span>
                    </div>
                      <p className="evento-local">
                        <FaCalendarAlt /> {data.toLocaleDateString("pt-BR", { dateStyle: "medium" })}{" "}
                        às {data.toLocaleTimeString("pt-BR", { timeStyle: "short" })}<br />
                        <IoMdPin /> {ev.cidade} - {ev.estado}
                      </p>
            <Link to={`/detalhes-evento/${ev.id}`} className="evento-botao">
              Saiba mais
            </Link>
          </div>
        );
      })}
    </Slider>
  );
}

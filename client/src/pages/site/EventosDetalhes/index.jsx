import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";
import { IoMdPin, IoMdShare } from "react-icons/io";
import { FaLongArrowAltLeft, FaRegHeart, FaHeart, FaCalendarAlt, FaWhatsapp, FaFacebookF, FaCopy } from "react-icons/fa";
import axios from "axios";
import compartilhar from "../../../assets/site/compartilhar.png";

export default function EventosDetalhes() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [outros, setOutros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);
 
  const [curtidasEvento, setCurtidasEvento] = useState(0);
  const [curtidoEvento, setCurtidoEvento] = useState(false);


  const [curtidosOutros, setCurtidosOutros] = useState({});
  const [curtidasOutros, setCurtidasOutros] = useState({});


  useEffect(() => {
    fetchEvento();
  }, [id]);

const fetchEvento = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/eventos/${id}`);
    const eventoData = res.data;

    setEvento(eventoData);
    setCurtidasEvento(eventoData.curtidas || 0);

    
    const liked = localStorage.getItem(`curtido_${id}`);
    if (liked && (eventoData.curtidas || 0) > 0) {
      setCurtidoEvento(true);
    } else {
      setCurtidoEvento(false);
    }

    const todos = await axios.get("http://localhost:5000/api/eventos");
    const outrosEventos = todos.data
      .filter((e) => e.id !== id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
    setOutros(outrosEventos);
  } catch (error) {
    console.error("Erro ao carregar evento:", error);
  } finally {
    setCarregando(false);
    setTimeout(() => {
      document.querySelector(".evento-main")?.classList.add("fade-in");
    }, 100);
  }
};



  const handleCurtir = async () => {
    try {
      const rota = curtidoEvento
        ? `http://localhost:5000/api/eventos/${id}/descurtir`
        : `http://localhost:5000/api/eventos/${id}/curtir`;
      await axios.post(rota);

      setCurtidoEvento(!curtidoEvento);
      setCurtidasEvento((prev) => (curtidoEvento ? prev - 1 : prev + 1));

      if (!curtidoEvento) localStorage.setItem(`curtido_${id}`, true);
      else localStorage.removeItem(`curtido_${id}`);
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };



  const handleCopiarLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (carregando) {
    return <p className="carregando-evento">Carregando informações...</p>;
  }

  if (!evento) {
    return <p className="erro-evento">Evento não encontrado.</p>;
  }

  const data = evento.dataHora?._seconds
    ? new Date(evento.dataHora._seconds * 1000)
    : new Date(evento.dataHora);


  const shareUrl = window.location.href;
  const shareText = `Confira este evento: ${evento.titulo} - ${shareUrl}`;

  return (
    <div className="page">
      <Header />
      <main className="evento-main fade-container">
        <section
          className="inicio-detalhes-eventos"
          style={{
            backgroundImage: `url(${evento.imagemUrl})`,
          }}
        >
          

          <div className="informacoes-evento">
            <div className="titulo-evento">
              <h2>{evento.titulo}</h2>
              <p>
                <IoMdPin /> {evento.rua}, {evento.numero} - {evento.bairro},{" "}
                {evento.cidade} - {evento.estado}
              </p>
            </div>

            <div className="data-evento">
              <div className="curtir-container" onClick={handleCurtir}>
                {curtidoEvento ? (
                  <FaHeart className="icon-curtir ativo" />
                ) : (
                  <FaRegHeart className="icon-curtir" />
                )}
                <span>{curtidasEvento}</span>
              </div>

              <strong>Data & Hora</strong>
              <p>
                <FaCalendarAlt />{" "}
                {data.toLocaleString("pt-BR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {evento.temInscricao && (
                <>
                  <br />
                  <Link
                    to={evento.linkInscricao}
                    target="_blank"
                    className="link-inscricao"
                  >
                    INSCREVA-SE
                  </Link>
                </>
              )}
              <br />

              
              <div className="compartilhar-container">
                <button
                  onClick={() =>
                    window.open(
                      `https://api.whatsapp.com/send?text=${encodeURIComponent(
                        shareText
                      )}`
                    )
                  }
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        shareUrl
                      )}`
                    )
                  }
                >
                  <FaFacebookF />
                </button>
                <button onClick={handleCopiarLink}>
                  <FaCopy />
                </button>
                {copiado && <span className="copiado-msg">✅ Link copiado!</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="sessao-informacoes">
          <div className="informacoes1">
            <div className="informacoes1-1">
              <h4>Descrição</h4>
              <p>{evento.descricao || "Descrição não informada."}</p>

              <h4>Data & Hora</h4>
              <ul>
                <li>
                  {data.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </li>
              </ul>
            </div>

            <div className="informacoes1-2">
              <h4>Localização</h4>

              <div className="localizacao-card">
                <div className="localizacao-fundo"></div>

                <div className="localizacao-info">
                  <p><IoMdPin /> {evento.rua}, {evento.numero}</p>
                  <p>{evento.bairro} – {evento.cidade}/{evento.estado}</p>
                  
                </div>
              </div>
            </div>

          </div>
          <div className="informacoes2">
            <div className="informacoes2-1">
              <h4>Tem alguma dúvida?</h4>
              <p>(42) 3624-2318</p>
              <Link to="https://api.whatsapp.com/send/?phone=5542984055914&text=Olá, tenho uma dúvida sobre o evento&app_absent=0">
                <FaWhatsapp /> ENVIAR WHATS
              </Link>
            </div>

            <div className="informacoes2-2">
              <img src={compartilhar} alt="compartilhar" />
              <Link
                to={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  shareText
                )}`}
                target="_blank"
              >
                <IoMdShare /> compartilhar evento
              </Link>
            </div>
          </div>
        </section>

        <section className="outros-eventos">
          <h2>Outros eventos que talvez você goste:</h2>
          <div className="cards-eventos-show">
            {outros.map((e) => {
              const dataOutro = e.dataHora?._seconds
                ? new Date(e.dataHora._seconds * 1000)
                : new Date(e.dataHora);

             
              const curtido =
                curtidosOutros[e.id] || !!localStorage.getItem(`curtido_${e.id}`);

              const curtidas =
                curtidasOutros[e.id] !== undefined
                  ? curtidasOutros[e.id]
                  : e.curtidas || 0;


              const handleCurtir = async () => {
                try {
                  const rota = curtido
                    ? `http://localhost:5000/api/eventos/${e.id}/descurtir`
                    : `http://localhost:5000/api/eventos/${e.id}/curtir`;

                  await axios.post(rota);

                  setCurtidosOutros((prev) => ({ ...prev, [e.id]: !curtido }));
                  setCurtidasOutros((prev) => ({
                    ...prev,
                    [e.id]: curtido ? curtidas - 1 : curtidas + 1,
                  }));

                  if (!curtido)
                    localStorage.setItem(`curtido_${e.id}`, true);
                  else localStorage.removeItem(`curtido_${e.id}`);
                } catch (err) {
                  console.error("Erro ao curtir:", err);
                }
              };

              return (
                <div key={e.id} className="card-evento-show">
                  <img src={e.imagemUrl} alt={e.titulo} />
                  <p>{e.titulo}</p>

                  
                  <div className="curtidas-evento" onClick={handleCurtir}>
                    {curtido ? (
                      <FaHeart className="icon-curtidas ativo" />
                    ) : (
                      <FaHeart className="icon-curtidas" />
                    )}
                    <span>{curtidas}</span>
                  </div>

                  <span className="detalhes-evento-info">
                    <FaCalendarAlt />{" "}
                    {dataOutro.toLocaleDateString("pt-BR", {
                      dateStyle: "medium",
                    })}
                    <br />
                    <IoMdPin /> {e.cidade} - {e.estado}
                  </span>

                  <Link to={`/detalhes-evento/${e.id}`}>Saiba mais!</Link>
                </div>
              );
            })}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

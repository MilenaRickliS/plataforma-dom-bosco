import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import "./style.css";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FaHeart } from "react-icons/fa";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroData, setFiltroData] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [curtidos, setCurtidos] = useState({});
  const [curtidasContagem, setCurtidasContagem] = useState({});

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/eventos");
      const ordenados = res.data.sort((a, b) => {
        const dataA = a.dataHora?._seconds
          ? new Date(a.dataHora._seconds * 1000)
          : new Date(a.dataHora);
        const dataB = b.dataHora?._seconds
          ? new Date(b.dataHora._seconds * 1000)
          : new Date(b.dataHora);
        return dataA - dataB; 
      });
      setEventos(ordenados);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setCarregando(false);
    }
  };

  const filtrarEventos = (lista) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return lista.filter((evento) => {
      const dataEvento = evento.dataHora?._seconds
        ? new Date(evento.dataHora._seconds * 1000)
        : new Date(evento.dataHora);

      const apenasDataEvento = new Date(
        dataEvento.getFullYear(),
        dataEvento.getMonth(),
        dataEvento.getDate()
      );

      
      const correspondeTitulo = evento.titulo
        ?.toLowerCase()
        .includes(filtroTexto.toLowerCase());

      
      let correspondeData = true;
      if (filtroData === "futuros") correspondeData = apenasDataEvento > hoje;
      if (filtroData === "antigos") correspondeData = apenasDataEvento < hoje;
      if (filtroData === "hoje")
        correspondeData = apenasDataEvento.getTime() === hoje.getTime();

      return correspondeTitulo && correspondeData;
    });
  };

  
const proximosEventos = eventos
  .filter((evento) => {
    const dataEvento = evento.dataHora?._seconds
      ? new Date(evento.dataHora._seconds * 1000)
      : new Date(evento.dataHora);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataEvento >= hoje; 
  })
  .sort((a, b) => {
    const dataA = a.dataHora?._seconds
      ? new Date(a.dataHora._seconds * 1000)
      : new Date(a.dataHora);
    const dataB = b.dataHora?._seconds
      ? new Date(b.dataHora._seconds * 1000)
      : new Date(b.dataHora);
    return dataA - dataB; 
  })
  .slice(0, 5); 


 
  const eventosFiltrados = filtrarEventos(eventos).sort((a, b) => {
    const dataA = a.dataHora?._seconds
      ? new Date(a.dataHora._seconds * 1000)
      : new Date(a.dataHora);
    const dataB = b.dataHora?._seconds
      ? new Date(b.dataHora._seconds * 1000)
      : new Date(b.dataHora);
    return dataB - dataA;
  });

  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const eventosPorPagina = 6;
  const indiceUltimoEvento = paginaAtual * eventosPorPagina;
  const indicePrimeiroEvento = indiceUltimoEvento - eventosPorPagina;
  const eventosPaginados = eventosFiltrados.slice(indicePrimeiroEvento, indiceUltimoEvento);

  const totalPaginas = Math.ceil(eventosFiltrados.length / eventosPorPagina);

  const irParaPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) setPaginaAtual(num);
  };


  return (
    <div className="eventos-page">
      <Header />
      <main className="container-eventos">
        <div className="inicio-eventos">
          <div className="titulo-prox">
            <h1>Próximos<br />Eventos</h1>
            <Link to="/proximos-eventos">
              Clique aqui para<br />visualizar os eventos<br />
              mais próximos <FaArrowRightLong />
            </Link>
          </div>

          <div className="menu-eventos">
            {carregando ? (
              <p className="carregando">Carregando...</p>
            ) : proximosEventos.length > 0 ? (
              proximosEventos.map((evento) => {
                const data = evento.dataHora?._seconds
                  ? new Date(evento.dataHora._seconds * 1000)
                  : new Date(evento.dataHora);

                  const curtido =
                  curtidos[evento.id] || !!localStorage.getItem(`curtido_${evento.id}`);

                const curtidas =
                  curtidasContagem[evento.id] !== undefined
                    ? curtidasContagem[evento.id]
                    : evento.curtidas || 0;

                const handleCurtir = async () => {
                  try {
                    const rota = curtido
                      ? `http://localhost:5000/api/eventos/${evento.id}/descurtir`
                      : `http://localhost:5000/api/eventos/${evento.id}/curtir`;

                    await axios.post(rota);

                    
                    setCurtidos((prev) => ({ ...prev, [evento.id]: !curtido }));
                    setCurtidasContagem((prev) => ({
                      ...prev,
                      [evento.id]: curtido ? curtidas - 1 : curtidas + 1,
                    }));

                    
                    if (!curtido)
                      localStorage.setItem(`curtido_${evento.id}`, true);
                    else localStorage.removeItem(`curtido_${evento.id}`);
                  } catch (err) {
                    console.error("Erro ao curtir:", err);
                  }
                };

                return (
                  <div key={evento.id} className="card-evento-prox">
                    <img src={evento.imagemUrl} alt={evento.titulo} />
                    <div className="info-prox">
                      <p className="titulo-prox-evento">{evento.titulo}</p>
                      <div className="curtidas-evento" onClick={handleCurtir}>
                      {curtido ? (
                        <FaHeart className="icon-curtidas ativo" />
                      ) : (
                        <FaHeart className="icon-curtidas" />
                      )}
                      <span>{curtidas}</span>
                    </div>
                      <p className="detalhes-prox-evento">
                        <FaCalendarAlt />{data.toLocaleDateString("pt-BR", { dateStyle: "medium" })}{" "}
                        às {data.toLocaleTimeString("pt-BR", { timeStyle: "short" })}<br />
                        <IoMdPin /> {evento.cidade} - {evento.estado}
                      </p>
                      <Link to={`/detalhes-evento/${evento.id}`} className="link-prox"  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        Saiba mais!
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="sem-eventos">Nenhum evento futuro encontrado.</p>
            )}
          </div>
        </div>


        <section className="mostrar-eventos">
          <h1>Todos os Eventos & Nóticias</h1>
          <div className="filtros-eventos">
            <div className="barra-pesquisa">
              <FaSearch className="icone-pesquisa" />
              <input
                type="text"
                placeholder="Pesquisar evento por título..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>

            <select
              className="select-filtro"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="hoje">Hoje</option>
              <option value="futuros">Futuros</option>
              <option value="antigos">Antigos</option>
            </select>
          </div>
           <div className="cards-eventos-show">
            {eventosPaginados.length > 0 ? (
              eventosPaginados.map((evento) => {
                const data = evento.dataHora?._seconds
                  ? new Date(evento.dataHora._seconds * 1000)
                  : new Date(evento.dataHora);

                const curtido =
                  curtidos[evento.id] || !!localStorage.getItem(`curtido_${evento.id}`);

                const curtidas =
                  curtidasContagem[evento.id] !== undefined
                    ? curtidasContagem[evento.id]
                    : evento.curtidas || 0;

                const handleCurtir = async () => {
                  try {
                    const rota = curtido
                      ? `http://localhost:5000/api/eventos/${evento.id}/descurtir`
                      : `http://localhost:5000/api/eventos/${evento.id}/curtir`;

                    await axios.post(rota);

                    
                    setCurtidos((prev) => ({ ...prev, [evento.id]: !curtido }));
                    setCurtidasContagem((prev) => ({
                      ...prev,
                      [evento.id]: curtido ? curtidas - 1 : curtidas + 1,
                    }));

                    
                    if (!curtido)
                      localStorage.setItem(`curtido_${evento.id}`, true);
                    else localStorage.removeItem(`curtido_${evento.id}`);
                  } catch (err) {
                    console.error("Erro ao curtir:", err);
                  }
                };

                return (
                  <div key={evento.id} className="card-evento-show">
                    <img src={evento.imagemUrl} alt={evento.titulo} />
                    <p>{evento.titulo}</p>

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
                      {data.toLocaleString("pt-BR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      <br />
                      <IoMdPin /> {evento.cidade} - {evento.estado}
                    </span>
                    <Link to={`/detalhes-evento/${evento.id}`}  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Saiba mais!</Link>
                  </div>
                );
              })
            ) : (
              <p className="sem-eventos">Nenhum evento encontrado.</p>
            )}

          </div>

          
          {totalPaginas > 1 && (
            <div className="paginacao-eventos">
              <button
                onClick={() => irParaPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              >
                <IoIosArrowBack />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  onClick={() => irParaPagina(i + 1)}
                  className={paginaAtual === i + 1 ? "ativo" : ""}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => irParaPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}

        </section>

        <section className="blog">
          <h1>Blog</h1>
          <p>O nosso blog é um espaço feito para você acompanhar de perto a vida do Instituto Dom Bosco. Aqui, compartilhamos notícias, histórias inspiradoras, eventos, conquistas e reflexões que mostram como a educação e a solidariedade transformam vidas.👉 Clique e venha se atualizar, se emocionar e fazer parte dessa caminhada com a gente!</p>
          <Link to="https://dombosco.net/category/obras-sociais-guarapuava-blog/">Conhecer blog <FaLongArrowAltRight /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
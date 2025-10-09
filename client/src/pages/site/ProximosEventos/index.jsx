import { useEffect, useState } from "react";
import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";
import { Link } from "react-router-dom";
import { FaSearch, FaCalendarAlt, FaLongArrowAltRight } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

export default function ProximosEventos() {
  const [eventos, setEventos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const eventosPorPagina = 6;

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/eventos");
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const proximos = res.data
        .filter((evento) => {
          const dataEvento = evento.dataHora?._seconds
            ? new Date(evento.dataHora._seconds * 1000)
            : new Date(evento.dataHora);
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
        });

      setEventos(proximos);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setCarregando(false);
    }
  };

  const eventosFiltrados = eventos.filter((evento) =>
    evento.titulo?.toLowerCase().includes(filtroTexto.toLowerCase())
  );


  const indiceUltimoEvento = paginaAtual * eventosPorPagina;
  const indicePrimeiroEvento = indiceUltimoEvento - eventosPorPagina;
  const eventosPaginados = eventosFiltrados.slice(
    indicePrimeiroEvento,
    indiceUltimoEvento
  );
  const totalPaginas = Math.ceil(eventosFiltrados.length / eventosPorPagina);

  const irParaPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) setPaginaAtual(num);
  };

  return (
    <div className="eventos-page">
      <Header />
      <main className="container-eventos">
        <section className="inicio-proximos-eventos">
          <h1>Próximos Eventos</h1>
          <p>
            O Instituto Dom Bosco está sempre em movimento, promovendo
            atividades que unem educação, cultura, esporte e solidariedade.
            Nossos eventos são oportunidades especiais para celebrar conquistas,
            fortalecer laços e viver momentos de aprendizado e alegria.
            <br />
            <span>
              Participe, traga sua família e faça parte dessa história com a
              gente!
            </span>
          </p>
        </section>

        <section className="mostrar-eventos">
  

          
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
          </div>

          
          <div className="cards-eventos-show">
            {carregando ? (
              <p className="carregando">Carregando...</p>
            ) : eventosPaginados.length > 0 ? (
              eventosPaginados.map((evento) => {
                const data = evento.dataHora?._seconds
                  ? new Date(evento.dataHora._seconds * 1000)
                  : new Date(evento.dataHora);
                return (
                  <div key={evento.id} className="card-evento-show">
                    <img src={evento.imagemUrl} alt={evento.titulo} />
                    <p>{evento.titulo}</p>
                    <span className="detalhes-evento-info">
                      <FaCalendarAlt />{" "}
                      {data.toLocaleString("pt-BR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      <br />
                      <IoMdPin /> {evento.cidade} - {evento.estado}
                    </span>
                    <Link to={`/detalhes-evento/${evento.id}`}>Saiba mais!</Link>
                  </div>
                );
              })
            ) : (
              <p className="sem-eventos">Nenhum evento futuro encontrado.</p>
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
          <p>
            O nosso blog é um espaço feito para você acompanhar de perto a vida
            do Instituto Dom Bosco. Aqui, compartilhamos notícias, histórias
            inspiradoras, eventos, conquistas e reflexões que mostram como a
            educação e a solidariedade transformam vidas. 👉 Clique e venha se
            atualizar, se emocionar e fazer parte dessa caminhada com a gente!
          </p>
          <Link to="https://dombosco.net/category/obras-sociais-guarapuava-blog/">
            Conhecer blog <FaLongArrowAltRight />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

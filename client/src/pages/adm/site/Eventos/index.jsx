import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import axios from "axios";
import "./style.css";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";

export default function EventosGestao() {
  const API = import.meta.env.VITE_API_URL;
  const [eventos, setEventos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroData, setFiltroData] = useState("todos");
  const [toast, setToast] = useState(null);

  const fetchEventos = async () => {
    try {
      const res = await axios.get(`${API}/api/eventos`);
      const ordenados = res.data.sort((a, b) => {
        const dataA = a.dataHora?._seconds
          ? new Date(a.dataHora._seconds * 1000)
          : new Date(a.dataHora);
        const dataB = b.dataHora?._seconds
          ? new Date(b.dataHora._seconds * 1000)
          : new Date(b.dataHora);
        return dataB - dataA;
      });

      setEventos(ordenados);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const mostrarToast = (mensagem, tipo) => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este evento?")) {
      try {
        await axios.delete(`${API}/api/eventos/${id}`);
        mostrarToast("Evento excluído com sucesso!", "sucesso");
        fetchEventos();
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        mostrarToast("Erro ao excluir evento!", "erro");
      }
    }
  };

 
  const eventosFiltrados = eventos.filter((evento) => {
   
    const correspondeTitulo = evento.titulo
      ?.toLowerCase()
      .includes(filtroTexto.toLowerCase());

   
    const dataEvento = evento.dataHora?._seconds
      ? new Date(evento.dataHora._seconds * 1000)
      : new Date(evento.dataHora);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const apenasDataEvento = new Date(
      dataEvento.getFullYear(),
      dataEvento.getMonth(),
      dataEvento.getDate()
    );

    let correspondeData = true;

    if (filtroData === "futuros") {
      correspondeData = apenasDataEvento > hoje;
    } else if (filtroData === "antigos") {
      correspondeData = apenasDataEvento < hoje;
    } else if (filtroData === "hoje") {
      correspondeData = apenasDataEvento.getTime() === hoje.getTime();
    }

    return correspondeTitulo && correspondeData;
  });

  return (
    <div className="eventos-gestao-container">
      <Link to="/menu-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      <div className="container-gestao-evento">
        <h1 className="h1-eventos">Todos os Eventos & Notícias</h1>
        <Link to="/criar-evento" className="adicionar-evento">
          + adicionar evento
        </Link>
      </div>

      
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

      <div className="cards-eventos">
        {eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((evento) => (
            <div className="card-evento" key={evento.id}>
              <img
                src={evento.imagemUrl}
                alt={evento.titulo}
                className="img-evento"
              />
              <div className="info-evento">
                <h2>{evento.titulo}</h2>
                <p className="descricao-evento">{evento.descricao}</p>

                <p className="data">
                  <FaCalendarAlt />{" "}
                  {(() => {
                    if (!evento.dataHora) return "Data não informada";

                    if (evento.dataHora._seconds) {
                      return new Date(
                        evento.dataHora._seconds * 1000
                      ).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      });
                    }

                    const parsedDate = new Date(evento.dataHora);
                    if (!isNaN(parsedDate)) {
                      return parsedDate.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      });
                    }

                    return "Data inválida";
                  })()}
                </p>

                <p className="local">
                  <IoMdPin /> {evento.rua}, {evento.numero} - {evento.bairro},{" "}
                  {evento.cidade}
                </p>

                {evento.temInscricao && (
                  <a
                    href={evento.linkInscricao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-inscricao-evento"
                  >
                    Inscrição
                  </a>
                )}

                <div className="botoes-evento">
                  <Link
                    to={`/criar-evento?id=${evento.id}`}
                    className="editar-evento"
                  >
                    <MdModeEditOutline /> Editar
                  </Link>
                  <button
                    className="excluir-evento"
                    onClick={() => handleExcluir(evento.id)}
                  >
                    <IoMdTrash /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="nenhum-evento">Nenhum evento encontrado.</p>
        )}
      </div>

      {toast && <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import axios from "axios";
import "./style.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";

export default function EventosGestao() {
  const [eventos, setEventos] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const fetchEventos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/eventos");
      const ordenados = res.data.sort(
        (a, b) =>
          new Date(b.createdAt?._seconds * 1000) -
          new Date(a.createdAt?._seconds * 1000)
      );
      setEventos(ordenados);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este evento?")) {
      try {
        await axios.delete(`http://localhost:5000/api/eventos/${id}`);
        setMensagem("Evento excluído com sucesso!");
        fetchEventos();
        setTimeout(() => setMensagem(""), 3000);
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        setMensagem("Erro ao excluir evento!");
      }
    }
  };

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

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <div className="cards-eventos">
        {eventos.map((evento) => (
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
                    return new Date(evento.dataHora._seconds * 1000).toLocaleString("pt-BR", {
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
                <IoMdPin /> {evento.rua}, {evento.numero} - {evento.bairro}, {evento.cidade}
              </p>
              {evento.temInscricao && (
                <a
                  href={evento.linkInscricao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-inscricao-evento"
                >
                  Fazer inscrição
                </a>
              )}

              <div className="botoes-evento">
                <Link
                  to={`/criar-evento-gestao?id=${evento.id}`}
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
        ))}
      </div>
    </div>
  );
}

import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import './style.css';
import { FaArrowRightLong } from "react-icons/fa6";

export default function Eventos() {
  const eventos = [
    { id: 1, nome: "Evento 1", link: "/detalhes-evento" },
    { id: 2, nome: "Evento 2", link: "/detalhes-evento" },
    { id: 3, nome: "Evento 3", link: "/detalhes-evento" },
    { id: 4, nome: "Evento 4", link: "/detalhes-evento" },
    { id: 5, nome: "Evento 5", link: "/detalhes-evento" },
  ];

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
            {eventos.map((evento) => (
              <div key={evento.id} className="card-evento">
                <p>{evento.nome}</p>
                <Link to={evento.link}>Saiba mais!</Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

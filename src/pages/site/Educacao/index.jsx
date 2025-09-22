import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import { Link } from "react-router-dom";
import './style.css';

export default function Educacao() {
  
  const cursos = [
    { id: 1, nome: "Jovem Aprendiz", subtitulo: "A oportunidade que abre portas para o seu futuro!", bg: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" },
    { id: 2, nome: "Música", subtitulo: "Aprenda a tocar instrumentos do básico ao avançado com professores capacitados!", bg: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" },
    { id: 3, nome: "Informática", subtitulo: "Uso básico de computador e internet, Office/Google, e-mail e nuvem, segurança online e noções de hardware/programação para o dia a dia.", bg: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)" },
    { id: 4, nome: "Esportes", subtitulo: "Aprenda ou aprimore suas habilidades no seu esporte favorito!", bg: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" },
    { id: 5, nome: "Pré-aprendizagem", subtitulo: "Estimula o aprendizado de habilidades essenciais!", bg: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)" },
  ];

  return (
    <div className="page">
      <Header />
      <main>
        <h1>Cursos</h1>
        <div className="menu-cursos">
            {cursos.map((curso) => (
              <div key={curso.id} className="card-curso">
                <h4>{curso.nome}</h4>
                <p>{curso.subtitulo}</p>
                <Link to={curso.link}>Saiba mais!</Link>
              </div>
            ))}
          </div>
        <br/>

        <div className="projetos">          
            <h1>
              Projetos e<br />Oficina
            </h1>
            <Link to="/projetos&oficinas" className="link-proj">Ver todos</Link>
          

        </div>
      </main>
      <Footer />
    </div>
  );
}

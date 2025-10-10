import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import "./style.css";

export default function DetalhesCurso() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        
        const { data: cursoData } = await axios.get(`http://localhost:5000/api/cursos/${id}`);
        setCurso(cursoData);

        
        const { data: equipeData } = await axios.get("http://localhost:5000/api/equipe");

        
        const docentesFiltrados = equipeData.filter((d) =>
          cursoData.corpoDocente.includes(d.nome)
        );
        setDocentes(docentesFiltrados);
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar curso ou corpo docente");
      }
    })();
  }, [id]);

  if (erro) return <p className="erro">{erro}</p>;
  if (!curso) return <p>Carregando informações...</p>;

  return (
    <div className="detalhes-curso-container">
      <Link to="/cursos-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      
      <div className="header-curso">
        <h1>{curso.nome}</h1>
        <p className="descricao">{curso.descricao}</p>
        <div className="detalhes-basicos">
          <p><strong>Característica:</strong> {curso.caracteristica}</p>
          <p><strong>Duração:</strong> {curso.duracao}</p>
          <p><strong>Tipo:</strong> {curso.tipo}</p>
        </div>
        <Link to={curso.linkInscricao} target="_blank" className="btn-inscricao">
          Inscreva-se
        </Link>
      </div>

      
      <section>
        <h2>Por que fazer {curso.nome}?</h2>
        <p>{curso.porqueFazer}</p>
      </section>

      <section>
        <h2>Por que escolher {curso.nome} no Instituto?</h2>
        <p>{curso.porqueEscolher}</p>
      </section>

      <section>
        <h2>O que vai aprender</h2>
        <p>{curso.oqueAprender}</p>
        {curso.matrizLink && (
          <Link to={curso.matrizLink} target="_blank" className="link-matriz">
            Ver Matriz Curricular
          </Link>
        )}
      </section>

      <section>
        <h2>Oportunidades</h2>
        <p>{curso.oportunidades}</p>
      </section>

      
      <section>
        <h2>Corpo Docente</h2>

        {docentes.length === 0 ? (
          <p>Nenhum docente cadastrado para este curso.</p>
        ) : (
          <div className="grid-docentes">
            {docentes.map((d) => (
              <div key={d.id} className="docente-item">
                <div className="docente-foto">
                  <img src={d.foto} alt={d.nome} />
                </div>
                <p className="docente-nome">{d.nome}</p>
                <p className="docente-cargo">{d.cargo}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      
      <section>
        <h2>Espaço</h2>
        <div className="grid-imagens">
          {curso.imagens?.map((img, i) => (
            <img key={i} src={img.url} alt={`Imagem ${i + 1}`} />
          ))}
        </div>
      </section>

      
      <section className="contato-section">
        <div>
          <strong>Tem dúvidas ou precisa de mais informações?</strong>
          <p>Entre em contato com a gente!</p>
          <Link
            to="https://wa.me/5542999999999"
            target="_blank"
            className="btn-whats"
          >
            Enviar WhatsApp
          </Link>
        </div>
        <img
          src="/src/assets/site/Beautiful My Photos.jpg"
          alt="Contato"
          className="contato-img"
        />
      </section>
    </div>
  );
}

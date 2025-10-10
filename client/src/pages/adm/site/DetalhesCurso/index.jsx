import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import "./style.css";
import { MdOutlineStarBorder } from "react-icons/md";
import { IoSchoolSharp } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { IoIosSunny } from "react-icons/io";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { BsFillCloudSunFill } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import CorpoDocenteSlider from "./CorpoDocenteSlider";


export default function DetalhesCurso() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [erro, setErro] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("porqueFazer");

  const abas = [
    { key: "porqueFazer", label: "Por que Fazer" },
    { key: "porqueEscolher", label: "Por que Escolher" },
    { key: "oqueAprender", label: "O que Vai Aprender" },
    { key: "oportunidades", label: "Oportunidades" },
  ];

  
  

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
    <div className="container-cursos">
      <Link to="/cursos-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      
      <div className="header-curso">
        <div className="titulo-curso">
            <div>
                <h1>{curso.nome}</h1>
                <p className="descricao">{curso.descricao}</p>
            </div>
            
            <div className="detalhes-basicos">
                <p><strong><IoSchoolSharp /> Característica:</strong> <br/>{curso.caracteristica}</p>
                <p><strong><FaRegClock /> Duração:</strong><br/> {curso.duracao}</p>
                <p><strong><IoIosSunny /> Tipo:</strong> <br/>{curso.tipo}</p>
            </div>
        </div>
        <br/>
        <Link to={curso.linkInscricao} target="_blank" className="btn-inscricao-curso">
          INSCREVA-SE
        </Link>
      </div>

      
      <section className="tabs-section">
      <div className="tabs-header">
        {abas.map((aba) => (
          <button
            key={aba.key}
            className={`tab-btn ${abaAtiva === aba.key ? "ativa" : ""}`}
            onClick={() => setAbaAtiva(aba.key)}
          >
            <MdOutlineStarBorder />
            {aba.label}
          </button>
        ))}
      </div>

      <div className="tabs-content">
        {abaAtiva === "porqueFazer" && (
          <div>
            <h2>Por que fazer {curso.nome}?</h2>
            <p>{curso.porqueFazer}</p>
          </div>
        )}
        {abaAtiva === "porqueEscolher" && (
          <div>
            <h2>Por que escolher {curso.nome} no Instituto?</h2>
            <p>{curso.porqueEscolher}</p>
          </div>
        )}
        {abaAtiva === "oqueAprender" && (
          <div>
            <h2>O que vai aprender</h2>
            <p>{curso.oqueAprender}</p>
            {curso.matrizLink && (
              <Link
                to={curso.matrizLink}
                target="_blank"
                className="btn-matriz-curso"
              >
                Ver Matriz Curricular
              </Link>
            )}
          </div>
        )}
        {abaAtiva === "oportunidades" && (
          <div>
            <h2>Oportunidades</h2>
            <p>{curso.oportunidades}</p>
          </div>
        )}
      </div>
    </section>    

      
      <CorpoDocenteSlider docentes={docentes} />

      
      <section>
        <h2>Espaço</h2>
        <FaArrowLeft />
        <div className="grid-imagens">
          {curso.imagens?.map((img, i) => (
            <img key={i} src={img.url} alt={`Imagem ${i + 1}`} />
          ))}
        </div>
        <FaArrowRight />
      </section>

      
      <section className="contato-section">
        <div>
          <strong>Tem dúvidas ou precisa de mais informações?</strong>
          <p>Entre em contato com a gente!</p>
          <Link
            to="https://api.whatsapp.com/send/?phone=5542984055914&text&type=phone_number&app_absent=0"
            target="_blank"
            className="btn-whats"
          >
            <FaWhatsapp /> Enviar WhatsApp
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


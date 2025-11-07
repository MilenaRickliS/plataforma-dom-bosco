import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { FaSearch, FaVideo, FaTasks, FaUsers, FaBell, FaBookOpen, FaFolderOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";

export default function GlobalSearch() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.length > 2 && user?.uid) {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/api/search`, {
            params: { q: query, usuarioId: user.uid },
          });
          setResults(res.data.results || []);
          setShow(true);
        } catch (err) {
          console.error("Erro na busca:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setShow(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, user]);

  function getIcon(tipo) {
    switch (tipo) {
      case "turmas":
        return <FaUsers className="icon tipo-turmas" />;
      case "videos":
        return <FaVideo className="icon tipo-videos" />;
      case "tarefas":
        return <FaTasks className="icon tipo-tarefas" />;
      case "avisos":
        return <FaBell className="icon tipo-avisos" />;
      case "atividades":
        return <FaBookOpen className="icon tipo-atividades" />;
      case "usuarios":
        return <FaUsers className="icon tipo-usuarios" />;
      case "categorias_videos":
        return <FaFolderOpen className="icon tipo-categorias" />;
      default:
        return <FaSearch className="icon" />;
    }
  }

  return (
    <div className="global-search-container">
      <div className="global-search-box">
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar em toda a plataforma..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
        />
      </div>

      {show && (
        <div className="global-search-results fade-in">
          {loading ? (
            <p className="loading">🔍 Buscando...</p>
          ) : results.length === 0 ? (
            <p className="no-results">Nenhum resultado encontrado.</p>
          ) : (
            results.map((item) => (
              <Link
                key={`${item.tipo}-${item.id}`}
                to={getLink(item, user)}
                className={`search-item tipo-${item.tipo}`}
              >
                {getIcon(item.tipo)}
                <div className="info">
                  <p className="titulo">{item.titulo || item.nome || item.descricao || "Sem título"}</p>
                  <span className="tipo">{item.tipo}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function getLink(item, user) {
  const prefix = user?.role === "aluno" ? "/aluno" : "/professor";

  switch (item.tipo) {
    
    case "turmas":
      return `${prefix}/turma/${item.id}`;
    case "videos":
    case "upload":
    return `${prefix}/videos/${item.id}`;
    case "categorias_videos":
      return `${prefix}/videos`;
    case "atividades":
    case "atividade":
    case "avaliacao":
    case "conteudo":
      return `${prefix}/detalhes-ativ/${item.id}`;

    case "tarefas":
      return `${prefix}/agenda`;
    case "avisos":
      return `${prefix}/avisos`;
    case "usuarios":
      return user?.role === "professor"
        ? `${prefix}/alunos-turma/${item.id}`
        : `${prefix}/perfil`;
    default:
      return `${prefix}/inicio`;
  }
}

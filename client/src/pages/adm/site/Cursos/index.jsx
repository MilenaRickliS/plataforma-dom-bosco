import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import Toast from "../../../../components/Toast";
import "./style.css";
import { MdOutlineEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

export default function CursosGestao() {
  const [cursos, setCursos] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "sucesso" });
  const navigate = useNavigate();

  const fetchCursos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/cursos");
      setCursos(data);
    } catch (e) {
      setToast({ message: "Erro ao carregar cursos", type: "erro" });
    }
  };

  useEffect(() => { fetchCursos(); }, []);

  const excluir = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/cursos/${id}`);
      setToast({ message: "Curso excluído com sucesso!", type: "sucesso" });
      setCursos((prev) => prev.filter((c) => c.id !== id));
      fetchCursos();
    } catch {
      setToast({ message: "Erro ao excluir curso", type: "erro" });
    }
  };

  return (
    <div className="container-cursos">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "" })} />
      <Link to="/menu-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      <div className="inicio-cursos">
        <br/><h1>Cursos</h1>
        <Link to="/criar-curso" className="adicionar-curso">+ Adicionar Curso</Link>
      </div>

      <div className="lista-cursos">
        {cursos.map((curso) => (
          <div key={curso.id} className="curso-card">
            {curso.imagens?.[0]?.url && (
              <img className="thumb" src={curso.imagens[0].url} alt={curso.nome} />
            )}
            <div className="curso-card-body">
              <h3>{curso.nome}</h3>
              <p>{curso.descricao?.slice(0, 180)}{(curso.descricao || "").length > 180 ? "..." : ""}</p>
              <div className="tags">
                <span className="badge">{curso.tipo}</span>
                <span className="badge">{curso.duracao}</span>
              </div>
              
              <Link to={`/detalhes-curso-gestao/${curso.id}`} className="ver-detalhes-cursos">Ver Detalhes</Link>
              <div className="acoes-curso">
                <button onClick={() => navigate(`/editar-curso/${curso.id}`)}><MdOutlineEdit /> Editar</button>
                <button className="danger" onClick={() => excluir(curso.id)}><FaRegTrashAlt /> Excluir</button>
              </div>  
            </div>
          </div>
        ))}
        {cursos.length === 0 && <p>Nenhum curso cadastrado ainda.</p>}
      </div>
    </div>
  );
}

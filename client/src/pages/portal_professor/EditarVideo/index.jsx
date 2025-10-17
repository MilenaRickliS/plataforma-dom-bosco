import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";

export default function EditarVideo() {
  const API = import.meta.env.VITE_API_URL || 
    "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [video, setVideo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const carregarVideo = async () => {
      try {
        const { data } = await axios.get(`${API}/api/videos/${id}`);
        setVideo(data);
        setTitulo(data.titulo);
        setDescricao(data.descricao);
        setCategoria(data.categoria);
      } catch (err) {
        toast.error("Erro ao carregar vídeo.");
      }
    };
    carregarVideo();

    const carregarCategorias = async () => {
      const { data } = await axios.get(`${API}/api/videos/categorias`);
      setCategorias(data);
    };
    carregarCategorias();
  }, [id]);

  const validarDados = () => {
    const regexTitulo = /^[A-Za-zÀ-ÿ0-9\s]+$/;

    
    const palavras = descricao.trim().split(/\s+/).filter(Boolean);
    const wordCount = palavras.length;

    if (!titulo.trim()) {
        toast.error("O título não pode ser vazio.");
        return false;
    }

    if (!regexTitulo.test(titulo.trim())) {
        toast.error("O título só pode conter letras, números e acentos.");
        return false;
    }

    if (!descricao.trim()) {
        toast.error("A descrição não pode ser vazia.");
        return false;
    }

    if (wordCount < 15) {
        toast.error("A descrição deve conter no mínimo 15 palavras.");
        return false;
    }

    if (!categoria.trim()) {
        toast.error("Escolha uma categoria.");
        return false;
    }

    return true;
    };


  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!validarDados()) return;

    try {
      await axios.put(`${API}/api/videos`, {
        id,
        titulo,
        descricao,
        categoria,
        usuario: user?.email,
      });

      toast.success("Vídeo atualizado com sucesso!");
      navigate(`/professor/videos/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao salvar alterações.");
    }
  };

  if (!video) return <p>Carregando...</p>;

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main className="editar-video">
          <MenuTopoProfessor />
          <h2 className="titulo-editar-video">Editar Vídeo</h2>

          <form onSubmit={handleSalvar} className="form-editar-video">
            <label>Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />

            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <small style={{
            color: descricao.trim().split(/\s+/).filter(Boolean).length < 15 ? "red" : "green",
            display: "block",
            marginTop: "4px",
            }}>
            {descricao.trim().split(/\s+/).filter(Boolean).length} palavras (mínimo: 15)
            </small>


            <label>Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="select-usuarios"
            >
              <option value="">Selecione...</option>
              {categorias.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-salvar-foto">
              Salvar Alterações
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

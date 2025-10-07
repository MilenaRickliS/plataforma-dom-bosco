import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import { FiUpload } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";
import "./style.css";


// falta estilizar o calendario


export default function ComunidadeGestao() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataProjeto, setDataProjeto] = useState("");
  const [imagem, setImagem] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [preview, setPreview] = useState(null);
  const [abertos, setAbertos] = useState({});
  const [toast, setToast] = useState(null);

  
  const fetchProjetos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projetos");
      setProjetos(res.data);
    } catch (err) {
      showToast("Erro ao carregar projetos!", "erro");
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  
  const showToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  
  const validarFormulario = () => {
    const tituloRegex = /^[A-Za-zÀ-ÿ0-9\s.,!?'"-]+$/;
    if (!titulo.trim() || !descricao.trim() || !dataProjeto) {
      showToast("Preencha todos os campos!", "erro");
      return false;
    }
    if (!tituloRegex.test(titulo)) {
      showToast("O título só pode conter letras, números e acentos.", "erro");
      return false;
    }
    const palavras = descricao.trim().split(/\s+/);
    if (palavras.length < 50) {
      showToast("A descrição deve conter pelo menos 50 palavras.", "erro");
      return false;
    }
    if (!dataProjeto) {
      showToast("Selecione a data do projeto!", "erro");
      return false;
    }

    const hoje = new Date();
    if (new Date(dataProjeto) > hoje) {
      showToast("A data do projeto não pode ser no futuro.", "erro");
      return false;
    }
    if (!editando && !imagem) {
      showToast("Selecione uma imagem para o projeto!", "erro");
      return false;
    }
    return true;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("dataProjeto", dataProjeto);
    if (imagem) formData.append("imagem", imagem);

    try {
      if (editando) {
        await axios.put(`http://localhost:5000/api/projetos/${editando}`, formData);
        showToast("Projeto atualizado com sucesso!");
      } else {
        await axios.post("http://localhost:5000/api/projetos", formData);
        showToast("Projeto adicionado com sucesso!");
      }
      setTitulo("");
      setDescricao("");
      setImagem(null);
      setPreview(null);
      setDataProjeto("");
      setEditando(null);
      fetchProjetos();
    } catch (err) {
      showToast("Erro ao salvar projeto!", "erro");
    }
  };

  const handleEdit = (projeto) => {
    setEditando(projeto.id);
    setTitulo(projeto.titulo);
    setDescricao(projeto.descricao);
    if (projeto.dataProjeto) {
    const dataFormatada = new Date(projeto.dataProjeto)
      .toISOString()
      .split("T")[0]; 
    setDataProjeto(dataFormatada);
  } else {
    setDataProjeto("");
  }
    setPreview(projeto.imagemUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este projeto?")) {
      try {
        await axios.delete(`http://localhost:5000/api/projetos/${id}`);
        showToast("Projeto excluído com sucesso!");
        fetchProjetos();
      } catch (err) {
        showToast("Erro ao excluir projeto!", "erro");
      }
    }
  };

  const toggleDescricao = (id) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="comunidade-gestao-page">
      <Link to="/menu-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      <div className="container-gestao-projetos">
        <h1>Projetos sociais e voluntariado</h1>

        <form onSubmit={handleSubmit} className="form-projeto">
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="Descrição detalhada (mínimo 50 palavras)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <div className="input-data-wrapper">
            <input
              type="date"
              value={dataProjeto}
              onChange={(e) => setDataProjeto(e.target.value)}
              required
              
            />
            <span className="icon-calendario">
              <FaRegCalendarAlt />
            </span>
          </div>

          <label htmlFor="file-upload" className="projeto-label">
            <FiUpload size={20} />
            {imagem ? imagem.name : "Escolher imagem"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />

          {preview && <img src={preview} alt="Pré-visualização" className="preview-img" />}

          <button type="submit">
            {editando ? "Atualizar projeto" : "Salvar projeto"}
          </button>
        </form>

        <div className="grid-projetos-gestao">
          {projetos.map((p) => (
            <div key={p.id} className="card-projeto-gestao">
              <img src={p.imagemUrl} alt={p.titulo} />
              <h3>{p.titulo}</h3>
              <small className="data-projeto">
                Realizado em {new Date(p.dataProjeto).toLocaleDateString("pt-BR")}
              </small>
              <p>
                {abertos[p.id]
                  ? p.descricao
                  : p.descricao.length > 100
                  ? p.descricao.substring(0, 100) + "..."
                  : p.descricao}
              </p>

              {p.descricao.length > 100 && (
                <button
                  onClick={() => toggleDescricao(p.id)}
                  className="btn-lermais"
                >
                  {abertos[p.id] ? "Mostrar menos" : "Ler mais"}
                </button>
              )}

              <div className="acoes">
                <button onClick={() => handleEdit(p)} className="btn-editar">
                  <MdModeEditOutline /> Editar
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn-excluir">
                  <IoMdTrash /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.tipo}`}>
          {toast.mensagem}
        </div>
      )}
    </div>
  );
}

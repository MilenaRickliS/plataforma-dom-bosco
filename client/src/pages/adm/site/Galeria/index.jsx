import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FiUpload } from "react-icons/fi";
import axios from "axios";
import "./style.css";
import { MdModeEditOutline } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";

export default function GaleriaGestao() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [fotos, setFotos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editando, setEditando] = useState(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [toast, setToast] = useState(null); 

  const fetchFotos = async () => {
    const res = await axios.get(`${API}/api/galeria`);
    const imagensOrdenadas = res.data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setFotos(imagensOrdenadas);
  };

  useEffect(() => {
    fetchFotos();
  }, []);

  
  const showToast = (mensagem, tipo = "sucesso") => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
      
    if (!titulo.trim() || !imagem) {
      showToast("Preencha todos os campos!", "erro");
      return;
    }

    
    const tituloRegex = /^[A-Za-zÀ-ÿ0-9\s.,!?'"-]+$/;
    if (!tituloRegex.test(titulo)) {
      showToast("O título só pode conter letras, números e acentos.", "erro");
      return;
    }

    
    if (titulo.length < 3) {
      showToast("O título deve ter pelo menos 3 caracteres.", "erro");
      return;
    }

    if (titulo.length > 100) {
      showToast("O título não pode ultrapassar 100 caracteres.", "erro");
      return;
    }

    
    const formData = new FormData();
    formData.append("image", imagem);
    formData.append("title", titulo);

    try {
      await axios.post(`${API}/api/galeria`, formData);
      setTitulo("");
      setImagem(null);
      setPreview(null);
      fetchFotos();
      showToast("Imagem adicionada com sucesso! ✅");
    } catch (err) {
      console.error(err);
      showToast("Erro ao enviar imagem ❌", "erro");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/galeria/${id}`);
      fetchFotos();
      showToast("Imagem excluída! 🗑️");
    } catch {
      showToast("Erro ao excluir imagem ❌", "erro");
    }
  };

  const handleEdit = async (id) => {
    if (!novoTitulo.trim()) {
      showToast("O título não pode ficar vazio!", "erro");
      return;
    }

    const tituloRegex = /^[A-Za-zÀ-ÿ0-9\s.,!?'"-]+$/;
    if (!tituloRegex.test(novoTitulo)) {
      showToast("O título só pode conter letras, números e acentos.", "erro");
      return;
    }

    try {
      await axios.put(`${API}/api/galeria/${id}`, { title: novoTitulo });
      setEditando(null);
      fetchFotos();
      showToast("Título atualizado! ✏️");
    } catch {
      showToast("Erro ao editar imagem ❌", "erro");
    }
  };


  return (
    <div className="galeria-gestao-page">
      
      {toast && <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>}

      <Link to="/menu-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      <div className="container-gestao">
        <h1 className="h1-galeria">Gerenciar Galeria</h1>

        
        <form className="upload-form" onSubmit={handleUpload}>
          <input
            type="text"
            placeholder="Título da imagem"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          
          <label htmlFor="file-upload" className="upload-label">
            <FiUpload size={20} />
            {imagem ? imagem.name : "Escolher foto"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button type="submit">Adicionar Foto</button>
        </form>

        
        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Prévia" className="preview-img" />
          </div>
        )}
        <br/>
        
        <div className="lista-fotos">
          {fotos.map((foto) => (
            <div key={foto.id} className="foto-item">
              <img src={foto.imageUrl} alt={foto.title} />
              {editando === foto.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                  />
                  <button onClick={() => handleEdit(foto.id)}>Salvar</button>
                </div>
              ) : (
                <>
                  <p>{foto.title}</p>
                  <div className="botoes">
                    <button
                      onClick={() => {
                        setEditando(foto.id);
                        setNovoTitulo(foto.title);
                      }}
                    >
                      <MdModeEditOutline /> Editar
                    </button>
                    <button onClick={() => handleDelete(foto.id)}><IoMdTrash /> Excluir</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

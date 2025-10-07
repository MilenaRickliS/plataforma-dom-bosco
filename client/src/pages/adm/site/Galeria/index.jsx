import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import './style.css';

export default function GaleriaGestao() {
  const [fotos, setFotos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [editando, setEditando] = useState(null);
  const [novoTitulo, setNovoTitulo] = useState("");

  const fetchFotos = async () => {
    const res = await axios.get("http://localhost:5000/api/galeria");
    setFotos(res.data);
  };

  useEffect(() => {
    fetchFotos();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imagem || !titulo) return alert("Preencha todos os campos!");

    const formData = new FormData();
    formData.append("image", imagem);
    formData.append("title", titulo);

    await axios.post("http://localhost:5000/api/galeria", formData);
    setTitulo("");
    setImagem(null);
    fetchFotos();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/galeria/${id}`);
    fetchFotos();
  };

  const handleEdit = async (id) => {
    await axios.put(`http://localhost:5000/api/galeria/${id}`, { title: novoTitulo });
    setEditando(null);
    fetchFotos();
  };

  return (
    <div className="galeria-gestao-page">
      <br/>
      <Link to="/menu-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>

      <div className="container-gestao">
        <h1 className="h1-galeria">Gerenciar Galeria</h1>

        <form className="upload-form" onSubmit={handleUpload}>
          <input 
            type="text"
            placeholder="Título da imagem"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input 
            type="file"
            accept="image/*"
            onChange={(e) => setImagem(e.target.files[0])}
          />
          <button type="submit">Adicionar Foto</button>
        </form>

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
                    <button onClick={() => { setEditando(foto.id); setNovoTitulo(foto.title); }}>Editar</button>
                    <button onClick={() => handleDelete(foto.id)}>Excluir</button>
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
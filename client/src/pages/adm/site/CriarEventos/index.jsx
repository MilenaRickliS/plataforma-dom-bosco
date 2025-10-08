import { useState, useEffect } from "react";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useSearchParams } from "react-router-dom";
import "./style.css";
import { FiUpload } from "react-icons/fi";

export default function CriarEventoGestao() {
  const [form, setForm] = useState({
    titulo: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    temInscricao: false,
    linkInscricao: "",
    descricao: "",
    dataHora: "",
  });
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [params] = useSearchParams();
  const id = params.get("id");

  useEffect(() => {
    if (id) {
      axios.get("http://localhost:5000/api/eventos").then((res) => {
        const evento = res.data.find((e) => e.id === id);
        if (evento) {
          setForm({
            ...evento,
            dataHora: new Date(evento.dataHora)
              .toISOString()
              .slice(0, 16),
          });
          setPreview(evento.imagemUrl);
        }
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (imagem) data.append("imagem", imagem);

    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/eventos/${id}`, form);
        setMensagem("Evento atualizado com sucesso!");
      } else {
        await axios.post("http://localhost:5000/api/eventos", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });

      }
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar evento!");
    }
  };

  return (
    <div className="criar-evento-container">
      <Link to="/eventos-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>
      <h1 className="h1-eventos">{id ? "Editar Evento" : "Criar Evento"}</h1>

      <form onSubmit={handleSubmit} className="form-evento">
        <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
        <label htmlFor="file-upload" className="upload-label-evento">
            <FiUpload size={20} />
            {imagem ? imagem.name : "Escolher foto"}
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }}/>
        {preview && <img src={preview} alt="Prévia" className="preview-img-evento" />}

        <input name="rua" placeholder="Rua" value={form.rua} onChange={handleChange} />
        <input name="numero" placeholder="Número" value={form.numero} onChange={handleChange} />
        <input name="bairro" placeholder="Bairro" value={form.bairro} onChange={handleChange} />
        <input name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} />
        <input name="estado" placeholder="Estado" value={form.estado} onChange={handleChange} />
        <input name="cep" placeholder="CEP" value={form.cep} onChange={handleChange} />

        <label className="tem-inscricao">
            <input type="checkbox" name="temInscricao" checked={form.temInscricao} onChange={handleChange} />
            <span className="slider"></span>
            <span className="label-text">Possui inscrição?</span>
        </label>


        {form.temInscricao && (
          <input
            name="linkInscricao"
            placeholder="Link da inscrição"
            value={form.linkInscricao}
            onChange={handleChange}
          />
        )}

        <textarea name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange}></textarea>
        <input type="datetime-local" name="dataHora" value={form.dataHora} onChange={handleChange} />

        <button className="button-criar-evento" type="submit">{id ? "Salvar Alterações" : "Criar Evento"}</button>
        {mensagem && <p className="mensagem">{mensagem}</p>}
      </form>
    </div>
  );
}

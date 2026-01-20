import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { toast } from "react-toastify";
import { TiUpload } from "react-icons/ti";
import { FaLink } from "react-icons/fa";
import "./style.css";
import "react-toastify/dist/ReactToastify.css";


export default function AddVideos() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";


  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [modo, setModo] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [preview, setPreview] = useState(null);
  const [duracao, setDuracao] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { user } = useContext(AuthContext);


  const regexTitulo = /^[A-Za-zÀ-ÿ0-9\s]+$/;
  const regexCategoria = /^[A-Za-zÀ-ÿ0-9\s-]+$/;

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const { data } = await axios.get(`${API}/api/videos/categorias`);
        setCategorias(Array.isArray(data) ? data : []);
      } catch {
        console.warn("Nenhuma categoria cadastrada ainda");
      }
    };
    carregarCategorias();
  }, []);

  const handleDescricaoChange = (e) => {
    const texto = e.target.value;
    setDescricao(texto);
    const palavras = texto.trim().split(/\s+/).filter(Boolean);
    setWordCount(palavras.length);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(url);
      const minutos = video.duration / 60;
      setDuracao(minutos.toFixed(1));
      if (minutos > 8) {
        setModo("link");
        toast.warning("Vídeo tem mais de 8 minutos. Envie o link do YouTube.");
      }
    };
    video.src = url;
  };

  const categoriaFinal = novaCategoria || categoria;

  const validarDados = () => {
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
    if (!categoriaFinal.trim()) {
      toast.error("Escolha ou crie uma categoria.");
      return false;
    }
    if (novaCategoria && !regexCategoria.test(novaCategoria.trim())) {
      toast.error(
        "A nova categoria só pode conter letras, números, acentos e hífen."
      );
      return false;
    }
    if (modo === "upload" && !videoFile) {
      toast.error("Selecione um vídeo antes de enviar.");
      return false;
    }
    if (modo === "link" && !videoLink.trim()) {
      toast.error("Informe o link do vídeo.");
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!validarDados()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("categoria", categoriaFinal);
    formData.append("usuario", user?.email || "desconhecido");


    try {
      await axios.post(`${API}/api/videos/upload`, formData);
      if (novaCategoria && !categorias.includes(novaCategoria)) {
        setCategorias([...categorias, novaCategoria]);
      }
      toast.success("Vídeo enviado com sucesso!");
      

      resetForm();
    } catch (err) {
      toast.error("Erro ao enviar vídeo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarLink = async (e) => {
    e.preventDefault();
    if (!validarDados()) return;

    try {
      const res = await axios.post(
        `${API}/api/videos/link`,
        {
          titulo,
          descricao,
          url: videoLink,
          categoria: categoriaFinal,
          usuario: user?.email || "desconhecido",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200) {        
        resetForm();
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Erro ao salvar link.");
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setVideoFile(null);
    setPreview(null);
    setNovaCategoria("");
    setCategoria("");
    setVideoLink("");
    setDuracao(0);
    setModo("upload");
    setWordCount(0);
  };

  return (
    <div className="layout">
      
      <MenuLateralProfessor />
      <div className="page2">
        <main className="add-videos">
          <MenuTopoProfessor />
          <h2 className="adicionar-video">Adicionar Vídeo</h2>

          <div className="modo-toggle">
            <button
              type="button"
              onClick={() => setModo("upload")}
              className={modo === "upload" ? "ativo" : ""}
            >
              <TiUpload /> Upload
            </button>
            <button
              type="button"
              onClick={() => setModo("link")}
              className={modo === "link" ? "ativo" : ""}
            >
              <FaLink /> Link
            </button>
          </div>

          <form
            onSubmit={modo === "upload" ? handleUpload : handleSalvarLink}
            className="form-videos"
          >
            <label>Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Título do vídeo"
            />

            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={handleDescricaoChange}
              placeholder="Descrição do vídeo"
            />
            <small
              style={{
                color: wordCount < 15 ? "red" : "green",
                display: "block",
                marginTop: "4px",
              }}
            >
              {wordCount} palavras {wordCount < 15 && "(mínimo: 15)"}
            </small>

            <label>Categoria</label>
            <select
              value={categoria || ""}
              onChange={(e) => setCategoria(e.target.value)}
              className="select-usuarios"
            >
              <option value="">Selecione...</option>
              {Array.isArray(categorias) &&
                categorias.map((cat, i) => {
                  const nome = typeof cat === "string" ? cat : cat.nome;
                  return (
                    <option key={i} value={nome}>
                      {nome}
                    </option>
                  );
                })}
            </select>

            <input
              type="text"
              placeholder="ou digite uma nova categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
            />

            {modo === "upload" ? (
              <>
                <label htmlFor="file-upload" className="upload-label-videos">
                  <TiUpload size={20} />{" "}
                  {videoFile
                    ? videoFile.name
                    : "Selecione o vídeo (até 8 minutos)"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  style={{ display: "none" }}
                />
                {preview && (
                  <video
                    src={preview}
                    controls
                    width="100%"
                    className="preview-video"
                  />
                )}
                {duracao > 0 && (
                  <p className="duracao">Duração detectada: {duracao} min</p>
                )}
              </>
            ) : (
              <>
                <label>Link do vídeo (YouTube, Drive...)</label>
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://youtu.be/..."
                  required
                />
              </>
            )}

            <button type="submit" disabled={loading} className="btn-salvar-foto">
              {loading ? "Enviando..." : "Salvar vídeo"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

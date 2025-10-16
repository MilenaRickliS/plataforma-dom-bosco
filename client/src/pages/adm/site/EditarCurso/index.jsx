import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Toast from "../../../../components/Toast";
import { IoIosArrowBack } from "react-icons/io";
import "./style.css";
import { FiUpload } from "react-icons/fi";

const countWords = (t = "") => t.trim().split(/\s+/).filter(Boolean).length;

export default function EditarCurso() {
  
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [imagensNovas, setImagensNovas] = useState([]);
  const [previewsNovas, setPreviewsNovas] = useState([]);
  const [removerPublicIds, setRemoverPublicIds] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "sucesso" });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [{ data: c }, { data: eq }] = await Promise.all([
          axios.get(`${API}/api/cursos/${id}`),
          axios.get(`${API}/api/equipe`),
        ]);
        setCurso(c);
        setDocentes(eq);
      } catch {
        setToast({ message: "Erro ao carregar curso/equipe", type: "erro" });
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurso((p) => ({ ...p, [name]: value }));
  };

  const addNewImgs = (e) => {
    const files = Array.from(e.target.files || []);
    const nomesExistentes = new Set(imagensNovas.map((f) => f.name));

    const novasValidas = files.filter((f) => !nomesExistentes.has(f.name));
    if (novasValidas.length < files.length) {
        setToast({ message: "Essa imagem já foi adicionada.", type: "erro" });
    }

    const total = (curso?.imagens?.length || 0) - removerPublicIds.length + novasValidas.length;
    if (total > 5) {
        setToast({ message: "Máximo total de 5 imagens.", type: "erro" });
        return;
    }

    setImagensNovas((prev) => [...prev, ...novasValidas]);
    setPreviewsNovas((prev) => [...prev, ...novasValidas.map((f) => URL.createObjectURL(f))]);
    };


  const removeExistingImg = (public_id) => {
    setRemoverPublicIds((prev) => [...prev, public_id]);
  };
  const undoRemoveExistingImg = (public_id) => {
    setRemoverPublicIds((prev) => prev.filter((p) => p !== public_id));
  };
  const removeNewPreview = (idx) => {
    setImagensNovas((prev) => prev.filter((_, i) => i !== idx));
    setPreviewsNovas((prev) => prev.filter((_, i) => i !== idx));
  };
  

  const salvar = async (e) => {
    e.preventDefault();
    const camposObrigatorios = [
        "nome",
        "descricao",
        "caracteristica",
        "duracao",
        "porqueFazer",
        "porqueEscolher",
        "oqueAprender",
        "oportunidades",
        ];

        for (const campo of camposObrigatorios) {
        if (!curso[campo] || curso[campo].trim() === "") {
            setToast({ message: `O campo "${campo}" não pode ficar vazio.`, type: "erro" });
            return;
        }
        }

        if ((curso.corpoDocente?.length || 0) < 3) {
        setToast({ message: "Selecione pelo menos 3 docentes.", type: "erro" });
        return;
        }

        const totalImagens = (curso.imagens?.length || 0) - removerPublicIds.length + imagensNovas.length;
        if (totalImagens > 5) {
        setToast({ message: "Máximo total de 5 imagens permitidas.", type: "erro" });
        return;
        }

    try {
      const data = new FormData();
      const payload = {
        nome: curso.nome,
        descricao: curso.descricao,
        caracteristica: curso.caracteristica,
        duracao: curso.duracao,
        tipo: curso.tipo,
        linkInscricao: curso.linkInscricao,
        porqueFazer: curso.porqueFazer,
        porqueEscolher: curso.porqueEscolher,
        oqueAprender: curso.oqueAprender,
        oportunidades: curso.oportunidades,
        corpoDocente: JSON.stringify(curso.corpoDocente || []),
        removeImagesPublicIds: JSON.stringify(removerPublicIds),
        matrizLink: curso.matrizLink,
      };
      Object.entries(payload).forEach(([k, v]) => data.append(k, v));
      imagensNovas.forEach((img) => data.append("imagens", img));
      


      await axios.put(`${API}/api/cursos/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({ message: "Curso atualizado!", type: "sucesso" });
      setTimeout(() => navigate("/cursos-gestao"), 600);
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0] || "Erro ao atualizar curso";
      setToast({ message: msg, type: "erro" });
    }
  };

  if (!curso) return null;

  return (
    <div className="criar-curso">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "" })} />
      <Link to="/cursos-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>
      <br/>
      <br/>
      <br/>
      <h1>Editar Curso</h1>

      <form onSubmit={salvar} className="form-curso">
        <input name="nome" value={curso.nome} onChange={handleChange} />
        <div className="descricao-container">
          <textarea name="descricao" value={curso.descricao} onChange={handleChange} />
          <span
            className={`contador-palavras ${
              countWords(curso.descricao) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(curso.descricao)} / 15 palavras
          </span>
        </div>

        <input name="caracteristica" value={curso.caracteristica} onChange={handleChange} />
        <input name="duracao" value={curso.duracao} onChange={handleChange} />
        <select name="tipo" value={curso.tipo} onChange={handleChange}>
          <option value="Diurno">Diurno</option>
          <option value="Noturno">Noturno</option>
          <option value="Integral">Integral</option>
        </select>
        <input name="linkInscricao" value={curso.linkInscricao} onChange={handleChange} />

        
        <div className="descricao-container">
          <textarea
            name="porqueFazer"
            value={curso.porqueFazer}
            onChange={handleChange}
            placeholder="Por que fazer?"
          />
          <span
            className={`contador-palavras ${
              countWords(curso.porqueFazer) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(curso.porqueFazer)} / 15 palavras
          </span>
        </div>

        <div className="descricao-container">
          <textarea
            name="porqueEscolher"
            value={curso.porqueEscolher}
            onChange={handleChange}
            placeholder="Por que escolher?"
          />
          <span
            className={`contador-palavras ${
              countWords(curso.porqueEscolher) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(curso.porqueEscolher)} / 15 palavras
          </span>
        </div>

        <div className="descricao-container">
          <textarea
            name="oqueAprender"
            value={curso.oqueAprender}
            onChange={handleChange}
            placeholder="O que vai aprender?"
          />
          <span
            className={`contador-palavras ${
              countWords(curso.oqueAprender) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(curso.oqueAprender)} / 15 palavras
          </span>
        </div>

        <div className="descricao-container">
          <textarea
            name="oportunidades"
            value={curso.oportunidades}
            onChange={handleChange}
            placeholder="Oportunidades"
          />
          <span
            className={`contador-palavras ${
              countWords(curso.oportunidades) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(curso.oportunidades)} / 15 palavras
          </span>
        </div>

        <label>Corpo docente (mín. 3):</label>
        <div className="checkbox-group-docentes">
          {docentes.map((doc) => (
            <label key={doc.id} className="checkbox-item">
              <input
                type="checkbox"
                value={doc.nome}
                checked={curso.corpoDocente?.includes(doc.nome) || false}
                onChange={(e) => {
                  const { value, checked } = e.target;
                  setCurso((prev) => {
                    const atual = new Set(prev.corpoDocente || []);
                    if (checked) atual.add(value);
                    else atual.delete(value);
                    return { ...prev, corpoDocente: Array.from(atual) };
                  });
                }}
              />
              <span className="checkbox-label">{doc.nome}</span>
            </label>
          ))}
        </div>

        <p className="contador-docentes">
          Selecionados: {curso.corpoDocente?.length || 0} / mínimo 3
        </p>

        
        <div className="imagens-existentes">
          <p>Imagens atuais:</p>
          <div className="grid-previews">
            {(curso.imagens || []).map((img) => {
              const marcado = removerPublicIds.includes(img.public_id);
              return (
                <div className={`preview-item ${marcado ? "removida" : ""}`} key={img.public_id}>
                  <img src={img.url} />
                  {!marcado ? (
                    <button type="button" onClick={() => removeExistingImg(img.public_id)}>
                      Remover
                    </button>
                  ) : (
                    <button type="button" onClick={() => undoRemoveExistingImg(img.public_id)}>
                      Desfazer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
                
        <label>Adicionar novas imagens (máx. total 5):</label>
        <label htmlFor="file-upload" className="upload-label-curso">
                  <FiUpload size={20} />
                  Selecionar fotos
        </label>
        <input id="file-upload" type="file" accept="image/*" multiple onChange={addNewImgs} style={{ display: "none" }}/>
        {previewsNovas.length > 0 && (
          <div className="grid-previews">
            {previewsNovas.map((src, i) => (
              <div className="preview-item" key={i}>
                <img src={src} />
                <button type="button" onClick={() => removeNewPreview(i)}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        
        <label>Link da Matriz Curricular — opcional</label>
        <input
            name="matrizLink"
            value={curso.matrizLink || ""}
            onChange={handleChange}
        />



        <button type="submit" className="btn-salvar-curso">
          Salvar alterações
        </button>
      </form>
    </div>
  );
}

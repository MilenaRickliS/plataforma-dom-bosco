import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import Toast from "../../../../components/Toast";
import "./style.css";

const REGEX_ALFA_NUM_COM_ACENTO = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,;:()\-_/&+ºª°'"!?]+$/u;
const REGEX_SO_LETRAS_COM_ACENTO = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u;

const countWords = (t = "") => t.trim().split(/\s+/).filter(Boolean).length;

export default function CriarCurso() {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    caracteristica: "",
    duracao: "",
    tipo: "",
    linkInscricao: "",
    porqueFazer: "",
    porqueEscolher: "",
    oqueAprender: "",
    oportunidades: "",
    corpoDocente: [],
    matrizLink: "",
  });
  const [docentes, setDocentes] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "sucesso" });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/equipe")
      .then(res => setDocentes(res.data))
      .catch(() => setToast({ message: "Erro ao carregar equipe", type: "erro" }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onChangeDocentes = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm((p) => ({ ...p, corpoDocente: selected }));
  };

  const handleImgs = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

  
    const novas = files.filter(
      (file) =>
        !imagens.some(
          (img) => img.name === file.name && img.size === file.size
        )
    );

    if (novas.length === 0) {
      setToast({ message: "Essas imagens já foram adicionadas.", type: "erro" });
      return;
    }

    const total = novas.length + imagens.length;
    if (total > 5) {
      setToast({ message: "Máximo de 5 imagens permitidas.", type: "erro" });
      return;
    }

    setImagens((prev) => [...prev, ...novas]);
    const newPreviews = novas.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };


  const removePreview = (idx) => {
    setImagens((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

    
  const validateFront = () => {
    const errors = [];
    if (!form.nome.trim() || !REGEX_ALFA_NUM_COM_ACENTO.test(form.nome)) {
      errors.push("Nome inválido (letras, números e acentos).");
    }
    if (countWords(form.descricao) < 15) errors.push("Descrição: mínimo 15 palavras.");
    if (!REGEX_SO_LETRAS_COM_ACENTO.test(form.caracteristica || "")) {
      errors.push("Característica: apenas letras e acentos.");
    }
    if (!REGEX_ALFA_NUM_COM_ACENTO.test(form.duracao || "")) {
      errors.push("Duração: letras, números e acentos.");
    }
    if (!form.tipo) errors.push("Selecione o tipo.");
    if (!form.linkInscricao.trim()) errors.push("Link de inscrição não pode ser vazio.");
    const textosMin = ["porqueFazer", "porqueEscolher", "oqueAprender", "oportunidades"];
    textosMin.forEach(k => {
      if (countWords(form[k]) < 15) errors.push(`${k}: mínimo 15 palavras.`);
    });
    if (!Array.isArray(form.corpoDocente) || form.corpoDocente.length < 3) {
      errors.push("Selecione no mínimo 3 docentes.");
    }
    if (imagens.length === 0) errors.push("Envie pelo menos 1 imagem.");
    if (imagens.length > 5) errors.push("Máximo de 5 imagens.");
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateFront();
    if (errs.length) {
      setToast({ message: errs[0], type: "erro" });
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) data.append(k, JSON.stringify(v));
      else data.append(k, v);
    });
    imagens.forEach((img) => data.append("imagens", img));

    try {
      await axios.post("http://localhost:5000/api/cursos", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({ message: "Curso criado com sucesso!", type: "sucesso" });
      setTimeout(() => navigate("/cursos-gestao"), 600);
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.error ||
        "Erro ao criar curso.";
      setToast({ message: msg, type: "erro" });
    }
  };

  return (
    <div className="criar-curso">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "" })} />

      <Link to="/cursos-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>

      <h1>Novo Curso</h1>
      <form onSubmit={handleSubmit} className="form-curso">
        <input type="text" name="nome" placeholder="Nome do curso" onChange={handleChange} required />
       
        <div className="descricao-container">
          <textarea name="descricao" placeholder="Descrição (mín. 15 palavras)" onChange={handleChange} required  />
          <span
            className={`contador-palavras ${
              countWords(form.descricao) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(form.descricao)} / 15 palavras
          </span>
        </div>

        <input type="text" name="caracteristica" placeholder="Característica" onChange={handleChange} required />
        <input type="text" name="duracao" placeholder="Duração" onChange={handleChange} required />

        <select name="tipo" onChange={handleChange} required>
          <option value="">Selecione o tipo</option>
          <option value="Diurno">Diurno</option>
          <option value="Noturno">Noturno</option>
          <option value="Integral">Integral</option>
        </select>

        <input type="url" name="linkInscricao" placeholder="Link de inscrição" onChange={handleChange} required />
         <div className="descricao-container">
          <textarea
            name="porqueFazer"
            placeholder="Por que fazer? (mín. 15 palavras)" onChange={handleChange} required 
          />
          <span
            className={`contador-palavras ${
              countWords(form.porqueFazer) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(form.porqueFazer)} / 15 palavras
          </span>
        </div>  

        <div className="descricao-container">
          <textarea
            name="porqueEscolher" placeholder="Por que escolher este curso? (mín. 15 palavras)" onChange={handleChange} required 
          />
          <span
            className={`contador-palavras ${
              countWords(form.porqueFazer) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(form.porqueFazer)} / 15 palavras
          </span>
        </div>  

        <div className="descricao-container">
          <textarea
            name="oqueAprender" placeholder="O que vai aprender? (mín. 15 palavras)" onChange={handleChange} required 
          />
          <span
            className={`contador-palavras ${
              countWords(form.porqueFazer) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(form.porqueFazer)} / 15 palavras
          </span>
        </div>  

        <div className="descricao-container">
          <textarea
            name="oportunidades" placeholder="Oportunidades (mín. 15 palavras)" onChange={handleChange} required 
          />
          <span
            className={`contador-palavras ${
              countWords(form.porqueFazer) < 15 ? "incompleto" : "ok"
            }`}
          >
            {countWords(form.porqueFazer)} / 15 palavras
          </span>
        </div>       
    

        <label>Corpo docente (mín. 3):</label>
        <div className="checkbox-group-docentes">
          {docentes.map((doc) => (
            <label key={doc.id} className="checkbox-item">
              <input
                type="checkbox"
                value={doc.nome}
                checked={form.corpoDocente.includes(doc.nome)}
                onChange={(e) => {
                  const { value, checked } = e.target;
                  setForm((prev) => {
                    const atual = new Set(prev.corpoDocente);
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



        <label>Imagens do curso (máx. 5):</label>
        <input type="file" multiple accept="image/*" onChange={handleImgs} />

        {previews.length > 0 && (
          <div className="grid-previews">
            {previews.map((src, idx) => (
              <div className="preview-item" key={idx}>
                <img src={src} alt={`preview-${idx}`} />
                <button type="button" onClick={() => removePreview(idx)}>Remover</button>
              </div>
            ))}
          </div>
        )}

        
        <label>Link da Matriz Curricular (Google Drive ou outro) — opcional</label>
        <input
          type="url"
          name="matrizLink"
          placeholder="Ex: https://drive.google.com/file/d/..."
          onChange={handleChange}
        />


        <button type="submit" className="btn-salvar">Salvar Curso</button>
      </form>
    </div>
  );
}

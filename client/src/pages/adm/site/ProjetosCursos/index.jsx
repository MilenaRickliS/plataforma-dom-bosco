import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import { FiUpload } from "react-icons/fi";
import { FaRegCalendarAlt, FaSearch } from "react-icons/fa";
import "./style.css";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";

export default function ProjetosCursosGestao() {
  
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataProjeto, setDataProjeto] = useState("");
  const [curso, setCurso] = useState("");
  const [imagem, setImagem] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [preview, setPreview] = useState(null);
  const [abertos, setAbertos] = useState({});
  const [toast, setToast] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [contagemPalavras, setContagemPalavras] = useState(0);


  const fetchProjetosCursos = async () => {
    try {
      const res = await axios.get(`${API}/api/oficinas`);
      const ordenados = res.data.sort(
        (a, b) => new Date(b.dataProjeto) - new Date(a.dataProjeto)
      );
      setProjetos(ordenados);
    } catch (err) {
      showToast("Erro ao carregar projetos!", "erro");
    }
  };

  useEffect(() => {
    fetchProjetosCursos();
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
    if (!titulo.trim() || !descricao.trim() || !curso.trim() || !dataProjeto) {
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
    formData.append("curso", curso);
    if (imagem) formData.append("imagem", imagem);

    try {
      if (editando) {
        await axios.put(`${API}/api/oficinas/${editando}`, formData);
        showToast("Projeto atualizado com sucesso!");
      } else {
        await axios.post(`${API}/api/oficinas`, formData);
        showToast("Projeto adicionado com sucesso!");
      }
      setTitulo("");
      setDescricao("");
      setCurso("");
      setImagem(null);
      setPreview(null);
      setDataProjeto("");
      setEditando(null);
      fetchProjetosCursos();
    } catch (err) {
      showToast("Erro ao salvar projeto!", "erro");
    }
  };

  const handleEdit = (projeto) => {
    setEditando(projeto.id);
    setTitulo(projeto.titulo);
    setDescricao(projeto.descricao);
    setCurso(projeto.curso);
    setDataProjeto(projeto.dataProjeto ? new Date(projeto.dataProjeto) : "");
    setPreview(projeto.imagemUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este projeto?")) {
      try {
        await axios.delete(`${API}/api/oficinas/${id}`);
        showToast("Projeto excluído com sucesso!");
        fetchProjetosCursos();
      } catch (err) {
        showToast("Erro ao excluir projeto!", "erro");
      }
    }
  };

  const toggleDescricao = (id) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  
  const projetosFiltrados = projetos.filter((p) => {
    const tituloMatch = p.titulo.toLowerCase().includes(filtro.toLowerCase());
    const cursoMatch = filtroCurso
  ? p.curso.trim().toLowerCase() === filtroCurso.trim().toLowerCase()
  : true;

    return tituloMatch && cursoMatch;
  });
    const getCursoCor = (curso) => {
    switch (curso) {
      case "Música":
        return "#2D408E"; 
      case "Esportes":
        return "#2D408E"; 
      case "Informática":
        return "#2D408E"; 
      case "Pré-aprendizagem":
        return "#2D408E"; 
      case "Jovem Aprendiz":
        return " #2D408E"; 
      default:
        return "#2D408E"; 
    }
  };




  return (
    <div className="comunidade-gestao-page">
        <br/>
        <Link to="/menu-gestao" className="voltar-para-menu"><IoIosArrowBack />Voltar</Link>
        <div className="container-gestao-projetos">
            <h1 className="h1-proj">Projetos e Oficina</h1>
            <form onSubmit={handleSubmit} className="form-projeto-curso">
              <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              
                <select
                  name="curso"
                  id="curso"
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)} 
                >
                  <option value="">Selecione um curso</option>
                  <option value="Música">Música</option>
                  <option value="Esportes">Esportes</option>
                  <option value="Informática">Informática</option>
                  <option value="Pré-aprendizagem">Pré-aprendizagem</option>
                  <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                </select>

            
              <textarea
                placeholder="Descrição detalhada (mínimo 50 palavras)"
                value={descricao}
                onChange={(e) => {
                  const texto = e.target.value;
                  setDescricao(texto);
                  const palavras = texto.trim().split(/\s+/).filter(Boolean);
                  setContagemPalavras(palavras.length);
                }}
              />

              <div className={`contador-palavras ${contagemPalavras < 50 ? "incompleto" : "ok"}`}>
                {contagemPalavras} / 50 palavras mínimas
              </div>
            
              <div className="campo-data-hora">
                  <FaRegCalendarAlt className="icone-calendario" />
                  <DatePicker
                    selected={dataProjeto}
                    onChange={(date) => setDataProjeto(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selecione a data do projeto"
                    locale={ptBR}
                    className="input-datepicker"
                  />
                </div>
            
                <label htmlFor="file-upload" className="projeto-curso-label">
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
            
                {preview && (
                  <img src={preview} alt="Pré-visualização" className="preview-img" />
                )}
            
                <button type="submit" className="button-salvar">
                  {editando ? "Atualizar projeto" : "Salvar projeto"}
                </button>
              </form>
            
                    
              <div className="filtros-gestao">
                <div className="input-wrapper">
                  <FaSearch className="icone-pesquisa" />
                  <input
                    type="text"
                    placeholder="Pesquisar projeto por nome..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="input-filtro-projetos"
                  />
                </div>
                <div className="select-wrapper">
                  <select
                  className="select-filtro-curso"
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
                  <option value="">Todos os cursos</option>
                  <option value="Música">Música</option>
                  <option value="Esportes">Esportes</option>
                  <option value="Informática">Informática</option>
                  <option value="Pré-aprendizagem">Pré-aprendizagem</option>
                  <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                </select>
                <IoIosArrowDown className="icone-select" />
                </div>
                
              </div>


        <div
          className={`grid-projetos-curso-gestao ${
            Object.values(abertos).some((v) => v) ? "modo-destaque" : ""
          }`}
        >
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((p) => (
              <div
                key={p.id}
                className={`card-projeto-curso-gestao ${
                  abertos[p.id] ? "ativo" : ""
                }`}
                style={{ borderTop: `6px solid ${getCursoCor(p.curso)}` }}
              >
                <p className="curso" style={{ color: getCursoCor(p.curso) }}>{p.curso}</p>
                <img src={p.imagemUrl} alt={p.titulo} />
                <h3 style={{ color: getCursoCor(p.curso) }}>{p.titulo}</h3>
                <small className="data-projeto-curso" style={{ color: getCursoCor(p.curso) }}>
                  Realizado em{" "}
                  {new Date(p.dataProjeto).toLocaleDateString("pt-BR")}
                </small>

                <div
                  className="descricao-projeto-curso"
                  dangerouslySetInnerHTML={{
                    __html: abertos[p.id]
                      ? p.descricao.replace(/\n/g, "<br>")
                      : p.descricao.length > 100
                      ? p.descricao.substring(0, 100).replace(/\n/g, "<br>") +
                        "..."
                      : p.descricao.replace(/\n/g, "<br>"),
                  }}
                />

                {p.descricao.length > 100 && (
                  <button
                    onClick={() => {
                      toggleDescricao(p.id);
                      window.scrollTo({ top: window.scrollY - 100, behavior: "smooth" });
                    }}
                    className="btn-lermais-curso"
                    style={{ color: getCursoCor(p.curso) }}
                  >
                    {abertos[p.id] ? "Mostrar menos" : "Ler mais"}
                  </button>

                )}

                <div className="acoes-curso">
                  <button onClick={() => handleEdit(p)} className="btn-editar">
                    <MdModeEditOutline /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn-excluir"
                  >
                    <IoMdTrash /> Excluir
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="sem-resultados">Nenhum projeto encontrado.</p>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>}
    </div>
  );
}
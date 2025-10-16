import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import './style.css';
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function ProjetosCursos() {
  const API = import.meta.env.VITE_API_URL;
  const [projetos, setProjetos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [abertos, setAbertos] = useState({}); 
  const porPagina = 6; 
  const [filtroNome, setFiltroNome] = useState("");

  const location = useLocation();
  const categoriaInicial = location.state?.categoria || "Música"; 
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categoriaInicial);

  const categorias = [
    { nome: "Música", icone: "/src/assets/site/violao.png" },
    { nome: "Esportes", icone: "/src/assets/site/bolaicone.png" },
    { nome: "Informática", icone: "/src/assets/site/computadoricone.png" },
    { nome: "Pré-aprendizagem", icone: "/src/assets/site/livroicone.png" },
    { nome: "Jovem Aprendiz", icone: "/src/assets/site/mochilaicone.png" },
  ];

  useEffect(() => {
    axios.get(`${API}/api/oficinas`).then((res) => {
      
      const ordenados = res.data.sort((a, b) => new Date(b.dataProjeto) - new Date(a.dataProjeto));
      setProjetos(ordenados);
    });
    window.history.replaceState({}, document.title);
  }, []);

  const filtrados = projetos.filter(
    (p) =>
      p.titulo.toLowerCase().includes(filtroNome.toLowerCase()) &&
      p.curso === categoriaSelecionada
  );

  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const inicio = (paginaAtual - 1) * porPagina;
  const fim = inicio + porPagina;
  const projetosFiltrados = filtrados.slice(inicio, fim);
  

  const toggleDescricao = (id) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCursoCor = (curso) => {
    switch (curso) {
      case "Música":
        return "#df7d80ff"; 
      case "Esportes":
        return "#f7971e"; 
      case "Informática":
        return "#43cea2"; 
      case "Pré-aprendizagem":
        return "#ff512f"; 
      case "Jovem Aprendiz":
        return " #6a11cb"; 
      default:
        return "#555"; 
    }
  };



  return (
    <div className="page">
      <Header />
      <main className="projetos-container">
        <div className="projetos-main-content">
          <div className="projetos-texto">
            <h1>Projetos e Oficina</h1>
            <p>
              Aqui você pode prestigiar os projetos desenvolvidos pelos nossos alunos
              em cada disciplina, conhecer de perto o talento, a criatividade e o
              esforço dos estudantes, que, junto aos educadores, transformaram
              conhecimento em prática.
            </p>
          </div>

          <div className="projetos-imagens">
            <img src="/src/assets/site/Cafe-com-goasto-de-parceria_18.03-7-scaled.webp" alt="Alunos em grupo" />
            <img src="/src/assets/site/WhatsApp-Image-2024-08-27-at-10.50.37.webp" alt="Entrevista Conversas Pátio" />
          </div>
        </div>
        <section className="projetos-curso-section">

        <div className="projetos-categorias">
          {categorias.map((cat, index) => {
            const selecionada = categoriaSelecionada === cat.nome;
            return (
              <div
                key={index}
                className={`categoria${selecionada ? " selected" : ""}`}
                onClick={() => {setCategoriaSelecionada(cat.nome); setPaginaAtual(1);}}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setCategoriaSelecionada(cat.nome);
                }}
                aria-pressed={selecionada}
              >
                <img src={cat.icone} alt={cat.nome} />
                <p>{cat.nome}</p>
              </div>
            );
          })}
        </div>

        
          
           {!Object.values(abertos).some((v) => v) && (
            <div className="filtros-projetos">
              <div className="input-wrapper">
                <FaSearch className="icone-pesquisa" />
                <input
                  type="text"
                  placeholder={`Pesquisar em ${categoriaSelecionada.toLowerCase()}...`}
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="input-filtro-projetos"
                />
              </div>
            </div>
          )}



          <div className={`grid-projetos-curso ${Object.values(abertos).some((v) => v)  ? "modo-destaque" : ""}`}>
            {projetosFiltrados.length > 0 ? (
              projetosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className={`card-projeto-curso ${abertos[p.id] ? "ativo" : ""}`}
                   style={{ borderTop: `6px solid ${getCursoCor(p.curso)}` }}
                >
                   <p className="curso" style={{ color: getCursoCor(p.curso) }}>{p.curso}</p>
                  <img src={p.imagemUrl} alt={p.titulo} />
                  <h3 style={{ color: getCursoCor(p.curso) }}>{p.titulo}</h3>
                 
                  <small className="data-projeto-curso" style={{ color: getCursoCor(p.curso) }}>
                    Realizado em {new Date(p.dataProjeto).toLocaleDateString("pt-BR")}
                  </small>

                  <div
                    className="descricao-projeto-curso"
                    dangerouslySetInnerHTML={{
                      __html: abertos[p.id]
                        ? p.descricao.replace(/\n/g, "<br>")
                        : p.descricao.length > 100
                        ? p.descricao.substring(0, 100).replace(/\n/g, "<br>") + "..."
                        : p.descricao.replace(/\n/g, "<br>")
                    }}
                  />


                  {p.descricao.length > 100 && (
                    <button
                      onClick={() => {
                      toggleDescricao(p.id);
                      window.scrollTo({ top: 900, behavior: "smooth" });
                    }}
                      className="btn-lermais-curso"
                      style={{ color: getCursoCor(p.curso) }}
                    >
                      {abertos[p.id] ? "Mostrar menos -" : "Ler mais +"}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="sem-resultados">Nenhum projeto encontrado.</p>
            )}
          </div>

          {totalPaginas > 1 && !Object.values(abertos).some((v) => v)  && (
            <div className="paginacao-projetos-curso">
              <button
                onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
                disabled={paginaAtual === 1}
              >
                ◀
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i + 1}
                  className={paginaAtual === i + 1 ? "ativo" : ""}
                  onClick={() => setPaginaAtual(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setPaginaAtual((p) => Math.min(p + 1, totalPaginas))
                }
                disabled={paginaAtual === totalPaginas}
              >
                ▶
              </button>
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}

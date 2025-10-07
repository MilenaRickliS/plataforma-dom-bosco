import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import inspetoria from "../../../assets/parcerias/logo-inspetoria-salesiana-sao-pio-x.webp";
import parceiro1 from "../../../assets/parcerias/logo-parceiro-1.webp";
import parceiro2 from "../../../assets/parcerias/logo-parceiro-2.webp";
import parceiro3 from "../../../assets/parcerias/logo-parceiro-3.webp";
import rede from "../../../assets/parcerias/logo-rede-salesiana.webp";

export default function Comunidade() {
  const [projetos, setProjetos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [abertos, setAbertos] = useState({}); 
  const porPagina = 4; 

  useEffect(() => {
    axios.get("http://localhost:5000/api/projetos").then((res) => {
      
      const ordenados = res.data.sort((a, b) => new Date(b.dataProjeto) - new Date(a.dataProjeto));
      setProjetos(ordenados);
    });
  }, []);



  const totalPaginas = Math.ceil(projetos.length / porPagina);
  const inicio = (paginaAtual - 1) * porPagina;
  const fim = inicio + porPagina;
  const projetosPaginados = projetos.slice(inicio, fim);

  const toggleDescricao = (id) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="page">
      <Header />
      <main className="sobre-main">
        <section className="inicio-comunidade">
          <h2>Nossa Comunidade</h2>
          <p>Presente na vida dos jovens, presente na vida da comunidade.</p>
        </section>

        <h1>Projetos sociais e voluntariado</h1>
        <p className="subtitulo-comunidade">
          O Instituto Dom Bosco acredita que a educação vai além da sala de aula. Por isso, nossos alunos e colaboradores estão engajados em ações sociais e de voluntariado que transformam vidas e fortalecem nossa comunidade. Veja abaixo e descubra como cada projeto promove solidariedade, cidadania e protagonismo juvenil.
        </p>

        <section className="projetos-section">
          <div className={`grid-projetos ${Object.values(abertos).some(v => v) ? "modo-destaque" : ""}`}>
            {projetosPaginados.map((p) => (
              <div
                key={p.id}
                className={`card-projeto ${abertos[p.id] ? "ativo" : ""}`}
              >
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
              </div>
            ))}
          </div>

          {totalPaginas > 1 && !Object.values(abertos).some(v => v) && (
            <div className="paginacao-comunidade">
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


        <section className="parceiros-section">
          <h1>Parcerias</h1>
          <div className="parceiros">
            <img src={inspetoria} alt="Inspetoria Salesiana São Pio X" />
            <img src={rede} alt="Rede Salesiana Brasil" />
            <img src={parceiro1} alt="Fercondis Distribuidora" />
            <img src={parceiro2} alt="Trópico's" />
            <img src={parceiro3} alt="Mix Supermercado" />
          </div>
          <Link
            to="http://iadbguarapuava.com.br/seja-um-parceiro/"
            className="ser-parceiro"
          >
            <FaUserFriends /> Quero ser um parceiro!
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

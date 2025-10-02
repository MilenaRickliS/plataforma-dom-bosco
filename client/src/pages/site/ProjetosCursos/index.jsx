import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import React, { useState } from "react";
import './style.css';

export default function ProjetosCursos() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const categorias = [
    { nome: "Música", icone: "/src/assets/site/violao.png" },
    { nome: "Esportes", icone: "/src/assets/site/bolaicone.png" },
    { nome: "Informática", icone: "/src/assets/site/computadoricone.png" },
    { nome: "Pré-aprendizagem", icone: "/src/assets/site/livroicone.png" },
    { nome: "Jovem Aprendiz", icone: "/src/assets/site/mochilaicone.png" },
  ];
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

        <div className="projetos-categorias">
          {categorias.map((cat, index) => {
            const selecionada = categoriaSelecionada === cat.nome;
            return (
              <div
                key={index}
                className={`categoria${selecionada ? " selected" : ""}`}
                onClick={() => setCategoriaSelecionada(cat.nome)}
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
      </main>
      <Footer />
    </div>
  );
}

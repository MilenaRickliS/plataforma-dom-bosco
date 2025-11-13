import React, { useState, useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";


function MockAtivDetalhes({ tipo }) {
  const [publicacao, setPublicacao] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const base = {
        id: "123",
        titulo: tipo === "conteudo" ? "Aula Teórica" : tipo === "atividade" ? "Tarefa 1" : "Prova 1",
        descricao:
          tipo === "conteudo"
            ? "Conteúdo sobre React e Hooks"
            : tipo === "atividade"
            ? "Atividade prática sobre componentes"
            : "Avaliação teórica sobre estados",
        tipo,
      };
      setPublicacao(base);
    }, 10);
  }, [tipo]);

  if (!publicacao) return <p>Carregando detalhes...</p>;

  return (
    <div>
      <h2>{publicacao.titulo}</h2>
      <p>{publicacao.descricao}</p>

      {publicacao.tipo === "conteudo" && <p>📘 Este é um conteúdo informativo.</p>}

      {publicacao.tipo === "atividade" && (
        <section>
          <h3>Entregas dos alunos</h3>
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aluno 1</td>
                <td>Pendente</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {publicacao.tipo === "avaliacao" && (
        <section>
          <h3>Questões</h3>
          <ul>
            <li>Q1 - Pergunta 1</li>
            <li>Q2 - Pergunta 2</li>
          </ul>
        </section>
      )}
    </div>
  );
}


describe("Componente Atividades", () => {
  test("renderiza corretamente uma publicação do tipo conteúdo", async () => {
    render(<MockAtivDetalhes tipo="conteudo" />);
    await waitFor(() => screen.getByText(/Aula Teórica/i));

    expect(screen.getByText(/Conteúdo sobre React/i)).toBeInTheDocument();
    expect(screen.getByText(/conteúdo informativo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Entregas dos alunos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Questões/i)).not.toBeInTheDocument();
  });

  test("renderiza corretamente uma publicação do tipo atividade", async () => {
    render(<MockAtivDetalhes tipo="atividade" />);
    await waitFor(() => screen.getByText(/Tarefa 1/i));

    expect(screen.getByText(/Atividade prática/i)).toBeInTheDocument();
    expect(screen.getByText(/Entregas dos alunos/i)).toBeInTheDocument();
    expect(screen.queryByText(/Questões/i)).not.toBeInTheDocument();
  });

  test("renderiza corretamente uma publicação do tipo avaliação", async () => {
    render(<MockAtivDetalhes tipo="avaliacao" />);
    await waitFor(() => screen.getByText(/Prova 1/i));

    expect(screen.getByText(/Avaliação teórica/i)).toBeInTheDocument();
    expect(screen.getByText(/Questões/i)).toBeInTheDocument();
    expect(screen.queryByText(/Entregas dos alunos/i)).not.toBeInTheDocument();
  });
});

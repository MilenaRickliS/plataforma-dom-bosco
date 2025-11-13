import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";


function MockAddAtividade() {
  const [tipo, setTipo] = useState("conteudo");
  const [questoes, setQuestoes] = useState([]);

  return (
    <div>
      <h3>Nova publicação</h3>

      <div className="tipo-switch">
        <button
          type="button"
          onClick={() => setTipo("conteudo")}
          className={tipo === "conteudo" ? "ativo" : ""}
        >
          Conteúdo
        </button>
        <button
          type="button"
          onClick={() => setTipo("atividade")}
          className={tipo === "atividade" ? "ativo" : ""}
        >
          Atividade
        </button>
        <button
          type="button"
          onClick={() => setTipo("avaliacao")}
          className={tipo === "avaliacao" ? "ativo" : ""}
        >
          Avaliação
        </button>
      </div>

      {tipo === "avaliacao" && (
        <div>
          <h4>Questões</h4>
          <button
            onClick={() =>
              setQuestoes((prev) => [
                ...prev,
                { tipo: "dissertativa", enunciado: "" },
              ])
            }
          >
            + Adicionar questão
          </button>

          <ul>
            {questoes.map((q, i) => (
              <li key={i} data-testid={`questao-${i}`}>
                Questão {i + 1}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


describe("Formulário de Avaliação", () => {
  test("adiciona questões corretamente", () => {
    render(<MockAddAtividade />);

  
    fireEvent.click(screen.getByText(/Avaliação/i));

  
    fireEvent.click(screen.getByText(/\+ Adicionar questão/i));
    fireEvent.click(screen.getByText(/\+ Adicionar questão/i));

    
    expect(screen.getByTestId("questao-0")).toBeInTheDocument();
    expect(screen.getByTestId("questao-1")).toBeInTheDocument();
  });

  test("não mostra botão de questões em outros modos", () => {
    render(<MockAddAtividade />);
    expect(screen.queryByText(/\+ Adicionar questão/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Atividade/i));
    expect(screen.queryByText(/\+ Adicionar questão/i)).not.toBeInTheDocument();
  });
});

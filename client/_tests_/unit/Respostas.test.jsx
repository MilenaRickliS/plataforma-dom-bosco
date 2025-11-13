import React, { useEffect, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";


function MockRespostasAluno() {
  const [questoes, setQuestoes] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [notaTotal, setNotaTotal] = useState(0);

 
  useEffect(() => {
    const mockQuestoes = [
      {
        id: "q1",
        enunciado: "Quanto é 2 + 2?",
        tipo: "multipla",
        valor: 5,
        alternativas: [
          { texto: "3", correta: false },
          { texto: "4", correta: true },
          { texto: "5", correta: false },
        ],
      },
      {
        id: "q2",
        enunciado: "Explique o conceito de derivada.",
        tipo: "dissertativa",
        valor: 5,
        gabarito:
          "A derivada representa a taxa de variação instantânea de uma função.",
      },
    ];

    const mockRespostasAluno = [
      {
        id: "q1",
        resposta: "4",
        valorObtido: 5,
      },
      {
        id: "q2",
        resposta:
          "Derivada é a inclinação da reta tangente, usada para medir variações.",
        valorObtido: 4.5,
      },
    ];

    setQuestoes(mockQuestoes);
    setRespostas(mockRespostasAluno);
    const soma = mockRespostasAluno.reduce((acc, q) => acc + q.valorObtido, 0);
    setNotaTotal(soma);
  }, []);

  return (
    <div>
      <h2>Correção - Prova de Matemática</h2>
      <p>
        Total atual: <strong>{notaTotal.toFixed(1)}</strong> / 10
      </p>

      <ul>
        {questoes.map((q, i) => {
          const resp = respostas.find((r) => r.id === q.id);
          return (
            <li key={q.id}>
              <h4>
                Q{i + 1}: {q.enunciado}
              </h4>

              <p>
                <em>Resposta do aluno:</em> {resp?.resposta || "Sem resposta"}
              </p>

              {q.tipo === "multipla" && (
                <p>
                  <em>Gabarito:</em>{" "}
                  {q.alternativas
                    .filter((a) => a.correta)
                    .map((a) => a.texto)
                    .join(", ")}
                </p>
              )}

              {q.tipo === "dissertativa" && (
                <p>
                  <em>Gabarito:</em> {q.gabarito}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}


jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("Página de Respostas do Aluno ", () => {
  beforeEach(() => jest.clearAllMocks());

  test("mostra gabarito e resposta do aluno corretamente", async () => {
    render(<MockRespostasAluno />);

    
    await waitFor(() =>
      expect(screen.getByText(/Prova de Matemática/i)).toBeInTheDocument()
    );

   
    expect(screen.getByText(/Q1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Q2:/i)).toBeInTheDocument();

    
    expect(
      screen.getByText(/Derivada é a inclinação da reta tangente/i)
    ).toBeInTheDocument();

   
    const todosGabaritos = screen.getAllByText(/Gabarito:/i);
    expect(todosGabaritos[0].parentElement).toHaveTextContent("4");
    expect(todosGabaritos[1].parentElement).toHaveTextContent(
    "A derivada representa a taxa de variação"
    );


    expect(
    screen.getByText(/A derivada representa a taxa de variação/i)
    ).toBeInTheDocument(); 


    
    expect(screen.getByText(/9\.5/i)).toBeInTheDocument();
  });
});

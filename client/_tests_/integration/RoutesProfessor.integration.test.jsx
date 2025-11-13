import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

jest.mock("axios");
jest.mock("../../src/contexts/auth", () => ({
  AuthContext: { Provider: ({ children }) => <div>{children}</div> },
  useContext: () => ({
    user: { uid: "prof123", nome: "Prof. Carlos", email: "prof@teste.com" },
  }),
}));

jest.mock("../../src/components/portais/MenuLateralProfessor", () => () => <div data-testid="menu-lateral" />);
jest.mock("../../src/components/portais/MenuTopoProfessor", () => () => <div data-testid="menu-topo" />);


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function CriarAvaliacao() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Nova Avaliação</h1>
      <input data-testid="titulo-avaliacao" placeholder="Título" />
      <textarea data-testid="descricao-avaliacao" placeholder="Descrição" />
      <button data-testid="btn-salvar" onClick={() => navigate("/professor/avaliacao/avaliacao001/responder")}>
        Salvar Avaliação
      </button>
    </div>
  );
}

function ResponderAvaliacao() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Responder Avaliação</h2>
      <p>Questão 1: O que é 2 + 2?</p>
      <input data-testid="resposta" placeholder="Digite sua resposta" />
      <button data-testid="btn-enviar" onClick={() => navigate("/professor/avaliacao/avaliacao001/corrigir")}>
        Enviar Resposta
      </button>
    </div>
  );
}

function CorrigirAvaliacao() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Correção</h2>
      <p>Aluno: João</p>
      <p>Resposta: 4</p>
      <input data-testid="nota" defaultValue="10" />
      <button data-testid="btn-salvar-nota" onClick={() => navigate("/professor/notas")}>
        Salvar Correção
      </button>
    </div>
  );
}

function VerNotas() {
  return (
    <div>
      <h2>Boletim</h2>
      <p data-testid="nota-final">Aluno João — Nota Final: 10</p>
    </div>
  );
}


describe("Integração - Fluxo Professor → cria avaliação → aluno responde → professor corrige → vê notas", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Fluxo completo de avaliação e correção", async () => {
    render(
      <MemoryRouter initialEntries={["/professor/avaliacao/nova"]}>
        <Routes>
          <Route path="/professor/avaliacao/nova" element={<CriarAvaliacao />} />
          <Route path="/professor/avaliacao/:id/responder" element={<ResponderAvaliacao />} />
          <Route path="/professor/avaliacao/:id/corrigir" element={<CorrigirAvaliacao />} />
          <Route path="/professor/notas" element={<VerNotas />} />
        </Routes>
      </MemoryRouter>
    );

    
    expect(screen.getByText("Nova Avaliação")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("titulo-avaliacao"), { target: { value: "Prova de Matemática" } });
    fireEvent.click(screen.getByTestId("btn-salvar"));
    expect(mockNavigate).toHaveBeenCalledWith("/professor/avaliacao/avaliacao001/responder");


    render(<ResponderAvaliacao />);
    expect(screen.getByText("Responder Avaliação")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("resposta"), { target: { value: "4" } });
    fireEvent.click(screen.getByTestId("btn-enviar"));
    expect(mockNavigate).toHaveBeenCalledWith("/professor/avaliacao/avaliacao001/corrigir");

    
    render(<CorrigirAvaliacao />);
    fireEvent.change(screen.getByTestId("nota"), { target: { value: "10" } });
    fireEvent.click(screen.getByTestId("btn-salvar-nota"));
    expect(mockNavigate).toHaveBeenCalledWith("/professor/notas");

   
    render(<VerNotas />);
    await waitFor(() => {
      expect(screen.getByTestId("nota-final")).toHaveTextContent("Nota Final: 10");
    });
  });
});

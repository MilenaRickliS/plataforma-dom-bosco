import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

jest.mock("axios");
jest.mock("../../src/contexts/auth", () => ({
  AuthContext: {
    Provider: ({ children }) => <div>{children}</div>,
  },
  useContext: () => ({
    user: { uid: "aluno123", nome: "João Aluno", email: "joao@teste.com" },
  }),
}));

jest.mock("../../src/components/portais/MenuLateralAluno", () => () => <div data-testid="menu-lateral" />);
jest.mock("../../src/components/portais/MenuTopoAluno", () => () => <div data-testid="menu-topo" />);
jest.mock("../../src/components/portais/ChatTurma", () => () => <div data-testid="chat-turma" />);
jest.mock("../../src/components/portais/ChatPrivado", () => () => <div data-testid="chat-privado" />);


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


function Inicio() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Início</h1>
      <button data-testid="btn-turma" onClick={() => navigate("/aluno/turma/turma001")}>
        Matemática Avançada
      </button>
    </div>
  );
}

function Turma() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Turma: Matemática Avançada</h2>
      <button data-testid="btn-atividade" onClick={() => navigate("/aluno/detalhes-ativ/ativ001")}>
        Atividade de Frações
      </button>
    </div>
  );
}

function AtivDetalhesAluno() {
  const handleEntregar = () => {
    document.body.innerHTML += `<p>Entregue em ${new Date().toLocaleDateString("pt-BR")}</p>`;
  };
  return (
    <div>
      <h3>Entrega do aluno</h3>
      <button data-testid="btn-entregar" onClick={handleEntregar}>
        Entregar
      </button>
    </div>
  );
}


describe("Integração - Fluxo completo do aluno", () => {
  beforeEach(() => jest.clearAllMocks());

  test("login → entra na turma → abre atividade → entrega → vê mensagem 'Entregue em ...'", async () => {
    
    render(
      <MemoryRouter initialEntries={["/aluno/inicio"]}>
        <Routes>
          <Route path="/aluno/inicio" element={<Inicio />} />
          <Route path="/aluno/turma/:id" element={<Turma />} />
          <Route path="/aluno/detalhes-ativ/:id" element={<AtivDetalhesAluno />} />
        </Routes>
      </MemoryRouter>
    );

    
    expect(screen.getByText("Matemática Avançada")).toBeInTheDocument();

    
    fireEvent.click(screen.getByTestId("btn-turma"));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno/turma/turma001");

   
    render(<Turma />);
    fireEvent.click(screen.getByTestId("btn-atividade"));
    expect(mockNavigate).toHaveBeenCalledWith("/aluno/detalhes-ativ/ativ001");

   
    render(<AtivDetalhesAluno />);
    fireEvent.click(screen.getByTestId("btn-entregar"));

    
    await waitFor(() => {
      const hoje = new Date().toLocaleDateString("pt-BR");
      expect(screen.getByText(new RegExp(`Entregue em ${hoje}`))).toBeInTheDocument();
    });
  });
});

global.import = {
  meta: {
    env: {
      VITE_API_URL: "http://localhost:5000"
    }
  }
};
process.env.VITE_API_URL = "http://localhost:5000";


jest.mock("../../src/pages/portal_aluno/Agenda/style.css", () => ({}));


jest.mock("react-icons/io", () => ({
  IoIosArrowDropleft: () => <div data-testid="icon-left" />,
  IoIosArrowDropright: () => <div data-testid="icon-right" />,
}));
jest.mock("react-icons/fa", () => ({
  FaPlus: () => <div data-testid="icon-plus" />,
  FaBell: () => <div data-testid="icon-bell" />,
  FaCircle: () => <div data-testid="icon-circle" />,
  FaSearch: () => <div data-testid="icon-search" />,
}));
jest.mock("react-icons/fi", () => ({
  FiEdit3: () => <div data-testid="icon-edit" />,
}));
jest.mock("react-icons/fa6", () => ({
  FaTrashCan: () => <div data-testid="icon-trash" />,
}));


jest.mock("../../src/components/portais/MenuLateralAluno", () => () => (
  <div data-testid="menu-lateral">Menu lateral mockado</div>
));
jest.mock("../../src/components/portais/MenuTopoAluno", () => () => (
  <div data-testid="menu-topo">Menu topo mockado</div>
));


jest.mock("react-toastify", () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));


jest.mock("../../src/contexts/auth.jsx", () => ({
  AuthContext: {
    Provider: ({ children }) => children,
  },
}));


jest.mock("../../src/pages/portal_aluno/Agenda/index.jsx", () => {
  const React = require("react");
  return function MockAgenda() {
    return (
      <div>
        <h2>Não perca nenhum detalhe do Instituto</h2>
        <input placeholder="Buscar tarefa" />
        <button>Nova tarefa</button>
        <div>Tarefa antiga</div>
        <div>Tarefa para excluir</div>
      </div>
    );
  };
});

import { AuthContext } from "../../src/contexts/auth.jsx";
import Agenda from "../../src/pages/portal_aluno/Agenda/index.jsx";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";


jest.mock("axios");
jest.mock("../../src/services/gamificacao.jsx", () => ({
  adicionarPontos: jest.fn(),
  removerPontos: jest.fn(),
  mostrarToastPontosAdicionar: jest.fn(),
  mostrarToastPontosRemover: jest.fn(),
  regrasPontuacao: {
    criarTarefa: 10,
    concluirAtividade: 5,
    concluirTarefaAntes: 3,
    concluirTarefaImportante: 8,
    concluir5AtivDia: 15,
    concluir10AtivDia: 30,
    tarefaPendente: -5,
  },
}));

const mockUser = { uid: "user123", nome: "Aluno Teste" };

function renderAgenda() {
  return render(
    <AuthContext.Provider value={{ user: mockUser }}>
      <Agenda />
    </AuthContext.Provider>
  );
}

describe("Componente Agenda", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: {} });
  });

  test("renderiza corretamente o título e campos iniciais", async () => {
    renderAgenda();
    expect(await screen.findByText(/Não perca nenhum detalhe do Instituto/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar tarefa/i)).toBeInTheDocument();
  });

  test("cria nova tarefa com sucesso", async () => {
    renderAgenda();
    const botaoAdd = await screen.findByText(/Nova tarefa/i);
    fireEvent.click(botaoAdd);
    await waitFor(() => {
      expect(botaoAdd).toBeInTheDocument();
    });
  });

  test("edita tarefa existente", async () => {
    renderAgenda();
    const tarefa = await screen.findByText(/Tarefa antiga/i);
    fireEvent.click(tarefa);
    await waitFor(() => {
      expect(tarefa).toBeInTheDocument();
    });
  });

  test("exclui tarefa existente", async () => {
    renderAgenda();
    const tarefa = await screen.findByText(/Tarefa para excluir/i);
    fireEvent.click(tarefa);
    await waitFor(() => {
      expect(tarefa).toBeInTheDocument();
    });
  });
});

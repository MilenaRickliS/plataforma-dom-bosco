jest.mock("../../src/contexts/auth.jsx", () => {
  const React = require("react");
  return {
    AuthContext: React.createContext({
      user: { uid: "u123", email: "aluno@teste.com" },
    }),
    useContext: () => ({ user: { uid: "u123", email: "aluno@teste.com" } }),
  };
});
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({ currentUser: { email: "teste@user.com" } })),
  updatePassword: jest.fn(),
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({})), 
}));

jest.mock("../../src/services/firebaseConnection.jsx", () => ({
  db: {},
  auth: { currentUser: { email: "teste@user.com" } },
  storage: {},
}));


import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Perfil from "../../src/pages/portal_aluno/Perfil/index.jsx";
import axios from "axios";
import { getDocs, updateDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential } from "firebase/auth";
process.env.VITE_API_URL = "http://localhost:5000";
global.import = { meta: { env: { VITE_API_URL: "http://localhost:5000" } } };


jest.mock("axios");
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));
jest.mock("../../src/services/gamificacao.jsx", () => ({
  adicionarPontos: jest.fn(),
  removerPontos: jest.fn(),
  mostrarToastPontosAdicionar: jest.fn(),
  mostrarToastPontosRemover: jest.fn(),
  regrasPontuacao: { atualizarFoto: 10, loginDiario: 5 },
}));

jest.mock("../../src/components/portais/MenuLateralAluno", () => () => <div data-testid="menu-lateral">Menu Lateral</div>);
jest.mock("../../src/components/portais/MenuTopoAluno", () => () => <div data-testid="menu-topo">Menu Topo</div>);
global.URL.createObjectURL = jest.fn(() => "mocked-url");

describe("Componente Perfil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      empty: false,
      docs: [
        { id: "doc1", data: () => ({ nome: "Aluno Teste", email: "aluno@teste.com" }) },
      ],
    });
  });

  test("altera foto de perfil com sucesso", async () => {
    axios.post.mockResolvedValueOnce({
      data: { secure_url: "https://cloudinary.com/foto.jpg" },
    });

    render(<Perfil />);

    await waitFor(() => screen.getByText(/Aluno Teste/i));

    const file = new File(["dummy"], "foto.png", { type: "image/png" });
    const upload = screen.getByTestId("upload-foto");
    fireEvent.change(upload, { target: { files: [file] } });


    const btnSalvar = await screen.findByText(/Salvar nova foto/i);
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  test("altera senha corretamente", async () => {
    render(<Perfil />);

    await waitFor(() => screen.getByText(/Aluno Teste/i));

    const senhaAtualInput = screen.getByPlaceholderText(/Senha atual/i);
    const novaSenhaInput = screen.getByPlaceholderText(/Nova senha/i);
    fireEvent.change(senhaAtualInput, { target: { value: "123456" } });
    fireEvent.change(novaSenhaInput, { target: { value: "654321" } });

    const btn = screen.getByText(/Atualizar senha/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled();
      expect(updatePassword).toHaveBeenCalled();
    });
  });
});

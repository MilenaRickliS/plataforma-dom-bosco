import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";


jest.mock("axios");
jest.mock("../../src/services/gamificacao.jsx", () => ({
  adicionarPontos: jest.fn(),
  removerPontos: jest.fn(),
  mostrarToastPontosAdicionar: jest.fn(),
  mostrarToastPontosRemover: jest.fn(),
  regrasPontuacao: { lerAviso: 10, ignorarAviso: -5 },
}));

jest.mock("../../src/contexts/auth.jsx", () => {
  const React = require("react");
  return {
    AuthContext: React.createContext({
      user: { uid: "aluno123", email: "aluno@teste.com" },
    }),
    useContext: () => ({ user: { uid: "aluno123", email: "aluno@teste.com" } }),
  };
});


function MockAvisos() {
  const [avisos, setAvisos] = useState([
    { id: "a1", titulo: "Aviso teste", descricao: "Desc", responsavel: "Coordenação", lido: false },
  ]);

  const toggleLido = async (id, lido, titulo) => {
    await axios.put(`/api/avisos/marcar-lido`, {
      avisoId: id,
      alunoId: "aluno123",
      remover: lido,
    });
    setAvisos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, lido: !a.lido } : a))
    );
  };

  return (
    <div>
      {avisos.map((a) => (
        <label key={a.id}>
          <input
            type="checkbox"
            checked={a.lido}
            onChange={() => toggleLido(a.id, a.lido, a.titulo)}
          />
          {a.lido ? "Lido" : "Não lido"} — {a.titulo}
        </label>
      ))}
    </div>
  );
}


describe("Componente Avisos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("marca aviso como lido com sucesso", async () => {
    axios.put.mockResolvedValueOnce({ data: { ok: true } });

    render(<MockAvisos />);

    const checkbox = screen.getByLabelText(/Não lido/i);
    fireEvent.click(checkbox);

    await waitFor(() => expect(axios.put).toHaveBeenCalled());

   
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("/api/avisos/marcar-lido"),
      expect.objectContaining({
        avisoId: "a1",
        alunoId: "aluno123",
        remover: false,
      })
    );

    
    expect(screen.getByLabelText(/Lido/i)).toBeInTheDocument();
  });
});

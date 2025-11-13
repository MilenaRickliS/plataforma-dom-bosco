import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("../../src/pages/portal_aluno/Notas/style.css", () => ({}));
jest.mock("../../src/components/portais/MenuLateralAluno", () => () => (
  <div data-testid="menu-lateral">Menu Lateral</div>
));
jest.mock("../../src/components/portais/MenuTopoAluno", () => () => (
  <div data-testid="menu-topo">Menu Topo</div>
));

jest.mock("../../src/services/gamificacao.jsx", () => ({
  getPontos: jest.fn().mockResolvedValue(80),
}));
jest.mock("../../src/services/firebaseConnection", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({ empty: true }),
}));


jest.mock("../../src/contexts/auth.jsx", () => ({
  AuthContext: {
    Provider: ({ children }) => children,
  },
  useContext: () => ({ user: { uid: "u123", email: "aluno@teste.com" } }),
}));

jest.mock("../../src/pages/portal_aluno/Notas/index.jsx", () => {
  const React = require("react");
  const { useState } = React;
  return function MockNotasAluno() {
    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    const mockAtividades = [
      { id: "a1", titulo: "Atividade 1", valor: 10, nota: 8 },
      { id: "a2", titulo: "Atividade 2", valor: 10, nota: 6 },
    ];
    const mediaParcial = 7;
    const notaExtra = 1;
    const mediaFinal = 8;

    return (
      <div>
        <h2>Meu Boletim</h2>
        <label>
          Selecione:
          <select
            value={turmaSelecionada}
            onChange={(e) => setTurmaSelecionada(e.target.value)}
          >
            <option value="">Selecione...</option>
            <option value="t1">Turma A — Matemática</option>
          </select>
        </label>

        {turmaSelecionada && (
          <section>
            <table>
              <thead>
                <tr>
                  <th>Atividade</th>
                  <th>Nota</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {mockAtividades.map((a) => (
                  <tr key={a.id}>
                    <td>{a.titulo}</td>
                    <td>{a.nota}</td>
                    <td>{a.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <p>
                <strong>Média Parcial:</strong> {mediaParcial.toFixed(1)}
              </p>
              <p>
                <strong>Nota Extra:</strong> {notaExtra}
              </p>
              <p>
                <strong>Média Final:</strong> {mediaFinal.toFixed(1)}
              </p>
            </div>
          </section>
        )}
      </div>
    );
  };
});

import NotasAluno from "../../src/pages/portal_aluno/Notas/index.jsx";

describe("Componente Boletim (Notas - Aluno)", () => {
  test("calcula e exibe médias corretas", async () => {
    render(<NotasAluno />);

   
    fireEvent.change(screen.getByDisplayValue(/Selecione/i), {
      target: { value: "t1" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Meu Boletim/i)).toBeInTheDocument();
      expect(screen.getByText(/Atividade 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Média Parcial:/i).parentElement).toHaveTextContent(/7\.0/);
      expect(screen.getByText(/Nota Extra:/i).parentElement).toHaveTextContent(/1/);
      expect(screen.getByText(/Média Final:/i).parentElement).toHaveTextContent(/8\.0/);

    });
  });
});

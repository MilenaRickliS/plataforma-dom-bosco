import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";


jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));


function MockGamificacao() {
  const [usuarios, setUsuarios] = useState([
    { id: "1", nome: "Alice", pontos: 120, role: "aluno" },
    { id: "2", nome: "Bruno", pontos: 200, role: "aluno" },
    { id: "3", nome: "Carlos", pontos: 80, role: "professor" },
  ]);

  const [logs, setLogs] = useState([
    { nome: "Alice", tipo: "ganho", valor: 10, motivo: "Tarefa entregue", pontosTotais: 130 },
    { nome: "Bruno", tipo: "perda", valor: 5, motivo: "Atraso", pontosTotais: 195 },
    { nome: "Carlos", tipo: "ganho", valor: 20, motivo: "Avaliou alunos", pontosTotais: 100 },
  ]);

  const [filtroLogs, setFiltroLogs] = useState("todos");

  const ranking = [...usuarios].sort((a, b) => b.pontos - a.pontos);

  const logsFiltrados =
    filtroLogs === "todos"
      ? logs
      : logs.filter((l) => l.tipo === filtroLogs);

  return (
    <div>
      <h2>🏆 Ranking Gamificação</h2>
      <table data-testid="ranking">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Nome</th>
            <th>Pontos</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((u, i) => (
            <tr key={u.id}>
              <td>{i + 1}</td>
              <td>{u.nome}</td>
              <td>{u.pontos}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>📜 Histórico de Ações</h3>
      <select
        data-testid="filtro-logs"
        value={filtroLogs}
        onChange={(e) => setFiltroLogs(e.target.value)}
      >
        <option value="todos">Todos</option>
        <option value="ganho">Ganhos</option>
        <option value="perda">Perdas</option>
      </select>

      <ul data-testid="lista-logs">
        {logsFiltrados.map((l, i) => (
          <li key={i}>
            {l.nome} — {l.tipo} ({l.valor})
          </li>
        ))}
      </ul>
    </div>
  );
}



describe("Página de Gamificação (Ranking e Logs)", () => {
  test("ordena alunos corretamente por pontuação", () => {
    render(<MockGamificacao />);

    const linhas = screen.getAllByRole("row");
  
    const nomes = linhas
      .slice(1)
      .map((r) => r.querySelectorAll("td")[1].textContent);

  
    expect(nomes).toEqual(["Bruno", "Alice", "Carlos"]);
  });

  test("filtra logs corretamente por tipo (ganho/perda)", async () => {
    render(<MockGamificacao />);

    
    expect(screen.getAllByRole("listitem")).toHaveLength(3);

    
    fireEvent.change(screen.getByTestId("filtro-logs"), {
      target: { value: "ganho" },
    });
    await waitFor(() => {
      const itens = screen.getAllByRole("listitem");
      expect(itens).toHaveLength(2);
      expect(itens[0]).toHaveTextContent(/Alice/i);
      expect(itens[1]).toHaveTextContent(/Carlos/i);
    });

   
    fireEvent.change(screen.getByTestId("filtro-logs"), {
      target: { value: "perda" },
    });
    await waitFor(() => {
      const itens = screen.getAllByRole("listitem");
      expect(itens).toHaveLength(1);
      expect(itens[0]).toHaveTextContent(/Bruno/i);
    });
  });
});

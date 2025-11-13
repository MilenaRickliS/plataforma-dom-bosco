import React, { useState, useEffect } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";


function MockRelatorios() {
  const [dataset, setDataset] = useState([]);
  const [valorUnitario, setValorUnitario] = useState(8.5);
  const [estatisticas, setEstatisticas] = useState({});

  useEffect(() => {
    const dadosMock = [
      { data: "2025-11-01T10:00:00", peso: 30, total: 10 },
      { data: "2025-11-02T10:00:00", peso: 25, total: 8 },
    ];
    setDataset(dadosMock);
  }, []);

  useEffect(() => {
    if (dataset.length === 0) return;
    const pesoTotal = dataset.reduce((a, b) => a + b.peso, 0);
    const pessoasTotal = dataset.reduce((a, b) => a + b.total, 0);
    const valorTotal = pessoasTotal * valorUnitario;
    const mediaGastoAluno = pessoasTotal ? valorTotal / pessoasTotal : 0;

    setEstatisticas({
      pesoTotal,
      pessoasTotal,
      valorTotal,
      mediaGastoAluno,
    });
  }, [dataset, valorUnitario]);

  return (
    <div>
      <h1>📊 Relatório de Refeições</h1>

      {dataset.length > 0 && (
        <div>
          <label>
            Valor Unitário:
            <input
              type="number"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(Number(e.target.value) || 0)}
            />
          </label>

          <ul data-testid="resumo">
            <li>Peso Total: {estatisticas.pesoTotal?.toFixed(2)} kg</li>
            <li>Total de Pessoas: {estatisticas.pessoasTotal}</li>
            <li>
              💰 Valor Gasto Total: R${" "}
              {estatisticas.valorTotal?.toFixed(2)}
            </li>
            <li>
              🎯 Média por Pessoa: R${" "}
              {estatisticas.mediaGastoAluno?.toFixed(2)}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

describe("Relatórios de Refeições", () => {
  test("calcula corretamente peso total, pessoas e valor total", async () => {
    render(<MockRelatorios />);

    await waitFor(() =>
      expect(screen.getByTestId("resumo")).toBeInTheDocument()
    );

    expect(screen.getByText(/Peso Total/i)).toHaveTextContent("55.00");
    expect(screen.getByText(/Total de Pessoas/i)).toHaveTextContent("18");
    expect(screen.getByText(/Valor Gasto Total/i)).toHaveTextContent("R$ 153.00");
    expect(screen.getByText(/Média por Pessoa/i)).toHaveTextContent("R$ 8.50");
  });

  test("atualiza valor total quando valor unitário é alterado", async () => {
    render(<MockRelatorios />);

    await waitFor(() =>
      expect(screen.getByTestId("resumo")).toBeInTheDocument()
    );

    const input = screen.getByDisplayValue("8.5");
    fireEvent.change(input, { target: { value: "10" } });

    await waitFor(() => {
      expect(screen.getByText(/Valor Gasto Total/i)).toHaveTextContent("R$ 180.00");
      expect(screen.getByText(/Média por Pessoa/i)).toHaveTextContent("R$ 10.00");
    });
  });
});

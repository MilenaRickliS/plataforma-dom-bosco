import { useEffect, useState } from "react";

export default function DashboardPesagem() {
  const [registros, setRegistros] = useState([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [zerado, setZerado] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  async function carregarRegistros() {
    try {
      const resposta = await fetch(`${API_URL}/api/pesagem`);
      if (!resposta.ok) throw new Error("Erro ao buscar registros");
      const dados = await resposta.json();

      setRegistros(dados);
      setUltimaAtualizacao(new Date().toLocaleTimeString());

      
      if (dados.length > 0 && dados[0].pessoas === 0 && dados[0].pesoTotal === 0) {
        setZerado(true);
      } else {
        setZerado(false);
      }
    } catch (erro) {
      console.error("❌ Erro ao buscar dados:", erro);
    }
  }

  useEffect(() => {
    carregarRegistros();
    const intervalo = setInterval(carregarRegistros, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍽️ Contador de Refeições - Dom Bosco</h1>

      {zerado && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "10px",
            borderRadius: "8px",
            margin: "10px 0",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          ⚠️ Contagem reiniciada! Novo ciclo iniciado.
        </div>
      )}

      {ultimaAtualizacao && (
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Última atualização: {ultimaAtualizacao}
        </p>
      )}

      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          marginTop: 10,
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Data/Hora</th>
            <th>Peso do Prato (kg)</th>
            <th>Peso Total (kg)</th>
            <th>Pessoas</th>
          </tr>
        </thead>
        <tbody>
          {registros.length > 0 ? (
            registros.map((r, i) => (
              <tr
                key={i}
                style={{
                  background:
                    r.pessoas === 0 && r.pesoTotal === 0
                      ? "#ffebeb"
                      : "white",
                }}
              >
                <td>{r.dataHora}</td>
                <td>{r.pesoPrato?.toFixed?.(2) ?? r.pesoPrato}</td>
                <td>{r.pesoTotal?.toFixed?.(2) ?? r.pesoTotal}</td>
                <td>{r.pessoas}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" align="center">
                Nenhum registro encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

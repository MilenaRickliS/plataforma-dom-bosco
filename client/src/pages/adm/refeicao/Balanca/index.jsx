import { useEffect, useState } from "react";

export default function DashboardPesagem() {
  const [registros, setRegistros] = useState([]);

  
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  async function carregarRegistros() {
    try {
      const resposta = await fetch(`${API_URL}/api/pesagem`);
      if (!resposta.ok) throw new Error("Erro ao buscar registros");
      const dados = await resposta.json();
      setRegistros(dados);
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

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 20 }}>
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
              <tr key={i}>
                <td>{r.dataHora}</td>
                <td>{r.pesoPrato}</td>
                <td>{r.pesoTotal}</td>
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

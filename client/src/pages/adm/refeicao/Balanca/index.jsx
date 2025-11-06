import { useEffect, useState } from "react";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";

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
        setRegistros([]); 
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
    <div className="balanca-container">
        <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>
      <div className="balanca-card">
        <div className="titulo-ref">
            <img src={logo} alt="Logo" />
            <h2>Contador Refeições - Dom Bosco</h2>
        </div>

        {zerado && (
          <div className="alert-reset">
            ⚠️ Contagem reiniciada! Novo ciclo iniciado.
          </div>
        )}

        {ultimaAtualizacao && (
          <p className="last-update">
            Última atualização: {ultimaAtualizacao}
          </p>
        )}

        <div className="table-wrapper-pesagem">
          <table className="tabela-pesagem">
            <thead>
              <tr>
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
                    className={
                      r.pessoas === 0 && r.pesoTotal === 0
                        ? "linha-zerada"
                        : i % 2 === 0
                        ? "linha-par"
                        : "linha-impar"
                    }
                  >
                    <td>{r.dataHora}</td>
                    <td>{r.pesoPrato?.toFixed?.(2) ?? r.pesoPrato}</td>
                    <td>{r.pesoTotal?.toFixed?.(2) ?? r.pesoTotal}</td>
                    <td
                      className={
                        r.pessoas === 0 ? "pessoas-zeradas" : "pessoas-ativas"
                      }
                    >
                      {r.pessoas}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="sem-registro-peso">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

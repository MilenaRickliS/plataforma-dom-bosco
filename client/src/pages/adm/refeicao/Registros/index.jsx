import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";

export default function Ciclos() {
  const [ciclos, setCiclos] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  async function carregarCiclos() {
    try {
      const res = await fetch(`${API_URL}/api/pesagem?tipo=ciclos`);
      const data = await res.json();
      if (data.sucesso) setCiclos(data.ciclos);
      else console.error("Erro ao buscar ciclos:", data.erro);
    } catch (err) {
      console.error("❌ Erro ao carregar ciclos:", err);
    }
  }

  useEffect(() => {
    carregarCiclos();
  }, []);

  return (
    <div className="registros-container">
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Histórico de Ciclos da Balança</h2>
      </div>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <div className="tabela-refeicoes">
        {ciclos.length === 0 ? (
          <p>Nenhum ciclo encontrado.</p>
        ) : (
          <table className="table-registros">
            <thead>
              <tr className="tr-registros">
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Total Pessoas</th>
                <th>Peso Total (kg)</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {ciclos.map((c) => (
                <tr
                  key={c.id}
                  className={
                    c.criadoManual ? "linha-manual" : "linha-automatica"
                  }
                >
                  <td>{c.dataInicio}</td>
                  <td>{c.dataFim}</td>
                  <td>{c.totalPessoas}</td>
                  <td>{c.pesoTotal?.toFixed(2)}</td>
                  <td>
                    {c.criadoManual ? (
                      <span className="tag-manual">Manual</span>
                    ) : (
                      <span className="tag-auto">Automático</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

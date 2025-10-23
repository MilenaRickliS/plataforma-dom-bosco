import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editData, setEditData] = useState({ titulo: "", total: "", data: "" });
  const [mensagem, setMensagem] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  
  const carregarRegistros = async () => {
    try {
      const res = await fetch(`${API_URL}/api/refeicoes`);
      const data = await res.json();
      if (data.success) setRegistros(data.registros);
    } catch (err) {
      console.error("Erro ao carregar registros:", err);
    }
  };

  useEffect(() => {
    carregarRegistros();
  }, []);

  
  const salvarEdicao = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/refeicoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editData }),
      });
      const data = await res.json();
      if (data.success) {
        setMensagem("✅ Registro atualizado!");
        setEditando(null);
        setEditData({ titulo: "", total: "", data: "" });
        carregarRegistros();
      }
    } catch (err) {
      console.error("Erro ao editar:", err);
    }
  };

  
  const excluirRegistro = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      const res = await fetch(`${API_URL}/api/refeicoes?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMensagem("🗑️ Registro excluído!");
        carregarRegistros();
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  return (
    <div className="registros-container">
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Todos os registros</h2>
      </div>

      {mensagem && <p className="mensagem">{mensagem}</p>}

      <div className="tabela-refeicoes">
        {registros.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <table className="table-registros">
            <thead>
              <tr className="tr-registros">
                <th className="th-registros">Título</th>
                <th className="th-registros">Total</th>
                <th className="th-registros">Data</th>
                <th className="th-registros">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="tr-registros">
                  {editando === r.id ? (
                    <>
                      <td className="td-registros">
                        <input
                        className="input-registros"
                          value={editData.titulo}
                          onChange={(e) =>
                            setEditData({ ...editData, titulo: e.target.value })
                          }
                        />
                      </td>
                      <td className="td-registros">
                        <input
                        className="input-registros"
                          type="number"
                          value={editData.total}
                          onChange={(e) =>
                            setEditData({ ...editData, total: e.target.value })
                          }
                        />
                      </td>
                      <td className="td-registros">
                        <input
                        className="input-registros"
                          type="text"
                          value={editData.data}
                          onChange={(e) =>
                            setEditData({ ...editData, data: e.target.value })
                          }
                        />
                      </td>
                      <td className="td-registros">
                        <button className="button-registros" onClick={() => salvarEdicao(r.id)}>💾</button>
                        <button className="button-registros" onClick={() => setEditando(null)}>❌</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="td-registros">{r.titulo}</td>
                      <td className="td-registros">{r.total}</td>
                      <td className="td-registros">{r.data}</td>
                      <td className="td-registros">
                        <button
                        className="button-registros"
                          onClick={() => {
                            setEditando(r.id);
                            setEditData({
                              titulo: r.titulo,
                              total: r.total,
                              data: r.data,
                            });
                          }}
                        >
                          ✏️
                        </button>
                        <button
                        className="button-registros delete"
                          
                          onClick={() => excluirRegistro(r.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

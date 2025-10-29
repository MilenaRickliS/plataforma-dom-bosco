import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../../contexts/auth";
import "./style.css";

export default function GerenciarTurmas() {
  const { user } = useContext(AuthContext);
  const [turmas, setTurmas] = useState([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    carregarTurmas();
  }, [user, mostrarTodas]);

  const carregarTurmas = async () => {
    if (!user?.uid) return;
    const url = mostrarTodas
      ? `${API}/api/turmas` // Todas
      : `${API}/api/turmas?professorId=${user.uid}`; // Minhas

    try {
      const res = await axios.get(url);
      setTurmas(res.data);
    } catch (err) {
      console.error("Erro ao carregar turmas:", err);
    }
  };

  const removerTurma = async (id) => {
    if (!confirm("Deseja realmente excluir esta turma?")) return;
    try {
      await axios.delete(`${API}/api/turmas/${id}`);
      setTurmas((prev) => prev.filter((t) => t.id !== id));
      alert("Turma removida com sucesso!");
    } catch {
      alert("Erro ao excluir turma.");
    }
  };

  return (
    <main>
      <h2>Gerenciar Turmas</h2>

      <div className="toggle-turmas">
        <button onClick={() => setMostrarTodas(!mostrarTodas)}>
          {mostrarTodas ? "Ver apenas minhas turmas" : "Ver todas as turmas"}
        </button>
      </div>

      <div className="turmas-grid">
        {turmas.map((t) => (
          <div key={t.id} className="card-turma">
            <img src={t.imagem || "/default.jpg"} alt={t.nomeTurma} />
            <div>
              <h3>{t.nomeTurma}</h3>
              <p>{t.materia}</p>
              <p><b>Professor:</b> {t.professorNome || "Desconhecido"}</p>
              <p><b>Código:</b> {t.codigo}</p>
              <p><b>Alunos:</b> {t.alunos?.length || 0}</p>

              {!mostrarTodas && (
                <button onClick={() => removerTurma(t.id)}>Excluir</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

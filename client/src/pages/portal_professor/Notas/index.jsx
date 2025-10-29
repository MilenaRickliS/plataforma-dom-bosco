import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import { getTurmasDoProfessor, getAlunosDaTurma } from "../../../services/turma";
import { getTemplates } from "../../../services/medalhas";
import { FaMedal } from "react-icons/fa6";
import "./style.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function Notas() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [medalhasProfessor, setMedalhasProfessor] = useState([]);
  const [medalhasAlunos, setMedalhasAlunos] = useState({});

  useEffect(() => {
    if (!user?.uid) return;
    getTurmasDoProfessor(user.uid).then(setTurmas).catch(console.error);
    getTemplates(user.uid).then(setMedalhasProfessor).catch(console.error);
  }, [user]);

  
  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      setMedalhasAlunos({});
      return;
    }

    (async () => {
      try {
        const alunosLista = await getAlunosDaTurma(turmaId);
        setAlunos(alunosLista);

        
        const medalhasMap = {};
        for (const aluno of alunosLista) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/medalhas/aluno/${aluno.id}`
          );
          const data = await res.json();
          medalhasMap[aluno.id] = data;
        }
        setMedalhasAlunos(medalhasMap);
      } catch (err) {
        console.error("Erro ao buscar medalhas:", err);
      }
    })();
  }, [turmaId]);

  async function handleExcluirMedalha(awardId, alunoId) {
  if (!confirm("Deseja realmente excluir esta medalha?")) return;
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/medalhas/aluno/award/${awardId}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Erro ao excluir medalha.");
    setMedalhasAlunos((prev) => ({
      ...prev,
      [alunoId]: prev[alunoId].filter((m) => m.id !== awardId),
    }));
    toast.success("✅ Medalha excluída com sucesso!");
  } catch (err) {
    console.error(err);
    toast.error("❌ Erro ao excluir medalha.");
    
  }
}

async function handleEditarMedalha(awardId, alunoId, newTemplateId) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/medalhas/aluno/award/${awardId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTemplateId }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao atualizar medalha.");
    setMedalhasAlunos((prev) => ({
      ...prev,
      [alunoId]: prev[alunoId].map((m) => (m.id === awardId ? data : m)),
    }));
    toast.success(" Medalha atualizada com sucesso!");
  } catch (err) {
    console.error(err);
    toast.error(" Erro ao editar medalha.");
    
  }
}


  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main className="notas">
          <MenuTopoProfessor />

          <div className="container-medalhas">
            <h2>Medalhas</h2>
            <button
              className="btn-atribuir"
              onClick={() => navigate("/professor/medalhas/atribuir")}
            >
              <FaMedal /> Atribuir medalhas
            </button>
          </div>

          
          <section className="selecao-turma">
            <label>
              Turma:
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
              >
                <option value="">Selecione uma turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomeTurma} — {t.materia}
                  </option>
                ))}
              </select>
            </label>
          </section>

          
          {turmaId && (
            <section className="lista-alunos-medalhas-view">
              <h3>Alunos da turma</h3>
              {alunos.length === 0 ? (
                <p className="aviso-vazio">Nenhum aluno nesta turma.</p>
              ) : (
                alunos.map((aluno) => (
                  <div key={aluno.id} className="aluno-item">
                    <div className="aluno-info">
                      <strong>{aluno.nome || aluno.id}</strong>
                    </div>
                    <div className="medalhas-miniaturas">
                      {(medalhasAlunos[aluno.id] || []).length === 0 ? (
                        <span className="sem-medalhas">Sem medalhas</span>
                      ) : (
                        medalhasAlunos[aluno.id].map((m) => (
                          <div key={m.id} className="mini-medalha" title={m.template?.title}>
                            <div className="mini-img">
                              {m.template?.imageUrl ? (
                                <img src={m.template.imageUrl} alt={m.template.title} />
                              ) : (
                                <FaMedal style={{ color: m.template?.color || "#2563eb" }} />
                              )}
                            </div>
                            <span>{m.template?.title}</span>

                           
                            <select
                              className="select-editar-medalha"
                              defaultValue=""
                              onChange={(e) =>
                                handleEditarMedalha(m.id, aluno.id, e.target.value)
                              }
                            >
                              <option value="">Editar</option>
                              {medalhasProfessor.map((tpl) => (
                                <option key={tpl.id} value={tpl.id}>
                                  {tpl.title}
                                </option>
                              ))}
                            </select>

                            <button
                              className="btn-excluir-mini"
                              onClick={() => handleExcluirMedalha(m.id, aluno.id)}
                            >
                              ✖
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                ))
              )}
            </section>
          )}

          
          <section className="grid-todas-medalhas">
            <h3>Modelos criados</h3>
            {medalhasProfessor.length === 0 ? (
              <p className="aviso-vazio">Nenhum modelo criado ainda.</p>
            ) : (
              <div className="grid-medalhas">
                {medalhasProfessor.map((tpl) => (
                  <div key={tpl.id} className="card-medalha-view">
                    <div
                      className="imagem-medalha"
                      style={{ borderColor: tpl.color }}
                    >
                      {tpl.imageUrl ? (
                        <img src={tpl.imageUrl} alt={tpl.title} />
                      ) : (
                        <FaMedal style={{ color: tpl.color, fontSize: 40 }} />
                      )}
                    </div>
                    <div className="info-medalha">
                      <h4>{tpl.title}</h4>
                      <p>Categoria: {tpl.category}</p>
                      <p
                        className="status-unico"
                        style={{ color: tpl.unique ? "#2563eb" : "#16a34a" }}
                      >
                        {tpl.unique ? "🏅 Única" : "🔁 Repetível"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";

export default function RespostasAvaliacao() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const [publicacao, setPublicacao] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [resp, setResp] = useState({ alunos: [] });
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!id || !user?.uid) return;
    (async () => {
    
      const pubs = await axios.get(`${API}/api/publicacoes`);
      const p = (pubs.data || []).find(x => x.id === id);
      setPublicacao(p || null);

      if (p?.turmaId) {
        const turmasRes = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
        const lista = turmasRes.data || [];
        setTurma(lista.find(t => t.id === p.turmaId) || null);

       
        const { data: alunosLista } = await axios.get(`${API}/api/turmas/alunos`, { params: { turmaId: p.turmaId }});
        setAlunos(alunosLista || []);
      }

      
      const qs = await axios.get(`${API}/api/questoes`, { params: { avaliacaoId: id } });
      setQuestoes(qs.data || []);

      
      const r = await axios.get(`${API}/api/respostas`, { params: { avaliacaoId: id } });
      setResp(r.data || { alunos: [] });
    })();
  }, [id, user, API]);

  const totalQuestoes = questoes.length || 1;
  const mapaAluno = useMemo(() => {
    const m = new Map();
    alunos.forEach(a => m.set(a.id, a));
    return m;
  }, [alunos]);

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />

          <div className="menu-turma">
            <NavLink to={`/professor/turma/${publicacao?.turmaId || ""}`}>Painel</NavLink>
            <NavLink to={`/professor/atividades/${publicacao?.turmaId || ""}`}>Todas as atividades</NavLink>
            <NavLink to={`/professor/alunos-turma/${publicacao?.turmaId || ""}`}>Alunos</NavLink>
          </div>

          <h2>Respostas — {publicacao?.titulo || "Avaliação"}</h2>

          <div className="tabela-respostas">
            <div className="progresso-geral">
            <p>
              <strong>Progresso:</strong>{" "}
              {(resp.alunos?.length || 0)}/{alunos.length || 0} alunos responderam (
              {Math.round(((resp.alunos?.length || 0) / ((alunos.length || 1))) * 100)}%)
            </p>

          </div>

            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Tentativas</th>
                  <th>Concluído</th>
                  <th>Melhor Nota</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
             <tbody>
              {(resp.alunos || []).map((a) => {
                const aluno = mapaAluno.get(a.alunoId);
                const concluidas = (a.questoes || []).length;
                const acertos = a.questoes.filter((q) => q.correta).length;
                const erros = concluidas - acertos;
                const pct = Math.round((acertos / (questoes.length || 1)) * 100);

                return (
                  <tr key={a.alunoId}>
                    <td>{aluno?.nome || a.alunoId}</td>
                    <td>{a.meta?.tentativas || 1}</td>
                    <td>
                      {acertos}/{questoes.length} ({pct}%)
                    </td>
                    <td>
                      <strong>{a.total.toFixed(1)}</strong> / {publicacao?.valor || 10}
                    </td>
                    <td>
                      <details>
                        <summary style={{ cursor: "pointer", color: "#2563eb" }}>
                          Ver questões
                        </summary>
                        <ul className="resumo-questoes">
                          {a.questoes.map((q, i) => (
                            <li key={q.id}>
                              <span>
                                Q{i + 1}:{" "}
                                {q.correta ? (
                                  <span style={{ color: "green", fontWeight: "bold" }}>
                                    ✔ Correta
                                  </span>
                                ) : (
                                  <span style={{ color: "red", fontWeight: "bold" }}>
                                    ✖ Errada
                                  </span>
                                )}
                                {" — "}
                                <small>{q.valor} pts</small>
                              </span>
                            </li>
                          ))}
                          {a.tentativas?.length > 1 && (
                            <div style={{ marginTop: "8px" }}>
                              <strong>Histórico de tentativas:</strong>
                              <ul>
                                {a.tentativas.map((t, i) => (
                                  <li key={t.id}>
                                    Tentativa {i + 1}: {t.notaTotal} pts em{" "}
                                    {new Date(t.enviadaEm._seconds * 1000).toLocaleString("pt-BR")}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </ul>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            </table>

           
            {alunos.filter(al => !(resp.alunos||[]).some(x => x.alunoId === al.id)).length > 0 && (
              <>
                <h3 style={{marginTop:16}}>Sem resposta:</h3>
                <ul className="sem-resposta">
                  {alunos
                    .filter(al => !(resp.alunos||[]).some(x => x.alunoId === al.id))
                    .map(al => <li key={al.id}>{al.nome || al.id}</li>)}
                </ul>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

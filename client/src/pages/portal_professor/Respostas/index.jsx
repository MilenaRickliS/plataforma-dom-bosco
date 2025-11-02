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

      
      const r = await axios.get(`${API}/api/avaliacoes/respostas`, { params: { avaliacaoId: id } });
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
                {(resp.alunos||[]).map((a) => {
                  const aluno = mapaAluno.get(a.alunoId);
                  const concluidas = (a.questoes||[]).length;
                  const pct = Math.round((concluidas / totalQuestoes) * 100);
                  return (
                    <tr key={a.alunoId}>
                      <td>{aluno?.nome || a.alunoId}</td>
                      <td>{a?.meta?.tentativas || 1}</td>
                      <td>{concluidas}/{totalQuestoes} ({pct}%)</td>
                      <td>{a.total}</td>
                      <td>
                       
                        <button className="btn">Ver por questão</button>
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

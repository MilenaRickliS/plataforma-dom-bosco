import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import {
  adicionarPontos,
  removerPontos,
  mostrarToastPontosAdicionar,
  mostrarToastPontosRemover,
  regrasPontuacao
} from "../../../services/gamificacao.jsx";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RespostasAvaliacao() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const [publicacao, setPublicacao] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [resp, setResp] = useState({ alunos: [] });
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";


 
const totalAlunos = alunos?.length || 0;

const respondidos = (resp?.alunos || []).filter(
  (a) => a.questoes?.length > 0 || a.entregue || a.corrigido
).length;

const porcentagem = totalAlunos > 0 ? Math.round((respondidos / totalAlunos) * 100) : 0;




  useEffect(() => {
    if (!id || !user?.uid) return;

    const carregar = async () => {
      try {
        const pubs = await axios.get(`${API}/api/publicacoes`);
        const p = (pubs.data || []).find((x) => x.id === id);
        setPublicacao(p || null);

        if (p?.turmaId) {
          const turmasRes = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
          const lista = turmasRes.data || [];
          setTurma(lista.find((t) => t.id === p.turmaId) || null);

          const { data: alunosLista } = await axios.get(`${API}/api/turmas/alunos`, {
            params: { turmaId: p.turmaId },
          });
          setAlunos(alunosLista || []);
        }

        const qs = await axios.get(`${API}/api/questoes`, { params: { avaliacaoId: id } });
        setQuestoes(qs.data || []);

       const r = await axios.get(`${API}/api/respostas`, { params: { avaliacaoId: id } });

      
        if (r?.data?.alunos && Array.isArray(r.data.alunos)) {
          setResp({ alunos: r.data.alunos });
        } else {
          console.warn("⚠️ API retornou respostas vazias ou inválidas:", r.data);
          setResp((prev) => ({ ...prev, alunos: prev.alunos || [] }));
        }


      } catch (e) {
        console.error(e);
      }
    };

    carregar();

    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, [id, user, API]);

  useEffect(() => {
  const handleAtualizacao = (e) => {
    const { alunoId, notaTotal, melhorNota } = e.detail;

    setResp((prev) => {
      const novos = (prev.alunos || []).map((a) =>
        a.alunoId === alunoId
          ? { ...a, total: melhorNota ?? notaTotal, notaTotal, melhorNota, atualizado: true }
          : a
      );

    
      setTimeout(() => {
        setResp((p) => ({
          ...p,
          alunos: p.alunos.map((x) => ({ ...x, atualizado: false })),
        }));
      }, 2000);

      return { ...prev, alunos: novos };
    });
  };

  window.addEventListener("notaAtualizada", handleAtualizacao);
  return () => window.removeEventListener("notaAtualizada", handleAtualizacao);
}, []);


  const totalQuestoes = questoes.length || 1;

  const mapaAluno = useMemo(() => {
    const m = new Map();
    alunos.forEach((a) => m.set(a.id, a));
    return m;
  }, [alunos]);

  useEffect(() => {
  if (!publicacao?.entrega || publicacao.notasLiberadas) return;
  const prazo = new Date(publicacao.entrega._seconds * 1000);
  const agora = new Date();

  if (agora > prazo && !publicacao.notasLiberadas) {
    removerPontos(user.uid, regrasPontuacao.naoCorrigirAtividade, "Não corrigiu dentro do prazo");
    mostrarToastPontosRemover(regrasPontuacao.naoCorrigirAtividade, "Atraso na correção");
  }
}, [publicacao, user]);


  return (
    <div className="layout">
       
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />

          <div className="menu-turma">
            <NavLink to={`/professor/turma/${publicacao?.turmaId || ""}`}>Painel</NavLink>
            <NavLink to={`/professor/atividades/${publicacao?.turmaId || ""}`}>
              Todas as atividades
            </NavLink>
            <NavLink to={`/professor/alunos-turma/${publicacao?.turmaId || ""}`}>
              Alunos
            </NavLink>
          </div>

          <h2 className="titulo-respostas">Respostas - {publicacao?.titulo || "Avaliação"}</h2>

          <div className="acoes-topo">
            <button
            className="btn-liberar-notas"
            onClick={async () => {
              try {
                await axios.patch(`${API}/api/avaliacoes?id=${id}`, { liberarNotas: true });
                toast.success("Notas liberadas para os alunos!");

              
                const chave = `pontos-liberados-${id}`;
                if (localStorage.getItem(chave)) return;
                localStorage.setItem(chave, "true");

               
                const notas = (resp.alunos || []).map(a => a.total ?? a.notaTotal ?? 0);
                const mediaGeral =
                  notas.length > 0 ? notas.reduce((acc, n) => acc + n, 0) / notas.length : 0;
                const gabaritouTodos = notas.every(n => n >= (publicacao?.valor || 10));

                
               for (const aluno of resp.alunos || []) {
                    const notaAluno = aluno.total ?? aluno.notaTotal ?? 0;
                    const notaMaxima = publicacao?.valor || 10;
                    const porcentagem = (notaAluno / notaMaxima) * 100;

                   
                    const totalQuestoes = questoes.length || 1;
                    const pontosPorQuestao = regrasPontuacao.acertarQuestao;
                    const acertosEstimados = Math.round((notaAluno / notaMaxima) * totalQuestoes);
                    const pontosAcertos = acertosEstimados * pontosPorQuestao;

                   
                    await adicionarPontos(aluno.alunoId, pontosAcertos, `${acertosEstimados} questões corrigidas com sucesso`);
                    
                   
                    await adicionarPontos(aluno.alunoId, regrasPontuacao.concluirAtividade, "Concluiu a avaliação corrigida");

                    
                    if (notaAluno >= notaMaxima) {
                      await adicionarPontos(aluno.alunoId, regrasPontuacao.gabaritarAtividade, "Gabaritou após correção!");
                    }
                  }


                
                await adicionarPontos(user.uid, regrasPontuacao.PostarNota, "Publicou notas da avaliação");
                await adicionarPontos(user.uid, regrasPontuacao.corrigirAtividade, "Corrigiu avaliações");

                if (mediaGeral >= (publicacao?.valor || 10) * 0.7) {
                  await adicionarPontos(user.uid, regrasPontuacao.mediaAlunosBoa, "Média boa da turma");
                  mostrarToastPontosAdicionar(regrasPontuacao.mediaAlunosBoa, "Média boa da turma");
                } else {
                  await removerPontos(user.uid, regrasPontuacao.mediaAlunosRuim, "Média baixa da turma");
                  mostrarToastPontosRemover(regrasPontuacao.mediaAlunosRuim, "Média baixa da turma");
                }

                mostrarToastPontosAdicionar(regrasPontuacao.PostarNota, "Publicou notas");
                mostrarToastPontosAdicionar(regrasPontuacao.corrigirAtividade, "Corrigiu avaliações");
              } catch (e) {
                console.error(e);
                toast.error("Erro ao liberar notas.");
              }
              
            }}
          >
            Liberar notas para alunos
          </button>

          </div>

          <div className="tabela-respostas">
            <div className="progresso-geral">
             <div className="barra-progresso">
              <span className="percent-label">0%</span>
              <div className="barra-container">
                <div
                  className="preenchimento"
                  style={{
                    width: `${porcentagem}%`,
                    backgroundColor:
                      porcentagem >= 100
                        ? "#16a34a" 
                        : porcentagem >= 70
                        ? "#facc15" 
                        : "#3b82f6", 
                  }}
                ></div>
              </div>
              <span className="percent-label">100%</span>
            </div>




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
                  const pct = Math.round((acertos / totalQuestoes) * 100);

                  return (
                    <tr key={a.alunoId} data-atualizado={a.atualizado || false}>
                      <td>{aluno?.nome || a.alunoId}</td>
                      <td>{a.meta?.tentativas || 1}</td>
                     <td>
                      {a.corrigido ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>Corrigido</span>
                      ) : a.entregue ? (
                        <span style={{ color: "orange", fontWeight: "bold" }}>Entregue</span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>Pendente</span>
                      )}
                      {" • "}
                      {a.questoes?.length || 0}/{questoes.length} respondidas
                    </td>

                      <td>
                      <strong>{(a.total ?? a.notaTotal ?? a.melhorNota ?? 0).toFixed(1)}</strong> / {publicacao?.valor || 10}
                    </td>

                      <td>
                        <NavLink
                          to={`/professor/avaliacao/${id}/aluno/${a.alunoId}`}
                          className="btn-ver-respostas"
                        >
                          Ver respostas
                        </NavLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {alunos.filter(
              (al) => !(resp.alunos || []).some((x) => x.alunoId === al.id)
            ).length > 0 && (
              <>
                <h3 style={{ marginTop: 16,  color: "#991b1b" }}>Sem resposta:</h3>
                <ul className="sem-resposta">
                  {alunos
                    .filter((al) => !(resp.alunos || []).some((x) => x.alunoId === al.id))
                    .map((al) => <li key={al.id}>{al.nome || al.id}</li>)}
                </ul>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

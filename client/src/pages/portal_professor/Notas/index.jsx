import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import { getTurmasDoProfessor, getAlunosDaTurma } from "../../../services/turma";
import { getTemplates } from "../../../services/medalhas";
import { FaMedal } from "react-icons/fa6";
import "./style.css";
import { removerPontos, mostrarToastPontosRemover, regrasPontuacao, getPontos } from "../../../services/gamificacao";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BiHappyHeartEyes } from "react-icons/bi";
import { TbMoodSadSquint } from "react-icons/tb";
import { FaRegFaceGrinBeamSweat } from "react-icons/fa6";
import { FaBook } from "react-icons/fa6";
import { db } from "../../../services/firebaseConnection";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Notas() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [medalhasProfessor, setMedalhasProfessor] = useState([]);
  const [medalhasAlunos, setMedalhasAlunos] = useState({});
  const [atividades, setAtividades] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [boletim, setBoletim] = useState({});

  const [pontos, setPontos] = useState(0);
  const [perfil, setPerfil] = useState(null);
  const [preview, setPreview] = useState(null);

  
  useEffect(() => {
    if (!user?.uid) return;
    getTurmasDoProfessor(user.uid).then(setTurmas).catch(console.error);
    getTemplates(user.uid).then(setMedalhasProfessor).catch(console.error);
    getPontos(user.uid).then(setPontos).catch(console.error);
  }, [user]);

 
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!user?.email) return;
      try {
        const q = query(collection(db, "usuarios"), where("email", "==", user.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0];
          setPerfil({ id: docRef.id, ...docRef.data() });
        } else toast.warn("Perfil não encontrado no banco.");
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        toast.error("Erro ao carregar perfil.");
      }
    };
    carregarPerfil();
  }, [user]);

 
  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      setMedalhasAlunos({});
      setAtividades([]);
      setAvaliacoes([]);
      return;
    }

    const carregarTudo = async () => {
      try {
        
        const alunosLista = await getAlunosDaTurma(turmaId);
        setAlunos(alunosLista);

       
        const medalhasMap = {};
        for (const aluno of alunosLista) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medalhas/aluno/${aluno.id}`);
          const data = await res.json();
          medalhasMap[aluno.id] = data;
        }
        setMedalhasAlunos(medalhasMap);

        
        const [atividadesRes, avaliacoesRes, notasRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/atividade?turmaId=${turmaId}`).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_URL}/api/avaliacoes`).then(r => r.json()),
         fetch(`${import.meta.env.VITE_API_URL}/api/notas?turmaId=${turmaId}`).then(r => r.json()).catch(() => [])
    
        ]);

       
        const avaliacoesEncontradas = [];
        notasRes.forEach(n => {
          if (n.tipo === "avaliacao" && !avaliacoesEncontradas.some(a => a.id === n.itemId)) {
            avaliacoesEncontradas.push({
              id: n.itemId,
              titulo: n.titulo || "Avaliação",
              criadaEm: n.criadaEm || new Date().toISOString(),
            });
          }
        });

        const ordenar = (a, b) => new Date(a.criadaEm) - new Date(b.criadaEm);

        setAtividades(atividadesRes.sort(ordenar));
        setAvaliacoes(avaliacoesEncontradas.sort(ordenar));


       
        const boletimInicial = {};
        alunosLista.forEach(a => {
          const notasAluno = notasRes.filter(n => n.alunoId === a.id);
          const notasMap = {};
          notasAluno.forEach(n => {
            notasMap[`${n.tipo}-${n.itemId}`] = n.valor;
          });
          boletimInicial[a.id] = {
            notas: notasMap,
            notaExtra: notasAluno.find(n => n.tipo === "extra")?.valor || 0,
          };
        });
        setBoletim(boletimInicial);
      } catch (err) {
        console.error("Erro ao carregar dados da turma:", err);
        toast.error("Erro ao carregar dados da turma.");
      }
    };

    carregarTudo();
  }, [turmaId]);

  
  function atualizarNota(alunoId, tipo, idItem, valor) {
    setBoletim(prev => {
      const atual = prev[alunoId] || { notas: {}, notaExtra: 0 };
      const novo = {
        ...atual,
        notas: { ...atual.notas, [`${tipo}-${idItem}`]: Number(valor) || 0 },
      };
      return { ...prev, [alunoId]: novo };
    });
  }

  function atualizarNotaExtra(alunoId, valor) {
    setBoletim(prev => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], notaExtra: Number(valor) || 0 },
    }));
  }

  function calcularMediaParcial(alunoId) {
    const dados = boletim[alunoId];
    if (!dados) return 0;
    const notas = Object.values(dados.notas || {});
    if (notas.length === 0) return 0;
    const soma = notas.reduce((acc, n) => acc + n, 0);
    return (soma / notas.length).toFixed(1);
  }

  function calcularMediaFinal(alunoId) {
    const parcial = Number(calcularMediaParcial(alunoId));
    const extra = Number(boletim[alunoId]?.notaExtra || 0);
    return (parcial + extra).toFixed(1);
  }

  async function salvarNota(alunoId, tipo, idItem, valor) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turmaId,
          alunoId,
          tipo,          
          itemId: idItem,
          valor: Number(valor),
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
      toast.error("Erro ao salvar nota.");
    }
  }
  async function salvarNotaExtra(alunoId, valor) {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turmaId,
        alunoId,
        tipo: "extra",      
        itemId: "nota_extra", 
        valor: Number(valor),
      }),
    });
    toast.success("Nota extra salva!");
  } catch (err) {
    console.error("Erro ao salvar nota extra:", err);
    toast.error("Erro ao salvar nota extra.");
  }
}


  
  async function handleExcluirMedalha(awardId, alunoId) {
    if (!confirm("Deseja realmente excluir esta medalha?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medalhas/aluno/award/${awardId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir medalha.");
      setMedalhasAlunos(prev => ({
        ...prev,
        [alunoId]: prev[alunoId].filter(m => m.id !== awardId),
      }));
      await removerPontos(user.uid, Math.abs(regrasPontuacao.removerMedalhaAluno), "Removeu medalha");
      mostrarToastPontosRemover(regrasPontuacao.removerMedalhaAluno, "Removeu medalha");
      toast.success("Medalha excluída!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir medalha.");
    }
  }

  async function handleEditarMedalha(awardId, alunoId, newTemplateId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medalhas/aluno/award/${awardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTemplateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao editar medalha.");
      setMedalhasAlunos(prev => ({
        ...prev,
        [alunoId]: prev[alunoId].map(m => (m.id === awardId ? data : m)),
      }));
      toast.success("Medalha atualizada!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao editar medalha.");
    }
  }


  const humorIcone =
    pontos < 25 ? <TbMoodSadSquint color="red" size={40} /> :
    pontos < 50 ? <FaRegFaceGrinBeamSweat color="orange" size={40} /> :
    <BiHappyHeartEyes color="green" size={40} />;

  const humorLabel =
    pontos < 25 ? "Triste 😢" :
    pontos < 50 ? "Feliz 😊" : "Apaixonado 😍";

  const corHumor =
    pontos < 25 ? "red" :
    pontos < 50 ? "orange" : "green";

  return (
    <div className="layout">
      <ToastContainer position="bottom-right" theme="colored" />
      <MenuLateralProfessor />
      <div className="page2">
        <main className="notas">
          <MenuTopoProfessor />

          
          <div className="meu-ranking">
            {!perfil ? (
              <p>Carregando perfil...</p>
            ) : (
              <img
                src={preview || perfil?.foto || "/src/assets/user-placeholder.png"}
                alt="Foto do usuário"
                className="foto-circulo-ranking"
                onError={(e) => (e.target.src = "/src/assets/user-placeholder.png")}
              />
            )}

            <div className="status-pontuacao">
              <p className="meus-pontos">Meus pontos</p>
              <p className="pontos">{pontos} pontos</p>
              <p style={{ color: corHumor }}>{humorLabel}</p>
            </div>
          </div>

         
          <section className="selecao-turma">
            <label>
              Turma:
              <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
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
            <section className="boletim-section">
              <h3 className="titulo-boletim">
                <FaBook /> Boletim da Turma
              </h3>

             
              {alunos.length === 0 ? (
                <p className="mensagem-vazia">
                  ⚠️ Nenhum aluno cadastrado nesta turma ainda.
                </p>
              ) : (
                <div className="boletim-tabela-container">
                  <table className="boletim-tabela">
                    <thead>
                      <tr>
                        <th>Aluno</th>
                        {atividades.map((a) => (
                          <th key={`atv-${a.id}`}>{a.titulo}</th>
                        ))}
                        {avaliacoes.map((av) => (
                          <th key={`av-${av.id}`}>{av.titulo}</th>
                        ))}
                        <th>Média Parcial</th>
                        <th>Nota Extra</th>
                        <th>Média Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunos.map((aluno) => {
                        const dadosAluno = boletim[aluno.id] || {};
                        const notasAtividades = atividades.map(
                          (a) => dadosAluno.notas?.[`atividade-${a.id}`] || 0
                        );
                        const notasAvaliacoes = avaliacoes.map(
                          (av) => dadosAluno.notas?.[`avaliacao-${av.id}`] || 0
                        );

                       
                        const todasNotasZeradas = [
                          ...notasAtividades,
                          ...notasAvaliacoes,
                          dadosAluno.notaExtra || 0,
                        ].every((n) => n === 0);

                        return (
                          <tr key={aluno.id}>
                            <td>
                              <strong>{aluno.nome}</strong>
                            </td>

                           
                            {atividades.map((a) => (
                              <td key={`atv-${aluno.id}-${a.id}`}>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={
                                    boletim[aluno.id]?.notas?.[`atividade-${a.id}`] || ""
                                  }
                                  onChange={(e) => {
                                    atualizarNota(aluno.id, "atividade", a.id, e.target.value);
                                    salvarNota(aluno.id, "atividade", a.id, e.target.value);
                                  }}
                                />
                              </td>
                            ))}

                           
                            {avaliacoes.map((av) => (
                              <td key={`av-${aluno.id}-${av.id}`}>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={
                                    boletim[aluno.id]?.notas?.[`avaliacao-${av.id}`] || ""
                                  }
                                  onChange={(e) => {
                                    atualizarNota(aluno.id, "avaliacao", av.id, e.target.value);
                                    salvarNota(aluno.id, "avaliacao", av.id, e.target.value);
                                  }}
                                />
                              </td>
                            ))}

                            <td>{calcularMediaParcial(aluno.id)}</td>
                            <td style={{ backgroundColor: "#e6f7e6", fontWeight: "bold" }}>
                             <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={boletim[aluno.id]?.notaExtra || ""}
                                onChange={(e) => {
                                  const valor = e.target.value;
                                  atualizarNotaExtra(aluno.id, valor);
                                  salvarNotaExtra(aluno.id, valor); 
                                }}
                              />

                            </td>
                            <td>{calcularMediaFinal(aluno.id)}</td>

                           
                            {todasNotasZeradas && (
                              <td colSpan={3}>
                                <p className="aviso-notas-zeradas">
                                  ⚠️ Nenhuma nota lançada ainda.
                                </p>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

        
          {turmaId && (
            <section className="lista-alunos-medalhas-view">
              <h3>🏅 Medalhas dos Alunos</h3>
              {alunos.length === 0 ? (
                <p>Nenhum aluno nesta turma.</p>
              ) : (
                alunos.map((aluno) => (
                  <div key={aluno.id} className="aluno-item">
                    <strong>{aluno.nome}</strong>
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
                              onChange={(e) => handleEditarMedalha(m.id, aluno.id, e.target.value)}
                            >
                              <option value="">Editar</option>
                              {medalhasProfessor.map((tpl) => (
                                <option key={tpl.id} value={tpl.id}>
                                  {tpl.title}
                                </option>
                              ))}
                            </select>
                            <button className="btn-excluir-mini" onClick={() => handleExcluirMedalha(m.id, aluno.id)}>
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
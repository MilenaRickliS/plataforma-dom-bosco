import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, NavLink, Link } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import axios from "axios";
import { FaPaperclip, FaClock, FaBookOpen, FaCalendarAlt, FaCheckCircle, FaLink } from "react-icons/fa";
import { getAlunosDaTurma } from "../../../services/turma"; 
import { TiUpload } from "react-icons/ti";
import ChatPrivado from "../../../components/portais/ChatPrivado";
import { IoChatbubblesOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  removerPontos,
  mostrarToastPontosRemover,
  regrasPontuacao
} from "../../../services/gamificacao.jsx";


export default function AtivDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const { user } = useContext(AuthContext);
  const [publicacao, setPublicacao] = useState(null);
  const [turma, setTurma] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [resumoRespostas, setResumoRespostas] = useState({ alunos: [] });
  const [carregando, setCarregando] = useState(true);
  const API = import.meta.env.VITE_API_URL;
  const [entregas, setEntregas] = useState([]);
const [salvandoNota, setSalvandoNota] = useState(false);
const [chatAlunoSelecionado, setChatAlunoSelecionado] = useState(null);


  useEffect(() => {
    if (!id || !user?.uid) return;
    const carregar = async () => {
      try {
        setCarregando(true);
       
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];
        const encontrada = todas.find((p) => p.id === id);
        setPublicacao(encontrada || null);

       
        if (encontrada?.turmaId) {
          const turmaRes = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
          const lista = turmaRes.data || [];
          const t = lista.find((t) => t.id === encontrada.turmaId);
          setTurma(t || null);

          
          const alunosLista = await getAlunosDaTurma(encontrada.turmaId);
          setAlunos(alunosLista || []);
        }

        if (encontrada?.tipo === "atividade") {
          const entregasRes = await axios.get(`${API}/api/entregas?atividadeId=${id}`);
          setEntregas(entregasRes.data || []);
        }


        
        if (encontrada?.tipo === "avaliacao") {
          const qs = await axios.get(`${API}/api/questoes`, { params: { avaliacaoId: id } });
          setQuestoes(qs.data || []);
        }

        
        if (encontrada?.tipo === "avaliacao") {
          try {
            const { data: resp } = await axios.get(`${API}/api/avaliacoes/respostas`, {
              params: { avaliacaoId: id },
            });
            setResumoRespostas(resp || { alunos: [] });
          } catch (e) {
            console.warn("Sem respostas agregadas ainda.");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id, user, API]);

  const respondedores = useMemo(() => new Set((resumoRespostas.alunos||[]).map(a => a.alunoId)), [resumoRespostas]);
  const progresso = useMemo(() => {
    const total = alunos.length || 1;
    const feitos = respondedores.size;
    const pct = Math.round((feitos / total) * 100);
    return { feitos, total, pct };
  }, [alunos, respondedores]);

  if (carregando) return <p className="info">Carregando detalhes...</p>;
  if (!publicacao) return <p className="info">Atividade não encontrada.</p>;

  const formatarData = (valor) => {
    if (!valor) return "—";

    let data;

    
    if (valor._seconds) {
      data = new Date(valor._seconds * 1000);
    }
    
    else if (valor instanceof Date) {
      data = valor;
    }
   
    else if (typeof valor === "string" && !isNaN(Date.parse(valor))) {
      data = new Date(valor);
    } else {
      return "—";
    }

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSalvarNota = async (entregaId, nota) => {
    try {
      setSalvandoNota(true);
      await axios.patch(`${API}/api/entregas?id=${entregaId}`, { nota });
      toast.success("Nota atualizada!");
      setEntregas(prev =>
        prev.map(e => (e.id === entregaId ? { ...e, nota } : e))
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar nota.");
    } finally {
      setSalvandoNota(false);
    }
  };



  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

 
  const embaralharRespostas = !!publicacao?.configuracoes?.embaralharRespostas;

 
  const verificarAtraso = (entrega, publicacao) => {
    if (!entrega?.enviadaEm || !publicacao?.entrega) return false;

    let prazo, enviada;

  
    if (publicacao.entrega._seconds)
      prazo = new Date(publicacao.entrega._seconds * 1000);
    else if (typeof publicacao.entrega === "string" && !isNaN(Date.parse(publicacao.entrega)))
      prazo = new Date(publicacao.entrega);

    if (entrega.enviadaEm._seconds)
      enviada = new Date(entrega.enviadaEm._seconds * 1000);
    else if (typeof entrega.enviadaEm === "string" && !isNaN(Date.parse(entrega.enviadaEm)))
      enviada = new Date(entrega.enviadaEm);

    return enviada > prazo;
  };

  
  return (
    <div className="layout">
      
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />

          <div className="menu-turma">
            <NavLink to={`/professor/turma/${publicacao.turmaId || ""}`}>Painel</NavLink>
            <NavLink to={`/professor/atividades/${publicacao.turmaId || ""}`}>Todas as atividades</NavLink>
            <NavLink to={`/professor/alunos-turma/${publicacao.turmaId || ""}`}>Alunos</NavLink>
          </div>

          <div
            className="titulo-sala-alunos"
            style={{
              backgroundImage: turma?.imagem
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${turma.imagem})`
                : "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/src/assets/fundo-turma-padrao.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "#fff",
              padding: "2rem",
              borderRadius: "12px",
            }}
          >
            <div>
              <h3>{titulo}</h3>
              <p>{subtitulo}</p>
            </div>
          </div>
          <br/>
          <section className="sessao-chat-privado-geral">
        <div className="div-chat-privado-geral">
          <h3><IoChatbubblesOutline /> Chat Privado com Aluno</h3>
          <p className="info-chat-privado">
            Esta conversa é privada e vinculada à atividade <strong>{publicacao.titulo}</strong>.
          </p>

          <div className="chat-privado-selecao">
            <label htmlFor="aluno-select">Escolha um aluno:</label>
            <select
              id="aluno-select"
              value={chatAlunoSelecionado?.uid || chatAlunoSelecionado?.id || ""}
              onChange={(e) => {
                const valor = e.target.value;
                const aluno = alunos.find(
                  (a) => a.uid === valor || a.id === valor
                );
                
                setChatAlunoSelecionado(aluno || null);
              }}
            >
              <option value="">Selecione...</option>
              {alunos.map((al, i) => (
                <option key={al.uid || al.id || i} value={al.uid || al.id || `aluno-${i}`}>
                  {al.nome || `Aluno ${i + 1}`}
                </option>
              ))}
            </select>


            <button
              className="btn-chat-privado-abrir"
              disabled={!chatAlunoSelecionado}
              onClick={() => setChatAlunoSelecionado(chatAlunoSelecionado)}
            >
              {chatAlunoSelecionado
                ? `Abrir chat com ${chatAlunoSelecionado.nome}`
                : "Abrir Chat"}
            </button>
          </div>
        </div>

        {chatAlunoSelecionado && (
          <div className="overlay-chat-privado" onClick={() => setChatAlunoSelecionado(null)}>
            <div className="modal-chat-privado" onClick={(e) => e.stopPropagation()}>
              <ChatPrivado
                atividadeId={id}
                aluno={chatAlunoSelecionado}
                nomeAtividade={publicacao.titulo}
              />

              <button
                className="btn-fechar-chat-privado"
                onClick={() => setChatAlunoSelecionado(null)}
              >
                <IoClose />
              </button>
            </div>
          </div>
        )}
      </section><br/>

          <section className="detalhes-atividade">
            <div className="div-detalhes">
              <div>
                <div className="acoes-editar-excluir-atividade">
                <button
                  className="btn-editar-ativ"
                  onClick={() => navigate(`/edit-atividade-professor/${id}`)}
                >
                  <MdEdit /> Editar
                </button>

                <button
                className="btn-excluir-ativ"
                onClick={async () => {
                  if (!confirm("Tem certeza que deseja excluir esta atividade?")) return;

                  try {
                    await axios.delete(`${API}/api/publicacoes?id=${id}`);
                    toast.success("Atividade excluída com sucesso!");
                        await removerPontos(
                        user.uid,
                        regrasPontuacao.excluirAtividade,
                        `Excluiu a atividade "${publicacao?.titulo || "sem título"}"`
                      );
                      mostrarToastPontosRemover(
                        regrasPontuacao.excluirAtividade,
                        "Excluiu uma atividade"
                      );
                    
                    setTimeout(() => {
                      navigate(`/professor/turma/${publicacao.turmaId || ""}`);
                    }, 1500);
                  } catch (err) {
                    console.error(err);
                    toast.error("Erro ao excluir atividade.");
                  }
                }}
              >
                <FaTrashAlt /> Excluir
              </button>

              </div><br/>

                <h2>{publicacao.titulo || "Sem título"} - {publicacao.tipo}</h2>
           
                <p className="data-publicacao"><strong>Criada em:</strong> {formatarData(publicacao.criadaEm)}</p>
            
                
              </div>
              
              <div>
                 {(publicacao.entrega || publicacao.valor) && (
                  <div className="card-prazo">
                    {publicacao.entrega && (
                      <>
      
                        <p style={{ fontWeight: "600", margin: 0, color: "#b6a50cff"}}>
                          Prazo: {formatarData(publicacao.entrega)} -  {(() => {
                          if (!publicacao.entrega) return "—";
                          if (typeof publicacao.entrega === "string" && /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(publicacao.entrega)) {
                            const [_, horaStr] = publicacao.entrega.split(" ");
                            return horaStr;
                          } else if (publicacao.entrega?._seconds) {
                            return new Date(publicacao.entrega._seconds * 1000)
                              .toTimeString()
                              .slice(0, 5);
                          }
                          return "—";
                        })()}

                          
                        </p>
                      </>
                    )}
                    {publicacao.valor ? (
                      <p style={{ marginTop: "5px", fontWeight: "600", color: "#25643cff" }}>
                        Valor Atividade: {publicacao.valor} 
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>
            
            </div>
            <h3><FaBookOpen /> Descrição</h3>
                <p className="descricao-ativ">{publicacao.descricao || "Sem descrição"}</p>
            <div className="info-bloco" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="info-esquerda">
              {publicacao.tipo === "avaliacao" && (
                <>
                 <p><strong>Config:</strong> {publicacao?.configuracoes?.embaralharRespostas ? "Embaralhar respostas" : "Ordem fixa"} • {publicacao?.configuracoes?.permitirRepeticoes ? `Até ${publicacao?.configuracoes?.tentativasMax} tentativas` : "1 tentativa"}</p>
                <div className="progresso-avaliacao">
                    <br/><Link to={`/professor/avaliacao/${id}/respostas`}>Ver respostas</Link>
                  </div>
                </>
              )}
            </div>
          </div>


            {publicacao.anexos?.length > 0 && (
              <div className="anexos-detalhes">
                <h3><FaPaperclip /> Anexos</h3>
                <ul>
                  {publicacao.anexos.map((a, i) => (
                    <li key={i}>
                      <a href={a.url} target="_blank" rel="noreferrer" className="anexo-card">
                        <span className="nome-anexo">{a.nome || "Arquivo anexado"}</span>
                        <span className="url-anexo">{a.url}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            
            {publicacao.tipo === "avaliacao" && (
              <div className="bloco-questoes">
                <h3>Questões ({questoes.length})</h3>
                <ul className="lista-questoes">
                  {questoes
                    .sort((a,b) => (a.ordem||0) - (b.ordem||0))
                    .map((q, idx) => {
                      const alternativas = Array.isArray(q.alternativas) ? [...q.alternativas] : [];
                     
                      if (embaralharRespostas) alternativas.sort(() => Math.random()-0.5);

                      return (
                        <li key={q.id || idx} className="item-questao">
                          <div className="cabecalho-questao">
                            <strong>Q{q.ordem || idx+1}</strong>
                            {q.obrigatoria && <span className="badge">Obrigatória</span>}
                            {typeof q.valor === "number" && <span className="badge">{q.valor} pts</span>}
                            <span className="badge">{q.tipo}</span>
                          </div>
                          <p className="enunciado">{q.enunciado}</p>
                          {q.imagem?.url && (
                            <div className="imagem-questao">
                              <img alt="Imagem da questão" src={q.imagem.url} />
                            </div>
                          )}

                          {q.tipo === "multipla" && alternativas.length > 0 && (
                            <ol className="alternativas">
                              {alternativas.map((alt) => (
                                <li key={alt.id || alt.texto}>
                                  <span>{alt.texto}</span>
                                  {alt.correta && <em className="flag-correta"> (correta)</em>}
                                </li>
                              ))}
                            </ol>
                          )}

                          {q.tipo === "correspondencia" && (
                          <div className="corresp-view">
                            <h4>Gabarito de Correspondência</h4>
                            <table className="tabela-corresp">
                              <thead>
                                <tr>
                                  <th>Item (Coluna A)</th>
                                  <th>Corresponde a (Coluna B)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(q.colA || []).map((itemA, i) => (
                                  <tr key={`corresp-${i}`}>
                                    <td data-label="Item (Coluna A)">{itemA}</td>
                                    <td data-label="Corresponde a (Coluna B)">{q.gabarito?.[itemA] || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}


                          {q.tipo === "dissertativa" && q.textoEsperado && (
                            <div className="texto-esperado">
                              <em>Texto esperado (referência):</em>
                              <p>{q.textoEsperado}</p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </section>

           <br/>
            {publicacao.tipo === "atividade" && (
           <section className="sessao-entrega">
            <div className="div-entrega">
              <h3><TiUpload /> Entregas dos alunos</h3>
            </div>

            <table className="tabela-entregas">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Status</th>
                  <th>Data de Entrega</th>
                  <th>Arquivos / Links</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => {
                  const ent = entregas.find((e) => e.alunoId === aluno.uid || e.alunoId === aluno.id);

                  return (
                    <tr key={aluno.uid}>
                      <td>{aluno.nome}</td>
                      <td>
                        {ent?.entregue ? (
                          <span className={`tag ${verificarAtraso(ent, publicacao) ? "atrasada" : "pontual"}`}>
                            {verificarAtraso(ent, publicacao) ? "Atrasada" : "Pontual"}
                          </span>
                        ) : (
                          <span className="tag pendente">Pendente</span>
                        )}
                      </td>

                      <td>
                      {(() => {
                        if (!ent?.enviadaEm) return "—";
                        let data;

                       
                        if (ent.enviadaEm._seconds) {
                          data = new Date(ent.enviadaEm._seconds * 1000);
                        } 
                       
                        else if (typeof ent.enviadaEm === "string" && !isNaN(Date.parse(ent.enviadaEm))) {
                          data = new Date(ent.enviadaEm);
                        } 
                   
                        else if (ent.enviadaEm instanceof Date) {
                          data = ent.enviadaEm;
                        } 
                        else {
                          return "—";
                        }

                        return data.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        });
                      })()}
                    </td>

                      <td>
                        {ent?.anexos?.length ? (
                          <ul className="mini-anexos">
                            {ent.anexos.map((a, i) => (
                              <li key={`${a.url || a.nome || "anexo"}-${i}`}>
                                <a
                                  href={a.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="link-arquivo"
                                >
                                  {a.tipo === "arquivo" ? <FaPaperclip /> : <FaLink />}{" "}
                                  {a.nome || "Link"}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {ent ? (
                          <input
                            type="number"
                            min="0"
                            max={publicacao?.valor || 10}
                            defaultValue={ent.nota || ""}
                            className="input-nota"
                            onBlur={(e) => {
                              const novaNota = parseFloat(e.target.value);
                              if (!isNaN(novaNota)) {
                                handleSalvarNota(ent.id, novaNota);
                              }
                            }}
                            disabled={salvandoNota}
                          />

                        ) : (
                          "-"
                        )}
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <br/>
            <button
              className="btn-liberar-notas"
              onClick={async () => {
                try {
                  await axios.patch(`${API}/api/publicacoes?id=${id}`, { notasLiberadas: true });
                  toast.success("Notas liberadas para os alunos!");
                  setPublicacao((prev) => ({ ...prev, notasLiberadas: true }));
                } catch (err) {
                  toast.error("Erro ao liberar notas.");
                }
              }}
            >
              Liberar notas para os alunos
            </button>

          </section>
          
            )}
        

      
      


        </main>
      </div>
    </div>
  );
}

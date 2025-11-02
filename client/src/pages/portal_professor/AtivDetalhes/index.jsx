import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, NavLink, Link } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import axios from "axios";
import { FaPaperclip, FaClock, FaBookOpen, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { getAlunosDaTurma } from "../../../services/turma"; 

export default function AtivDetalhes() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [publicacao, setPublicacao] = useState(null);
  const [turma, setTurma] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [resumoRespostas, setResumoRespostas] = useState({ alunos: [] });
  const [carregando, setCarregando] = useState(true);
  const API = import.meta.env.VITE_API_URL;

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

  const formatarData = (dataIsoOuTs) => {
    if (!dataIsoOuTs) return "—";
    const data = dataIsoOuTs?._seconds
      ? new Date(dataIsoOuTs._seconds * 1000)
      : new Date(dataIsoOuTs);
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

 
  const embaralharRespostas = !!publicacao?.configuracoes?.embaralharRespostas;

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

          <section className="detalhes-atividade">
            <div className="div-detalhes">
              <div>
                <h2>{publicacao.titulo || "Sem título"} - {publicacao.tipo}</h2>
           
                <p className="data-publicacao"><strong>Criada em:</strong> {formatarData(publicacao.criadaEm)}</p>
            
                
              </div>
              
              <div>
                 {(publicacao.entrega || publicacao.valor) && (
                  <div className="card-prazo">
                    {publicacao.entrega && (
                      <>
      
                        <p style={{ fontWeight: "600", margin: 0, color: "#b6a50cff"}}>
                          Prazo: {formatarData(publicacao.entrega)} -  {new Date(publicacao.entrega._seconds * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          
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
                    <p><FaCheckCircle /> Progresso: {progresso.feitos}/{progresso.total} alunos ({progresso.pct}%)</p>
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
                              <div><strong>Coluna A</strong>
                                <ul>{(q.colA||[]).map((t,i)=> <li key={`A-${i}`}>{t}</li>)}</ul>
                              </div>
                              <div><strong>Coluna B</strong>
                                <ul>{(q.colB||[]).map((t,i)=> <li key={`B-${i}`}>{t}</li>)}</ul>
                              </div>
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
        </main>
      </div>
    </div>
  );
}

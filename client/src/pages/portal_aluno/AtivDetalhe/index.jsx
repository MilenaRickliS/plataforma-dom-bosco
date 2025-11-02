import { useEffect, useState, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import { FaPaperclip, FaBookOpen, FaCheckCircle, FaClock, FaLink } from "react-icons/fa";
import { TiUpload } from "react-icons/ti";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AtivDetalhesAluno() {
  const { id } = useParams(); 
  const { user } = useContext(AuthContext);
  const [publicacao, setPublicacao] = useState(null);
  const [turma, setTurma] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [arquivos, setArquivos] = useState([]);
  const [link, setLink] = useState("");

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
          const turmaRes = await axios.get(`${API}/api/turmas?id=${encontrada.turmaId}`);
          setTurma(turmaRes.data || null);
        }

       
        const entregasRes = await axios.get(`${API}/api/entregas?atividadeId=${id}&alunoId=${user.uid}`);
        setEntrega(entregasRes.data?.[0] || null);
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id, user, API]);

  const formatarData = (valor) => {
    if (!valor) return "—";
    const data =
      valor._seconds != null ? new Date(valor._seconds * 1000) : new Date(valor);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };


   const handleUploadArquivos = async (files) => {
      try {
        if (!files || files.length === 0) return;

        
        const nomesExistentes = (entrega?.anexos || [])
          .filter(a => a.tipo === "arquivo")
          .map(a => a.nome);

        const novosUnicos = Array.from(files).filter(
          f => !nomesExistentes.includes(f.name)
        );

        if (novosUnicos.length === 0) {
          toast.error("Todos os arquivos selecionados já foram adicionados.");
          return;
        }

        if (novosUnicos.length < files.length) {
          toast.warn("Alguns arquivos já existiam e foram ignorados.");
        }

        setEnviando(true);
        const anexos = [];

        for (const file of novosUnicos) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const uploadRes = await fetch(`${API}/api/uploads/base64`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileBase64: base64, folder: "entregas" }),
          });

          const upload = await uploadRes.json();
          anexos.push({ tipo: "arquivo", nome: file.name, url: upload.url });
        }

        const novaEntrega = {
          atividadeId: id,
          alunoId: user.uid,
          anexos: [...(entrega?.anexos || []), ...anexos],
          enviadaEm: new Date().toISOString(),
        };

        await axios.post(`${API}/api/entregas`, novaEntrega);
        setEntrega(novaEntrega);
        setArquivos([]);
        toast.success("Arquivos enviados com sucesso!");
      } catch (err) {
        console.error("Erro ao enviar arquivos:", err);
        toast.error("Erro ao enviar arquivos.");
      } finally {
        setEnviando(false);
      }
    };


  const handleAdicionarLink = async () => {
    const url = link.trim();
    if (!url) return toast.error("Insira um link válido.");

 
    const linksExistentes = (entrega?.anexos || [])
      .filter(a => a.tipo === "link")
      .map(a => a.url);

    if (linksExistentes.includes(url)) {
      toast.error("Este link já foi adicionado.");
      return;
    }

    try {
      const novoAnexo = { tipo: "link", url };
      const novaEntrega = {
        atividadeId: id,
        alunoId: user.uid,
        anexos: [...(entrega?.anexos || []), novoAnexo],
        enviadaEm: new Date().toISOString(),
      };

      await axios.post(`${API}/api/entregas`, novaEntrega);
      setEntrega(novaEntrega);
      setLink("");
      toast.success("Link adicionado com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar link:", err);
      toast.error("Erro ao adicionar link.");
    }
  };

  if (carregando) {
    return <p className="info">Carregando detalhes da atividade...</p>;
  }

  if (!publicacao) {
    return <p className="info">Atividade não encontrada.</p>;
  }

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

  return (
    <div className="layout">
      <ToastContainer position="bottom-right" theme="colored" />
      <MenuLateralAluno />
      <div className="page2">
        <main id="sala">
          <MenuTopoAluno />

         
          <div className="menu-turma">
            <NavLink to={`/aluno/turma/${publicacao.turmaId || ""}`}>Painel</NavLink>
            <NavLink to={`/aluno/atividades/${publicacao.turmaId || ""}`}>
              Todas as atividades
            </NavLink>
            <NavLink to={`/aluno/alunos-turma/${publicacao.turmaId || ""}`}>Alunos</NavLink>
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
          <br />

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

         <br/>
         {publicacao.tipo === "atividade" && (
         <section className="sessao-entrega">
          <div className="div-entrega">
            <h3><TiUpload /> Entrega do aluno</h3>

            <div className="status-entrega">
              {entrega?.entregue ? (
                <div className="status entregue">
                  <FaCheckCircle size={18} />
                  <span>
                    Entregue em {formatarData(entrega.enviadaEm)}{" "}
                    {new Date(entrega.enviadaEm).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ) : (
                <div className="status pendente">
                  <FaClock size={18} />
                  <span>Pendente – ainda não enviada</span>
                </div>
              )}
            </div>
          </div>

         
          {(entrega?.anexos?.length > 0 || arquivos.length > 0) && (
            <ul className="lista-entregas">
             
              {entrega?.anexos?.map((a, i) => (
                <li key={`env-${i}`}>
                  {a.tipo === "arquivo" ? (
                    <>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        <FaPaperclip /> {a.nome}
                      </a>
                      <button
                        className="btn-remover"
                        onClick={() => {
                          const nova = entrega.anexos.filter((_, idx) => idx !== i);
                          setEntrega({ ...entrega, anexos: nova });
                        }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        <FaLink /> {a.url}
                      </a>
                      <button
                        className="btn-remover"
                        onClick={() => {
                          const nova = entrega.anexos.filter((_, idx) => idx !== i);
                          setEntrega({ ...entrega, anexos: nova });
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </li>
              ))}

              
              {arquivos.map((f, i) => (
                <li key={`novo-${i}`}>
                  <span><FaPaperclip /> {f.name}</span>
                  <button
                    className="btn-remover"
                    onClick={() =>
                      setArquivos(arquivos.filter((_, idx) => idx !== i))
                    }
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

         
          <div className="envio-form">
            <label className="upload-label-entrega" htmlFor="arquivo-upload">
              Selecionar Arquivos
            </label>
            <input
              id="arquivo-upload"
              type="file"
              multiple
              onChange={(e) => setArquivos([...arquivos, ...e.target.files])}
              style={{ display: "none" }}
            />

            <div className="adicionar-link">
              <input
                type="url"
                placeholder="Cole o link aqui"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (!link.trim()) return toast.error("Insira um link válido.");
                  const novoLink = { tipo: "link", url: link.trim() };
                  setEntrega({
                    ...entrega,
                    anexos: [...(entrega?.anexos || []), novoLink],
                  });
                  setLink("");
                  toast.success("Link adicionado!");
                }}
              >
                Adicionar link
              </button>
            </div>

           
            <button
              className={`btn-enviar-entrega ${entrega?.entregue ? "devolver" : ""}`}
              onClick={() => {
                if (!entrega?.entregue) {
                  if (arquivos.length === 0 && (!entrega?.anexos?.length || entrega.anexos.length === 0)) {
                    toast.error("Adicione ao menos um arquivo ou link antes de entregar.");
                    return;
                  }
                  setEntrega({
                    ...entrega,
                    entregue: true,
                    enviadaEm: new Date().toISOString(),
                  });
                  toast.success("Entrega enviada com sucesso!");
                } else {
                  setEntrega({ ...entrega, entregue: false });
                  toast.info("Entrega devolvida para edição.");
                }
              }}
            >
              {entrega?.entregue ? "Devolver" : "Entregar"}
            </button>
          </div>
        </section>

           )}<br/>
        </main>
      </div>
    </div>
  );
}

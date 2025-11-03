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
import ChatPrivado from "../../../components/portais/ChatPrivado";
import { IoChatbubblesOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import {
  adicionarPontos,
  removerPontos,
  mostrarToastPontosAdicionar,
  mostrarToastPontosRemover,
  regrasPontuacao
} from "../../../services/gamificacao";



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
  const [questoes, setQuestoes] = useState([]);
  const [mostrarChatPrivado, setMostrarChatPrivado] = useState(false);



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

      
      if (encontrada?.tipo === "avaliacao") {
        try {
          const qs = await axios.get(`${API}/api/questoes`, { params: { avaliacaoId: id } });
          setQuestoes(qs.data || []);
        } catch (e) {
          console.warn("Nenhuma questão encontrada para esta avaliação.");
        }

        try {
          const resp = await axios.get(`${API}/api/respostas?avaliacaoId=${id}`);
          const respostaAluno = resp.data?.alunos?.find((a) => a.alunoId === user.uid);
          if (respostaAluno) {
            console.log("🔍 Resposta encontrada:", respostaAluno);
            setEntrega({
              ...respostaAluno,
              avaliacaoIniciada: respostaAluno.avaliacaoIniciada || false,
              tentativas: respostaAluno.tentativas || 0,
              notaTotal: respostaAluno.notaTotal || 0,
              entregue: respostaAluno.entregue || false,
            });
          } else {
            console.log("🆕 Nenhuma resposta anterior — primeira tentativa.");
            setEntrega({ avaliacaoIniciada: false, tentativas: 0 });
          }
        } catch (e) {
          console.warn("Erro ao buscar respostas:", e);
          setEntrega({ avaliacaoIniciada: false, tentativas: 0 });
        }
      }

      
      if (encontrada?.tipo === "atividade") {
        try {
          const entregasRes = await axios.get(`${API}/api/entregas?atividadeId=${id}&alunoId=${user.uid}`);
          const first = entregasRes.data?.[0] || null;
          setEntrega(first || null);
        } catch (e) {
          console.warn("Erro ao buscar entrega de atividade:", e);
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

useEffect(() => {
  if (!publicacao || !user?.uid) return;

  const prazo =
    publicacao.entrega?._seconds
      ? new Date(publicacao.entrega._seconds * 1000)
      : new Date(publicacao.entrega);

 
  if (isNaN(prazo)) return;

  const agora = new Date();
  const jaPassou = agora > prazo && (!entrega || !entrega.entregue);

  if (jaPassou) {
    const key = `abandono-${publicacao.id}`;
    if (!localStorage.getItem(key)) {
      removerPontos(
        user.uid,
        regrasPontuacao.abadonarAtividade,
        "Não entregou dentro do prazo"
      );
      mostrarToastPontosRemover(
        regrasPontuacao.abadonarAtividade,
        "Não entregou dentro do prazo"
      );
      localStorage.setItem(key, "true");
    }
  }
}, [publicacao, entrega, user]);


useEffect(() => {
  if (publicacao && user?.uid) {
    
    const key = `vista-${publicacao.id}-${new Date().toDateString()}`;
    if (!localStorage.getItem(key)) {
      adicionarPontos(user.uid, regrasPontuacao.verAtividadeConteudo, "Visualizou a atividade/conteúdo");
      mostrarToastPontosAdicionar(regrasPontuacao.verAtividadeConteudo, "Visualizou a atividade/conteúdo");
      localStorage.setItem(key, "true");
    }
  }
}, [publicacao, user]);



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
    const anexosNovos = [];

    for (const file of novosUnicos) {
      let base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        base64 = base64.replace(/^data:image\/[a-z]+;base64,/, "data:application/pdf;base64,");
      }
      const uploadRes = await fetch(`${API}/api/uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64, folder: "entregas_alunos"  }),
      });
      const upload = await uploadRes.json();
      anexosNovos.push({ tipo: "arquivo", nome: file.name, url: upload.url });
    }

    const resp = await axios.post(`${API}/api/entregas`, {
      atividadeId: id,
      alunoId: user.uid,
      anexos: anexosNovos,
      enviadaEm: new Date().toISOString(),
    });

    const { id: entregaId, data } = resp.data;
    setEntrega((prev) => ({
      ...(prev || {}),
      id: entregaId,
      anexos: data?.anexos || anexosNovos, 
      enviadaEm: data?.enviadaEm || new Date().toISOString(),
      entregue: data?.entregue ?? false,
    }));


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
  const url = (link || "").trim();
  if (!url) return toast.error("Insira um link válido.");

  const linksExistentes = (entrega?.anexos || [])
    .filter(a => a.tipo === "link")
    .map(a => a.url);

  if (linksExistentes.includes(url)) {
    toast.error("Este link já foi adicionado.");
    return;
  }

  try {
    if (!entrega?.id) {
      
      const resp = await axios.post(`${API}/api/entregas`, {
        atividadeId: id,
        alunoId: user.uid,
        anexos: [{ tipo: "link", url }],
        enviadaEm: new Date().toISOString(),
      });
      const { id: entregaId, data } = resp.data;
      setEntrega({ id: entregaId, ...(entrega || {}), ...data });
    } else {
    
      const novos = [ ...(entrega.anexos || []), { tipo: "link", url } ];
      const resp = await axios.patch(`${API}/api/entregas?id=${entrega.id}`, {
        anexos: novos,
        enviadaEm: new Date().toISOString(),
      });
      setEntrega({ id: entrega.id, ...(entrega || {}), ...resp.data.data });
    }

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

 
  const isAtrasada = (() => {
    if (!publicacao?.entrega || !entrega?.enviadaEm) return false;

    let prazo, enviada;

  
    if (publicacao.entrega._seconds)
      prazo = new Date(publicacao.entrega._seconds * 1000);
    else if (typeof publicacao.entrega === "string" && !isNaN(Date.parse(publicacao.entrega)))
      prazo = new Date(publicacao.entrega);
    else
      return false;

   
    if (entrega.enviadaEm?._seconds)
      enviada = new Date(entrega.enviadaEm._seconds * 1000);
    else if (typeof entrega.enviadaEm === "string" && !isNaN(Date.parse(entrega.enviadaEm)))
      enviada = new Date(entrega.enviadaEm);
    else
      return false;

    return enviada > prazo;
  })();

 
  const devolucaoBloqueada = typeof entrega?.nota === "number";


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
          <section className="sessao-chat-privado-aluno">
            <h3><IoChatbubblesOutline /> Chat Privado com o Professor</h3>
            <p className="info-chat-privado">
              Converse com seu professor sobre dúvidas desta atividade:
              <strong> {publicacao.titulo}</strong>.
            </p>

            <button
              className="btn-chat-privado-abrir"
              onClick={() => setMostrarChatPrivado(true)}
            >
              Abrir Chat
            </button>

            {mostrarChatPrivado && (
              <div className="overlay-chat-privado" onClick={() => setMostrarChatPrivado(false)}>
                <div className="modal-chat-privado" onClick={(e) => e.stopPropagation()}>
                  <ChatPrivado
                    atividadeId={id}
                    aluno={user}
                    nomeAtividade={publicacao.titulo}
                  />
                  <button
                    className="btn-fechar-chat-privado"
                    onClick={() => setMostrarChatPrivado(false)}
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
                    {publicacao.notasLiberadas ? (
                      <div
                        style={{
                          background: "#e0f7ea",
                          color: "#25643c",
                          padding: "10px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          marginTop: "8px",
                        }}
                      >
                        <FaCheckCircle color="#25643c" /> Sua nota: {entrega?.notaTotal ?? "—"} / {publicacao.valor ?? 10}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#fff8e1",
                          color: "#b6a50c",
                          padding: "10px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          marginTop: "8px",
                        }}
                      >
                        <FaClock color="#b6a50c" /> As notas ainda não foram liberadas.
                      </div>
                    )}

                  </div>
                )}
              </div>
            
            </div>
            <h3><FaBookOpen /> Descrição</h3>
                <p className="descricao-ativ">{publicacao.descricao || "Sem descrição"}</p>
            <div className="info-bloco" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
           
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
              <section className="sessao-avaliacao">
                <h3>Responda às questões</h3>

                {(() => {
                  if (!publicacao?.configuracoes || entrega === null) {
                    return (
                      <p style={{ color: "#555" }}>
                        Carregando informações da avaliação...
                      </p>
                    );
                  }
                  const tentativasFeitas = Number(entrega?.tentativas || 0);
                  const limite = Number(publicacao?.configuracoes?.tentativasMax || 1);
                  const aindaPodeTentar = tentativasFeitas < limite;


              
                  let prazoExpirado = false;
                  if (publicacao.entrega) {
                    const prazo =
                      publicacao.entrega._seconds
                        ? new Date(publicacao.entrega._seconds * 1000)
                        : new Date(publicacao.entrega);
                    prazoExpirado = new Date() > prazo;
                  }
                  console.log("DEBUG:", { tentativasFeitas, limite, aindaPodeTentar, prazoExpirado });
                  if (!aindaPodeTentar || prazoExpirado) {
                    return (
                      <div className="limite-tentativas" style={{ background: "#fee2e2", padding: "1rem", borderRadius: "8px" }}>
                        <p style={{ color: "#b91c1c", fontWeight: "600" }}>
                          {prazoExpirado
                            ? "⏰ O prazo para realizar esta avaliação expirou. Você não pode mais responder."
                            : `⚠️ Você já atingiu o número máximo de tentativas (${limite}). Avaliação encerrada.`}
                        </p>
                      </div>
                    );
                  }

                
                  if (!entrega?.avaliacaoIniciada) {
                    const tentativasFeitas = entrega?.tentativas || 0;
                    const limite = publicacao.configuracoes?.tentativasMax || 1;
                    const aindaPodeTentar = tentativasFeitas < limite;

                    
                    
                    return (
                      <div className="iniciar-avaliacao">
                        <p>
                          Quando estiver pronto, clique abaixo para começar. O cronômetro (se houver) iniciará automaticamente.
                        </p>
                        <button
                          className="btn-iniciar-avaliacao"
                          disabled={!aindaPodeTentar}
                          style={{
                            backgroundColor: aindaPodeTentar ? "#2563eb" : "#ccc",
                            cursor: aindaPodeTentar ? "pointer" : "not-allowed",
                          }}
                          onClick={async () => {
                            
                            if (!aindaPodeTentar) {
                              toast.error("Você já atingiu o número máximo de tentativas.");
                              return;
                            }

                            
                            let listaQuestoes = [...questoes];
                            if (publicacao.configuracoes?.embaralharQuestoes)
                              listaQuestoes = listaQuestoes.sort(() => Math.random() - 0.5);

                            listaQuestoes = listaQuestoes.map((q) => {
                              if (publicacao.configuracoes?.embaralharRespostas && q.alternativas) {
                                return {
                                  ...q,
                                  alternativas: [...q.alternativas].sort(() => Math.random() - 0.5),
                                };
                              }
                              return q;
                            });

                            setQuestoes(listaQuestoes);
                            await axios.post(`${API}/api/respostas`, {
                              avaliacaoId: id,
                              alunoId: user.uid,
                              iniciouEm: new Date().toISOString(),
                              avaliacaoIniciada: true,
                            });

                            setEntrega({
                              ...entrega,
                              avaliacaoIniciada: true,
                              questoesRespondidas: [],
                            });
                          }}
                        >
                          Iniciar Avaliação
                        </button>
                      </div>
                    );
                  }


                 
                  return (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();

                        const obrigatorias = questoes.filter((q) => q.obrigatoria);
                        const respondidas = entrega.questoesRespondidas || [];
                        const faltando = obrigatorias.filter(
                          (q) => !respondidas.some((r) => r.questaoId === q.id)
                        );
                        if (faltando.length > 0) {
                          toast.error(`Responda todas as ${faltando.length} obrigatórias antes de enviar.`);
                          return;
                        }

                        const total = respondidas.reduce(
                          (acc, r) => acc + (r.valorObtido || 0),
                          0
                        );

                        const novaTentativa = {
                          avaliacaoId: id,
                          alunoId: user.uid,
                          questoes: entrega.questoesRespondidas,
                          notaTotal: total,
                          tentativas: (entrega?.tentativas || 0) + 1,
                        };

                        await axios.post(`${API}/api/respostas`, novaTentativa);
                        setEntrega({
                          ...entrega,
                          ...novaTentativa,
                          avaliacaoIniciada: false,
                        });
                        toast.success("Avaliação enviada!");
                        await adicionarPontos(user.uid, regrasPontuacao.concluirAtividade, "Concluiu avaliação");
                        mostrarToastPontosAdicionar(regrasPontuacao.concluirAtividade, "Concluiu avaliação");

                      }}
                    >
                      {questoes.map((q, i) => (
                        <div key={q.id} className="questao" style={{ marginBottom: "2rem" }}>
                          <p style={{ fontWeight: "600" }}>
                            <strong>Q{i + 1}:</strong> {q.enunciado}{" "}
                             {q.obrigatoria && (
                              <span
                                style={{
                                  color: "#b91c1c",
                                  fontSize: "0.9rem",
                                  fontWeight: "600",
                                  marginLeft: "6px",
                                }}
                              >
                                * Obrigatória
                              </span>
                            )}
                            {q.valor ? (
                              <span style={{ color: "#2563eb", fontSize: "0.9rem", marginLeft: "6px"  }}>({q.valor} pts)</span>
                            ) : null}
                          </p>

                         
                          {q.imagem && (
                            <div style={{ textAlign: "center", margin: "1rem 0" }}>
                              <img
                                src={q.imagem.url}
                                alt={`Imagem da questão ${i + 1}`}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "300px",
                                  borderRadius: "8px",
                                  boxShadow: "0 0 6px rgba(0,0,0,0.15)",
                                }}
                              />
                            </div>
                          )}

                         
                          {q.tipo === "multipla" && (
                            <>
                              {q.alternativas?.filter((a) => a.correta).length > 1 ? (
                               
                                q.alternativas.map((alt, idx) => (
                                  <label key={idx} className="alternativa">
                                    <input
                                      type="checkbox"
                                      name={`q-${q.id}-${idx}`}
                                      value={alt.texto}
                                      onChange={(e) => {
                                        const ja = entrega.questoesRespondidas || [];
                                        let novaLista = ja.filter((r) => r.questaoId !== q.id);

                                        const anterior =
                                          ja.find((r) => r.questaoId === q.id)?.resposta || [];

                                        let novaResposta = [...anterior];
                                        if (e.target.checked) {
                                          novaResposta.push(alt.texto);
                                        } else {
                                          novaResposta = novaResposta.filter((v) => v !== alt.texto);
                                        }

                                        const pontos = q.alternativas
                                          .filter(
                                            (a) => novaResposta.includes(a.texto) && a.correta
                                          )
                                          .reduce(
                                            (acc, _) => acc + q.valor / q.alternativas.length,
                                            0
                                          );

                                        novaLista.push({
                                          questaoId: q.id,
                                          resposta: novaResposta,
                                          valorObtido: pontos,
                                        });

                                        setEntrega({
                                          ...entrega,
                                          questoesRespondidas: novaLista,
                                        });
                                      }}
                                    />
                                    {alt.texto}
                                  </label>
                                ))
                              ) : (
                               
                                q.alternativas.map((alt, idx) => (
                                  <label key={idx} className="alternativa">
                                    <input
                                      type="radio"
                                      name={`q-${q.id}`}
                                      value={alt.texto}
                                      required={q.obrigatoria}
                                      onChange={() => {
                                        const ja = entrega.questoesRespondidas || [];
                                        const novo = ja.filter((r) => r.questaoId !== q.id);
                                        novo.push({
                                          questaoId: q.id,
                                          resposta: alt.texto,
                                          valorObtido: alt.correta ? q.valor : 0,
                                        });
                                        setEntrega({
                                          ...entrega,
                                          questoesRespondidas: novo,
                                        });
                                      }}
                                    />
                                    {alt.texto}
                                  </label>
                                ))
                              )}
                            </>
                          )}
                          {q.tipo === "correspondencia" && (
                            <div className="questao-corresp">
                              <div className="colunas-container">
                                <div className="coluna-esquerda">
                                  <strong>Coluna A</strong>
                                  <ul>
                                    {(q.colA || []).map((itemA, idxA) => (
                                      <li key={idxA}>
                                        {idxA + 1}. {itemA}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="coluna-direita">
                                  <strong>Coluna B</strong>
                                  <ul>
                                    {(q.colB || []).map((itemB, idxB) => {
                                      const respostasQuestao =
                                        entrega.questoesRespondidas?.find((r) => r.questaoId === q.id)?.resposta || {};
                                      const jaEscolhido = respostasQuestao[itemB];

                                      
                                      const usadas = Object.values(respostasQuestao).filter(Boolean);
                                      const opcoesDisponiveis = (q.colA || []).filter(
                                        (a) => !usadas.includes(a) || a === jaEscolhido
                                      );

                                      return (
                                        <li key={idxB}>
                                          <label>
                                            {itemB}:
                                            <select
                                              value={jaEscolhido || ""}
                                              required={q.obrigatoria}
                                              onChange={(e) => {
                                                const ja = entrega.questoesRespondidas || [];
                                                const novaLista = ja.filter((r) => r.questaoId !== q.id);

                                                const respostasAtuais =
                                                  ja.find((r) => r.questaoId === q.id)?.resposta || {};
                                                const novaResposta = { ...respostasAtuais, [itemB]: e.target.value };

                                                novaLista.push({
                                                  questaoId: q.id,
                                                  resposta: novaResposta,
                                                  valorObtido: 0,
                                                });

                                                setEntrega({ ...entrega, questoesRespondidas: novaLista });
                                              }}
                                            >
                                              <option value="">Selecione</option>
                                              {opcoesDisponiveis.map((itemA, idxA) => (
                                                <option key={idxA} value={itemA}>
                                                  {itemA}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {q.tipo === "dissertativa" && (
                            <textarea
                              required={q.obrigatoria}
                              placeholder="Escreva sua resposta"
                              onChange={(e) => {
                                const ja = entrega.questoesRespondidas || [];
                                const novo = ja.filter((r) => r.questaoId !== q.id);
                                novo.push({
                                  questaoId: q.id,
                                  resposta: e.target.value,
                                  valorObtido: 0,
                                });
                                setEntrega({
                                  ...entrega,
                                  questoesRespondidas: novo,
                                });
                              }}
                            />
                          )}
                        </div>
                      ))}

                      <button type="submit" className="btn-enviar-prova">
                        Enviar Avaliação
                      </button>
                    </form>
                  );
                })()}
              </section>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isAtrasada ? (
                      <FaClock size={18} color="#d9534f" />
                    ) : (
                      <FaCheckCircle size={18} color="#25643c" />
                    )}
                      <span style={{ color: isAtrasada ? "#d9534f" : "#25643c", fontWeight: "600" }}>
                      {(() => {
                        if (!entrega?.enviadaEm) return "Entregue — sem data registrada";

                        let dataHora;
                        if (entrega.enviadaEm._seconds)
                          dataHora = new Date(entrega.enviadaEm._seconds * 1000);
                        else if (typeof entrega.enviadaEm === "string" && !isNaN(Date.parse(entrega.enviadaEm)))
                          dataHora = new Date(entrega.enviadaEm);
                        else if (entrega.enviadaEm instanceof Date)
                          dataHora = entrega.enviadaEm;
                        else
                          return "Entregue — formato inválido";

                        const dataFormatada = dataHora.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        });
                        const horaFormatada = dataHora.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return isAtrasada
                          ? `Entregue com atraso em ${dataFormatada} às ${horaFormatada}`
                          : `Entregue em ${dataFormatada} às ${horaFormatada}`;
                      })()}
                    </span>

                    </div>

                   
                    {typeof entrega.nota === "number" ? (
                      <span
                        className="nota-entrega"
                        style={{
                          background: "#25643c",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          fontSize: "0.95rem",
                        }}
                      >
                        Nota: {entrega.nota} / {publicacao?.valor || 10}
                      </span>
                    ) : (
                      <span
                        className="nota-pendente"
                        style={{
                          background: "#b6a50c",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "0.9rem",
                        }}
                      >
                        Aguardando correção
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="status pendente">
                  <FaClock size={18} />
                  <span>Pendente – ainda não enviada</span>
                </div>
              )}
            </div>

          </div>

         
         <ul className="lista-entregas">
          {entrega?.anexos?.map((a, i) => (
            <li key={`env-${i}`}>
              {a.tipo === "arquivo" ? (
                <>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <FaPaperclip /> {a.nome}
                  </a>
                  {!entrega?.entregue && (
                    <button
                      className="btn-remover"
                      onClick={() => {
                        const nova = entrega.anexos.filter((_, idx) => idx !== i);
                        setEntrega({ ...entrega, anexos: nova });
                      }}
                    >
                      ✕
                    </button>
                  )}
                </>
              ) : (
                <>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <FaLink /> {a.url}
                  </a>
                  {!entrega?.entregue && (
                    <button
                      className="btn-remover"
                      onClick={() => {
                        const nova = entrega.anexos.filter((_, idx) => idx !== i);
                        setEntrega({ ...entrega, anexos: nova });
                      }}
                    >
                      ✕
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
                
          <div className="envio-form">
            <label className="upload-label-entrega" htmlFor="arquivo-upload"  style={{
              cursor: entrega?.entregue ? "not-allowed" : "pointer",
              opacity: entrega?.entregue ? 0.6 : 1,
            }}>
              Selecionar Arquivos
            </label>
            <input
              id="arquivo-upload"
              type="file"
              multiple
              disabled={entrega?.entregue}
              onChange={(e) => handleUploadArquivos([...arquivos, ...e.target.files])}
              style={{ display: "none" }}
            />

            <div className="adicionar-link">
              <input
                type="url"
                placeholder="Cole o link aqui"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                 disabled={entrega?.entregue} 
                 style={{
                  cursor: entrega?.entregue ? "not-allowed" : "text",
                  opacity: entrega?.entregue ? 0.6 : 1,
                }}
              />
              <button
                type="button"
                disabled={entrega?.entregue}
                onClick={handleAdicionarLink}
                style={{ cursor: entrega?.entregue ? "not-allowed" : "pointer" }}
              >
                Adicionar link
              </button>

            </div>

           
           <button
              className={`btn-enviar-entrega ${entrega?.entregue ? "devolver" : ""}`}
              disabled={devolucaoBloqueada}
              style={{
                opacity: devolucaoBloqueada ? 0.6 : 1,
                cursor: devolucaoBloqueada ? "not-allowed" : "pointer",
              }}
              onClick={async () => {
                if (devolucaoBloqueada) {
                    toast.info("Esta entrega já foi corrigida e não pode mais ser devolvida.");
                    return;
                  }

                try {
                  const novoEstado = !entrega?.entregue;
                  if (!entrega?.id && novoEstado) {
                    
                    if (arquivos.length === 0 && (!entrega?.anexos?.length || entrega.anexos.length === 0)) {
                      toast.error("Adicione ao menos um arquivo ou link antes de entregar.");
                      return;
                    }
                    
                      const resp = await axios.post(`${API}/api/entregas`, {
                        atividadeId: id,
                        alunoId: user.uid,
                        anexos: entrega?.anexos || [],
                        enviadaEm: new Date().toISOString(),
                        entregue: novoEstado,
                      });
                      const { id: entregaId, data } = resp.data;
                      setEntrega({ id: entregaId, ...data });
                      toast.success("Entrega criada com sucesso!");
                      return;
                  }

                 
                   const resp = await axios.patch(`${API}/api/entregas?id=${entrega.id}`, {
                    entregue: novoEstado,
                    ...(novoEstado ? { enviadaEm: new Date().toISOString() } : {}),
                  });

                  setEntrega({ id: entrega.id, ...(entrega || {}), ...resp.data.data });
                  toast[novoEstado ? "success" : "info"](
                    novoEstado ? "Entrega enviada com sucesso!" : "Entrega devolvida para edição."
                  );
                  if (novoEstado) {
                  const prazo = publicacao.entrega?._seconds
                    ? new Date(publicacao.entrega._seconds * 1000)
                    : new Date(publicacao.entrega);
                  const enviada = new Date();

                  if (enviada > prazo) {
                    await removerPontos(user.uid, regrasPontuacao.atividadeAtrasada, "Entrega atrasada");
                    mostrarToastPontosRemover(regrasPontuacao.atividadeAtrasada, "Entrega atrasada");
                  } else {
                    await adicionarPontos(user.uid, regrasPontuacao.entregarAtividade, "Entrega dentro do prazo");
                    mostrarToastPontosAdicionar(regrasPontuacao.entregarAtividade, "Entrega dentro do prazo");
                  }
                }

                } catch (e) {
                   console.error("Erro ao atualizar entrega:", err);
                  toast.error("Não foi possível atualizar a entrega.");
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

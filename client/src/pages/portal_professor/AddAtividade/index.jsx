import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { addDoc, collection, Timestamp, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { db } from "../../../services/firebaseConnection";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { MdOutlineInsertDriveFile } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

function contarPalavras(str = "") {
  return str.trim().split(/\s+/).filter(Boolean).length;
}


function NovaQuestao({ index, value, onChange, onRemove, onDuplicate }) {
  const [tipo, setTipo] = useState(value?.tipo || "dissertativa");

  useEffect(() => {
    onChange({ ...value, tipo });
    
  }, [tipo]);




  const atualizar = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="questao">
      <div className="questao-header">
        <strong>Questão {index + 1}</strong>
        <div className="opcao-questao">
          <button className="remover" type="button" onClick={onRemove}>Remover</button>
          <button className="duplicar" type="button" onClick={onDuplicate}>Duplicar</button>
        </div>
      </div>

      <label className="checkbox-questoes" style={{marginTop:4}}>
        <input
          type="checkbox"
          checked={!!value?.obrigatoria}
          onChange={(e) => atualizar({ obrigatoria: e.target.checked })}
        />
        <span>Questão obrigatória</span>
      </label>

      <label>
        <p>Tipo da questão</p>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="dissertativa">Resposta escrita</option>
          <option value="multipla">Múltipla escolha</option>
          <option value="correspondencia">Correspondência de colunas</option>
        </select>
      </label>

      <label>
      <p>Enunciado</p>
      <textarea
        value={value?.enunciado || ""}
        onChange={(e) => atualizar({ enunciado: e.target.value })}
        rows={3}
      />
      <small>{contarPalavras(value?.enunciado)}/300 palavras máx</small>
    </label>


      <label>
        <p>Imagem (URL opcional)</p>
        <input
          type="text"
          value={value?.imagem?.url || ""}
          onChange={(e) => atualizar({ imagem: { url: e.target.value } })}
          placeholder="Cole a URL após upload (opcional)"
        />
      </label>

      {tipo === "dissertativa" && (
        <label>
          <p>Texto esperado (opcional)</p>
          <textarea
            value={value?.textoEsperado || ""}
            onChange={(e) => atualizar({ textoEsperado: e.target.value })}
            rows={2}
          />
          <small>{contarPalavras(value?.textoEsperado)}/300 palavras máx</small>
        </label>
      )}

      {tipo === "multipla" && (
        <div>
          <p>Alternativas</p>
          {(value?.alternativas || [{ id: crypto.randomUUID(), texto: "" }]).map((alt, i) => (
            <div key={alt.id} className="alt-row">
              <input
                type="text"
                value={alt.texto}
                onChange={(e) => {
                  const alts = [...(value.alternativas || [])];
                  alts[i] = { ...alt, texto: e.target.value };
                  atualizar({ alternativas: alts });
                }}
                placeholder={`Alternativa ${i + 1}`}
              />
              <label className="checkbox-questoes">
                <input
                  type="checkbox"
                  checked={!!alt.correta}
                  onChange={(e) => {
                    const alts = [...(value.alternativas || [])];
                    alts[i] = { ...alt, correta: e.target.checked };
                    atualizar({ alternativas: alts });
                  }}
                />
                Correta
              </label>
              <button
              className="remover"
                type="button"
                onClick={() => {
                  const alts = (value.alternativas || []).filter((a) => a.id !== alt.id);
                  atualizar({ alternativas: alts });
                }}
              >
                Remover
              </button>
            </div>
          ))}
          <button
          className="button"
            type="button"
            onClick={() => {
              const alts = [...(value.alternativas || [])];
              alts.push({ id: crypto.randomUUID(), texto: "" });
              atualizar({ alternativas: alts });
            }}
          >
            + Alternativa
          </button>
            <br/>  <br/>  
          <label className="checkbox-questoes">
            <p>Permitir mais de uma resposta correta?</p>
            <input
              type="checkbox"
              checked={!!value?.permiteMultiplas}
              onChange={(e) => atualizar({ permiteMultiplas: e.target.checked })}
            />
          </label>
        </div>
      )}

      {tipo === "correspondencia" && (
        <div className="corresp-grid">
          <div>
            <p>Coluna A</p>
            {(value?.colA || [""]).map((txt, i) => (
              <div key={`A-${i}`} className="pair-row">
                <input
                  type="text"
                  value={txt}
                  onChange={(e) => {
                    const arr = [...(value.colA || [])];
                    arr[i] = e.target.value;
                    atualizar({ colA: arr });
                  }}
                />
                <button
                className="remover"
                  type="button"
                  onClick={() => {
                    const arr = [...(value.colA || [])];
                    arr.splice(i, 1);
                    atualizar({ colA: arr });
                  }}
                >
                  Remover
                </button>
              </div>
            ))}
            <button
            className="button"
              type="button"
              onClick={() => atualizar({ colA: [ ...(value.colA || []), "" ] })}
            >
              + Item A
            </button>
          </div>

          <div>
            <p>Coluna B</p>
            {(value?.colB || [""]).map((txt, i) => (
              <div key={`B-${i}`} className="pair-row">
                <input
                  type="text"
                  value={txt}
                  onChange={(e) => {
                    const arr = [...(value.colB || [])];
                    arr[i] = e.target.value;
                    atualizar({ colB: arr });
                  }}
                />
                <button
                className="remover"
                  type="button"
                  onClick={() => {
                    const arr = [...(value.colB || [])];
                    arr.splice(i, 1);
                    atualizar({ colB: arr });
                  }}
                >
                  Remover
                </button>
              </div>
            ))}
            <button
             className="button"
              type="button"
              onClick={() => atualizar({ colB: [ ...(value.colB || []), "" ] })}
            > 
              + Item B
            </button>
          </div>
        </div>
      )}

      <label>
        <p>Valor da questão (opcional)</p>
        <input
          type="number"
          min="0"
          value={value?.valor ?? ""}
          onChange={(e) => atualizar({ valor: e.target.value ? Number(e.target.value) : undefined })}
        />
      </label>
    </div>
  );
}
async function uploadArquivo(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "materiais_professor");
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Erro ao enviar arquivo");
  return await response.json();
}


export default function AddPublicacao() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tipo, setTipo] = useState("conteudo"); 
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [anexos, setAnexos] = useState([]); 
  const [link, setLink] = useState("");

  const [data, setData] = useState("");
  const [hora, setHora] = useState("23:59");
  const [valor, setValor] = useState("");
  const [conteudosSugeridos, setConteudosSugeridos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const { id: paramId } = useParams();
  const [id, setId] = useState(paramId || null);
   const [configRespostasMultiplas, setConfigRespostasMultiplas] = useState(true);
  const [questoes, setQuestoes] = useState([]);
  const [nomeAnexo, setNomeAnexo] = useState("");
  const [dataAval, setDataAval] = useState("");     
  const [horaAval, setHoraAval] = useState("23:59");
  const [embaralharRespostas, setEmbaralharRespostas] = useState(true);
  const [permitirRepeticoes, setPermitirRepeticoes] = useState(false);
  const [tentativasMax, setTentativasMax] = useState(1);



  useEffect(() => {
    if (!paramId) {
      try {
        const lastId = localStorage.getItem("lastTurmaId");
        if (lastId) setId(lastId);
      } catch {}
    }
  }, [paramId]);

 

 useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        let turmaId = null;
        try { turmaId = localStorage.getItem("lastTurmaId"); } catch {}
        const filtros = [where("usuarioId", "==", user.uid)];
        if (turmaId) filtros.push(where("turmaId", "==", turmaId));
        const qy = query(collection(db, "publicacoes"), ...filtros);
        const snap = await getDocs(qy);
        const s = new Set();
        snap.forEach((doc) => {
          const c = doc.data()?.conteudo;
          if (c && typeof c === "string") s.add(c.trim());
        });
        setConteudosSugeridos(Array.from(s).sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        console.error("Erro ao carregar conteúdos:", e);
      }
    })();
  }, [user]);


  const addAnexoFile = async (file) => {
    const r = await uploadArquivo(file);
    setAnexos((prev) => [...prev, { kind: "file", url: r.url, nome: file.name }]);
    setNomeAnexo(file.name);
    toast.success("Arquivo anexado!");
  };


  const addAnexoLink = () => {
    if (!link.trim()) return toast.error("Cole um link válido.");
    if (!validarURL(link)) return toast.error("URL inválida.");
    if (anexos.some((a) => a.url === link.trim()))
      return toast.warning("Esse link já foi adicionado!");
    
    setAnexos((prev) => [...prev, { kind: "link", url: link.trim() }]);
    setLink("");
  };


  const removerAnexo = (url) => setAnexos((prev) => prev.filter((a) => a.url !== url));


function validarTextoBasico(str) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,\-–—]+$/.test(str.trim());
}
function contarPalavras(str = "") {
  return str.trim().split(/\s+/).filter(Boolean).length;
}
function validarURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}


function validarQuestao(q, index) {
  const erros = [];
  if (!q.tipo) erros.push(`Questão ${index + 1}: tipo é obrigatório`);
  if (!q.enunciado?.trim()) erros.push(`Questão ${index + 1}: enunciado é obrigatório`);
  if (contarPalavras(q.enunciado) > 300)
    erros.push(`Questão ${index + 1}: enunciado excede 300 palavras`);

  if (q.imagem?.url && !validarURL(q.imagem.url))
    erros.push(`Questão ${index + 1}: URL da imagem inválida`);

  if (q.valor && isNaN(q.valor))
    erros.push(`Questão ${index + 1}: valor deve ser numérico`);

  if (q.tipo === "dissertativa" && q.textoEsperado) {
    if (contarPalavras(q.textoEsperado) > 300)
      erros.push(`Questão ${index + 1}: texto esperado excede 300 palavras`);
  }

  if (q.tipo === "multipla") {
    const alts = q.alternativas || [];
    if (alts.length < 2)
      erros.push(`Questão ${index + 1}: precisa ter ao menos 2 alternativas`);
    if (!alts.some((a) => a.correta))
      erros.push(`Questão ${index + 1}: precisa ter pelo menos 1 alternativa correta`);
  }

  if (q.tipo === "correspondencia") {
    const a = q.colA || [];
    const b = q.colB || [];
    if (a.length < 2 || b.length < 2)
      erros.push(`Questão ${index + 1}: precisa de ao menos 2 pares em cada coluna`);
  }

  return erros;
}


const handleSalvar = async (e) => {
  e.preventDefault();

 
  if (!titulo.trim()) return toast.error("Informe o título.");
  if (!validarTextoBasico(titulo))
    return toast.error("Título contém caracteres inválidos.");

  if (!descricao.trim()) return toast.error("Descrição é obrigatória.");
  if (contarPalavras(descricao) > 150)
    return toast.error("Descrição não pode ultrapassar 150 palavras.");

  if (!conteudo.trim()) return toast.error("Informe o conteúdo.");
  if (!validarTextoBasico(conteudo))
    return toast.error("Conteúdo contém caracteres inválidos.");

  if (valor && isNaN(valor))
    return toast.error("O campo valor deve conter apenas números.");

  if (link && !validarURL(link))
    return toast.error("O link informado não é uma URL válida.");

  
  if (tipo === "avaliacao") {
    const errosQuestoes = questoes.flatMap((q, i) => validarQuestao(q, i));
    if (errosQuestoes.length > 0) {
      toast.error("Corrija os seguintes erros:\n\n" + errosQuestoes.join("\n"));
      return;
    }
    if (permitirRepeticoes && (!tentativasMax || Number(tentativasMax) < 1)) {
      return toast.error("Informe um número de tentativas válido (>= 1).");
    }
  }


  
  try {
    setSalvando(true);
    const turmaId = localStorage.getItem("lastTurmaId") || null;
    const agoraIso = new Date().toISOString();

    const basePayload = {
      tipo,
      titulo,
      descricao,
      conteudo,
      turmaId,
      usuarioId: user.uid,
      criadaEm: agoraIso,
      atualizadaEm: agoraIso,
    };

    const pubRef = await addDoc(collection(db, "publicacoes"), {
      ...basePayload,
      ...(tipo !== "avaliacao" ? { anexos } : {}),
      ...(tipo === "atividade"
        ? {
            entrega: Timestamp.fromDate(new Date(`${data}T${hora}:59`)),
            valor: valor ? Number(valor) : 0,
          }
        : {}),
      ...(tipo === "avaliacao"
        ? {
            valor: valor ? Number(valor) : 0,
            configuracoes: {  
              respostasMultiplas: !!configRespostasMultiplas,
              embaralharRespostas: !!embaralharRespostas,
              permitirRepeticoes: !!permitirRepeticoes,
              tentativasMax: permitirRepeticoes ? Number(tentativasMax || 1) : 1, },
              ...(dataAval
                ? { entrega: Timestamp.fromDate(new Date(`${dataAval}T${(horaAval||"23:59")}:59`)) }
                : {}),
            }
          
        : {}),
    });

    if (tipo === "avaliacao") {
      const pubId = pubRef.id;
      let ordem = 1;
      for (const q of questoes) {
        const qRef = doc(collection(db, "publicacoes", pubId, "questoes"));
        await setDoc(qRef, {
          ordem: ordem++,
          enunciado: q.enunciado,
          tipo: q.tipo,
          obrigatoria: !!q.obrigatoria,
          ...(q.imagem?.url ? { imagem: q.imagem } : {}),
          ...(q.tipo === "dissertativa" ? { textoEsperado: q.textoEsperado || "" } : {}),
          ...(q.tipo === "multipla"
            ? { alternativas: q.alternativas || [], permiteMultiplas: !!q.permiteMultiplas }
            : {}),
          ...(q.tipo === "correspondencia" ? { colA: q.colA || [], colB: q.colB || [] } : {}),
          ...(q.valor ? { valor: Number(q.valor) } : {}),
        });
      }
    }

    toast.success("Publicado com sucesso!");
      if (turmaId) navigate(`/professor/turma/${turmaId}`);
      else navigate("/professor/atividades");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar publicação. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };


  return (
    <div className="layout">
       <ToastContainer position="bottom-right" theme="colored" />
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />
          <div className="menu-turma">
            <NavLink to={`/professor/turma/${id}`}>Painel</NavLink>
            <NavLink to={`/professor/atividades/${id}`}>Todas as atividades</NavLink>
            <NavLink to={`/professor/alunos-turma/${id}`}>Alunos</NavLink>
          </div>


          <form className="form-add-ativ" onSubmit={handleSalvar}>
            <h3>Nova publicação</h3>

            
            <div className="tipo-switch">
              <button type="button" className={tipo==="conteudo"?"ativo":""} onClick={()=>setTipo("conteudo")}>Conteúdo</button>
              <button type="button" className={tipo==="atividade"?"ativo":""} onClick={()=>setTipo("atividade")}>Atividade (entrega)</button>
              <button type="button" className={tipo==="avaliacao"?"ativo":""} onClick={()=>setTipo("avaliacao")}>Avaliação (prova)</button>
            </div>

            <label>
              <p>Título</p>
              <input value={titulo} onChange={(e)=>setTitulo(e.target.value)} required />
            </label>

           <label>
            <p>Descrição</p>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
            />
            <small>{contarPalavras(descricao)}/150 palavras máx</small>
          </label>


            <label>
              <p>Conteúdo (tema)</p>
              <input
                type="text"
                list="conteudos-sugeridos"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Selecione ou digite um conteúdo"
              />
              <datalist id="conteudos-sugeridos">
                {conteudosSugeridos.map((c, i) => <option key={`${c}-${i}`} value={c} />)}

              </datalist>
            </label>

            
          {tipo !== "avaliacao" && (
            <div className="anexos">
              <p>Anexos (PDF, docs, imagem)</p>

              
              <div className="anexo-actions">
                <label className="btn-add-anexo">
                  <MdOutlineDriveFolderUpload size={20}/> Adicionar arquivo
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;

                      const tiposPermitidos = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "text/plain",
                      ];

                      if (!tiposPermitidos.includes(f.type)) {
                        toast.error("Tipo de arquivo não permitido!");
                        e.target.value = "";
                        return;
                      }

                      await addAnexoFile(f);
                      toast.success(`Arquivo "${f.name}" anexado!`);
                      e.target.value = "";
                    }}
                  />
                </label>

               
                {anexos.filter(a => a.kind === "file").length > 0 && (
                  <div className="nome-anexo">
                    <p>Último anexo: <strong>{anexos.filter(a => a.kind === "file").slice(-1)[0].nome}</strong></p>
                  </div>
                )}
              </div>

              
              {anexos.some(a => a.kind === "file") && (
                <ul className="anexo-list">
                  {anexos
                    .filter(a => a.kind === "file")
                    .map((a) => (
                      <li key={a.url}>
                        <span><MdOutlineInsertDriveFile size={20}/> {a.nome || "arquivo"}: </span>
                        <a href={a.url} target="_blank" rel="noreferrer">{a.url}</a>
                        <button type="button" onClick={() => removerAnexo(a.url)}>Remover</button>
                      </li>
                    ))}
                </ul>
              )}

              
              <div className="link-add">
                <input
                  type="url"
                  placeholder="Cole um link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <button type="button" onClick={addAnexoLink}>Adicionar link</button>
              </div>

             
              {anexos.some(a => a.kind === "link") && (
                <ul className="anexo-list">
                  {anexos
                    .filter(a => a.kind === "link")
                    .map((a) => (
                      <li key={a.url}>
                        <span><FaLink /> Link: </span>
                        <a href={a.url} target="_blank" rel="noreferrer">{a.url}</a>
                        <button type="button" onClick={() => removerAnexo(a.url)}>Remover</button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

           
            {tipo === "atividade" && (
              <>
                <h4 style={{ marginTop: "1rem", color: "#12285a" }}><FaCalendarAlt /> Detalhes da entrega</h4>
                <div className="row">
                  <label>
                    <p>Data de entrega</p>
                    <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
                  </label>
                  <label>
                    <p>Hora de entrega</p>
                    <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                  </label>
                  <label>
                    <p>Valor (nota)</p>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </label>
                </div>
              </>
            )}


            {tipo === "avaliacao" && (
              <>
                <div className="row">
                  <label>
                    <p>Valor total da avaliação</p>
                    <input type="number" min="0" step="1" value={valor} onChange={(e)=>setValor(e.target.value)} />
                  </label>
                  <label  className="checkbox-questoes">
                    <p>Permitir múltiplas respostas por padrão?</p>
                    <input 
                   
                      type="checkbox"
                      checked={!!configRespostasMultiplas}
                      onChange={(e)=>setConfigRespostasMultiplas(e.target.checked)}
                    />
                  </label>
                </div>

                <h4 style={{ marginTop: 12, color: "#12285a" }}><FaCalendarAlt /> Prazo (opcional)</h4>
                <div className="row">
                  <label>
                    <p>Data</p>
                    <input type="date" value={dataAval} onChange={(e) => setDataAval(e.target.value)} />
                  </label>
                  <label>
                    <p>Hora</p>
                    <input type="time" value={horaAval} onChange={(e) => setHoraAval(e.target.value)} />
                  </label>
                </div>

                <h4 style={{ marginTop: 12, color: "#12285a" }}><IoMdSettings /> Configurações</h4>
                <div className="row">
                  <label className="checkbox-questoes">
                    <p>Embaralhar respostas</p>
                    <input
                      type="checkbox"
                      checked={!!embaralharRespostas}
                      onChange={(e)=>setEmbaralharRespostas(e.target.checked)}
                    />
                  </label>

                  <label className="checkbox-questoes">
                    <p>Permitir fazer mais de uma vez</p>
                    <input
                      type="checkbox"
                      checked={!!permitirRepeticoes}
                      onChange={(e)=>setPermitirRepeticoes(e.target.checked)}
                    />
                  </label>

                  <label>
                    <p>Tentativas (se permitido)</p>
                    <input
                      type="number"
                      min="1"
                      value={tentativasMax}
                      disabled={!permitirRepeticoes}
                      onChange={(e) => setTentativasMax(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="questoes-wrapper">
                  <div className="questoes-header">
                    <h4>Questões</h4>
                    <button
                      type="button"
                      onClick={() => setQuestoes((prev)=>[...prev, { tipo: "dissertativa", enunciado: "" }])}
                    >
                      + Adicionar questão
                    </button>
                  </div>

                  {questoes.map((q, i) => (
                    <NovaQuestao
                      key={i}
                      index={i}
                      value={q}
                      onChange={(novo) => {
                        const arr = [...questoes];
                        arr[i] = novo;
                        setQuestoes(arr);
                      }}
                      onRemove={() => {
                        const arr = [...questoes];
                        arr.splice(i, 1);
                        setQuestoes(arr);
                      }}
                      onDuplicate={() => {
                        const arr = [...questoes];
                        const clone = JSON.parse(JSON.stringify(q));
                       
                        if (clone?.alternativas?.length) {
                          clone.alternativas = clone.alternativas.map(a => ({...a, id: crypto.randomUUID()}));
                        }
                        arr.splice(i + 1, 0, clone);
                        setQuestoes(arr);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="acoes-salvar-cancelar">
              <button type="button" className="btn cancelar-atividade" onClick={()=>navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn salvar-atividade" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

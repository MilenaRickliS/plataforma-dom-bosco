import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { addDoc, collection, Timestamp, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { db } from "../../../services/firebaseConnection";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import { useParams } from "react-router-dom";


function NovaQuestao({ index, value, onChange, onRemove }) {
  const [tipo, setTipo] = useState(value?.tipo || "dissertativa");

  useEffect(() => {
    onChange({ ...value, tipo });
    
  }, [tipo]);

 


  const atualizar = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="questao">
      <div className="questao-header">
        <strong>Questão {index + 1}</strong>
        <button type="button" onClick={onRemove}>Remover</button>
      </div>

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
              <label>
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
            type="button"
            onClick={() => {
              const alts = [...(value.alternativas || [])];
              alts.push({ id: crypto.randomUUID(), texto: "" });
              atualizar({ alternativas: alts });
            }}
          >
            + Alternativa
          </button>

          <label>
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
  
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/base64`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileBase64: base64, folder: "publicacoes" }),
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
  };

  const addAnexoLink = () => {
    if (!link) return;
    setAnexos((prev) => [...prev, { kind: "link", url: link }]);
    setLink("");
  };

  const removerAnexo = (url) => setAnexos((prev) => prev.filter((a) => a.url !== url));

  const handleSalvar = async (e) => {
  e.preventDefault();
  if (!user?.uid) return alert("Faça login novamente.");
  if (!titulo) return alert("Informe o título.");

  try {
    setSalvando(true);
    
    
    const turmaId = (() => { 
      try { 
        return localStorage.getItem("lastTurmaId"); 
      } catch { 
        return null; 
      } 
    })();

    const agoraIso = new Date().toISOString();

    const basePayload = {
      tipo,
      titulo,
      descricao,
      conteudo,
      turmaId,   
      usuarioId: user.uid,
      criadaEm: agoraIso,
      atualizadaEm: agoraIso
    };

    const pubRef = await addDoc(collection(db, "publicacoes"), {
      ...basePayload,
      ...(tipo !== "avaliacao" ? { anexos } : {}),
      ...(tipo === "atividade" ? {
        entrega: Timestamp.fromDate(new Date(`${data}T${hora}:59`)),
        valor: valor ? Number(valor) : 0
      } : {}),
      ...(tipo === "avaliacao" ? {
        valor: valor ? Number(valor) : 0,
        configuracoes: { respostasMultiplas: !!configRespostasMultiplas }
      } : {})
    });

    if (tipo === "avaliacao") {
      const pubId = pubRef.id;
      let ordem = 1;
      for (const q of questoes) {
        const qRef = doc(collection(db, "publicacoes", pubId, "questoes"));
        await setDoc(qRef, {
          ordem: ordem++,
          enunciado: q.enunciado || "",
          tipo: q.tipo,
          ...(q.imagem?.url ? { imagem: { url: q.imagem.url, nome: q.imagem.nome || "" } } : {}),
          ...(q.tipo === "dissertativa" ? { textoEsperado: q.textoEsperado || "" } : {}),
          ...(q.tipo === "multipla" ? { alternativas: q.alternativas || [], permiteMultiplas: !!q.permiteMultiplas } : {}),
          ...(q.tipo === "correspondencia" ? { colA: q.colA || [], colB: q.colB || [] } : {}),
          ...(q.valor ? { valor: q.valor } : {}),
        });
      }
    }

    alert("Publicado com sucesso!");
     if (turmaId) navigate(`/professor/turma/${turmaId}`);
    else navigate("/professor/atividades");

  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Não foi possível salvar. Tente novamente.");
  } finally {
    setSalvando(false);
  }
};

  return (
    <div className="layout">
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
              <textarea value={descricao} onChange={(e)=>setDescricao(e.target.value)} rows={4} />
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
                {conteudosSugeridos.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>

            
            {tipo !== "avaliacao" && (
              <div className="anexos">
                <p>Anexos</p>
                <div className="anexo-actions">
                  <input
                    type="file"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) await addAnexoFile(f);
                      e.target.value = "";
                    }}
                  />
                  <div className="link-add">
                    <input
                      type="url"
                      placeholder="Cole um link"
                      value={link}
                      onChange={(e)=>setLink(e.target.value)}
                    />
                    <button type="button" onClick={addAnexoLink}>Adicionar link</button>
                  </div>
                </div>
                {!!anexos.length && (
                  <ul className="anexo-list">
                    {anexos.map((a) => (
                      <li key={a.url}>
                        <span>{a.kind === "file" ? (a.nome || "arquivo") : "link"}: </span>
                        <a href={a.url} target="_blank" rel="noreferrer">{a.url}</a>
                        <button type="button" onClick={()=>removerAnexo(a.url)}>Remover</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

           
            {tipo === "atividade" && (
              <div className="row">
                <label>
                  <p>Data de entrega</p>
                  <input type="date" value={data} onChange={(e)=>setData(e.target.value)} required />
                </label>
                <label>
                  <p>Hora de entrega</p>
                  <input type="time" value={hora} onChange={(e)=>setHora(e.target.value)} />
                </label>
                <label>
                  <p>Valor (nota)</p>
                  <input type="number" min="0" step="1" value={valor} onChange={(e)=>setValor(e.target.value)} />
                </label>
              </div>
            )}

            {tipo === "avaliacao" && (
              <>
                <div className="row">
                  <label>
                    <p>Valor total da avaliação</p>
                    <input type="number" min="0" step="1" value={valor} onChange={(e)=>setValor(e.target.value)} />
                  </label>
                  <label>
                    <p>Permitir múltiplas respostas por padrão?</p>
                    <input
                      type="checkbox"
                      checked={!!configRespostasMultiplas}
                      onChange={(e)=>setConfigRespostasMultiplas(e.target.checked)}
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
                    />
                  ))}
                </div>
              </>
            )}

            <div className="acoes">
              <button type="button" className="btn secundario" onClick={()=>navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn primario" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

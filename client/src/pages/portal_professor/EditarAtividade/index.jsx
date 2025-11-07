import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../../../services/firebaseConnection";
import { AuthContext } from "../../../contexts/auth";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import axios from "axios";
import { MdOutlineDriveFolderUpload, MdOutlineInsertDriveFile } from "react-icons/md";
import { FaLink, FaCalendarAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import NovaQuestao from "../../../components/portais/NovaQuestao";


export default function EditarAtividade() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [tipo, setTipo] = useState("atividade");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("23:59");
  const [dataAval, setDataAval] = useState("");
  const [horaAval, setHoraAval] = useState("23:59");
  const [configRespostasMultiplas, setConfigRespostasMultiplas] = useState(true);
  const [embaralharRespostas, setEmbaralharRespostas] = useState(true);
  const [permitirRepeticoes, setPermitirRepeticoes] = useState(false);
  const [tentativasMax, setTentativasMax] = useState(1);
  const [anexos, setAnexos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [descCount, setDescCount] = useState(0);
  const [linkTmp, setLinkTmp] = useState("");


  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/api/publicacoes`);
        const dados = res.data.find((a) => a.id === id);
        if (!dados) {
          toast.error("Atividade não encontrada");
          navigate(-1);
          return;
        }

        setTipo(dados.tipo);
        setTitulo(dados.titulo || "");
        setDescricao(dados.descricao || "");
        setConteudo(dados.conteudo || "");
        setValor(dados.valor || "");

        if (dados.entrega) {
            if (
                typeof dados.entrega === "string" &&
                /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(dados.entrega)
            ) {
                const [dataStr, horaStr] = dados.entrega.split(" ");
                setData(dataStr);
                setHora(horaStr);
            } else if (dados.entrega?._seconds) {
                const entrega = new Date(dados.entrega._seconds * 1000);
                setData(entrega.toLocaleDateString("en-CA")); // formato YYYY-MM-DD local
                setHora(entrega.toTimeString().slice(0, 5));  // HH:mm local
            }
            }



        setAnexos(dados.anexos || []);
        if (dados.configuracoes) {
          setConfigRespostasMultiplas(!!dados.configuracoes.respostasMultiplas);
          setEmbaralharRespostas(!!dados.configuracoes.embaralharRespostas);
          setPermitirRepeticoes(!!dados.configuracoes.permitirRepeticoes);
          setTentativasMax(dados.configuracoes.tentativasMax || 1);
        }

        if (dados.tipo === "avaliacao") {
          const qs = await axios.get(`${API}/api/questoes`, { params: { avaliacaoId: id } });
          setQuestoes(qs.data || []);
        }
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar dados da atividade.");
      }
    })();
  }, [id]);

  function montarDataLocal(dataStr, horaStr) {
    if (!dataStr) return null;
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const [hora, min] = (horaStr || "23:59").split(":").map(Number);
   
    return new Date(ano, mes - 1, dia, hora, min, 59, 0);
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

  const addAnexoFile = async (file) => {
    try {
      const r = await uploadArquivo(file);
      setAnexos((prev) => [...prev, { kind: "file", url: r.url, nome: file.name }]);
      toast.success("Arquivo anexado!");
    } catch {
      toast.error("Erro ao enviar arquivo.");
    }
  };

  

    const addAnexoLink = (link) => {
    const linkNormalizado = /^https?:\/\//i.test(link) ? link : `http://${link}`;
    if (!validarURL(linkNormalizado)) return toast.error("URL inválida");
    if (anexos.some((a) => a.url === linkNormalizado))
        return toast.warning("Esse link já foi adicionado!");
    setAnexos((prev) => [...prev, { kind: "link", url: linkNormalizado }]);
    toast.success("Link anexado!");
    };


  const removerAnexo = (url) => setAnexos((prev) => prev.filter((a) => a.url !== url));
    function contarPalavras(texto = "") {
    return texto.trim().split(/\s+/).filter(Boolean).length;
    }

    function validarTextoBasico(texto = "") {
    return /^[\p{L}\p{M}\d\s.,!?()\-–—'"/°ºª%&]+$/u.test(texto);
    }

    function validarURL(url = "") {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
    }

    function validarQuestao(q, index) {
    const erros = [];

    if (!q.tipo) erros.push(`Questão ${index + 1}: tipo é obrigatório.`);
    if (!q.enunciado?.trim()) erros.push(`Questão ${index + 1}: enunciado é obrigatório.`);
    if (contarPalavras(q.enunciado) > 300)
        erros.push(`Questão ${index + 1}: enunciado excede 300 palavras.`);
    if (q.imagem?.url && !validarURL(q.imagem.url))
        erros.push(`Questão ${index + 1}: URL da imagem inválida.`);
    if (q.valor && isNaN(q.valor))
        erros.push(`Questão ${index + 1}: valor deve ser numérico.`);

    if (q.tipo === "dissertativa" && q.textoEsperado) {
        if (contarPalavras(q.textoEsperado) > 300)
        erros.push(`Questão ${index + 1}: texto esperado excede 300 palavras.`);
    }

    if (q.tipo === "multipla") {
        const alts = q.alternativas || [];
        if (alts.length < 2)
        erros.push(`Questão ${index + 1}: precisa ter ao menos 2 alternativas.`);
        if (!alts.some((a) => a.correta))
        erros.push(`Questão ${index + 1}: precisa ter pelo menos 1 alternativa correta.`);
    }

    if (q.tipo === "correspondencia") {
        const a = q.colA || [];
        const b = q.colB || [];
        if (a.length < 2 || b.length < 2)
        erros.push(`Questão ${index + 1}: precisa de ao menos 2 pares em cada coluna.`);
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

    
    for (const a of anexos.filter((x) => x.kind === "link")) {
        if (!validarURL(a.url)) return toast.error(`Link inválido: ${a.url}`);
    }

    
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
      const payload = {
        titulo,
        descricao,
        conteudo,
        valor: Number(valor) || 0,
        anexos,
        configuracoes: {
          respostasMultiplas: !!configRespostasMultiplas,
          embaralharRespostas: !!embaralharRespostas,
          permitirRepeticoes: !!permitirRepeticoes,
          tentativasMax: permitirRepeticoes ? Number(tentativasMax || 1) : 1,
        },
       entrega: data && hora ? `${data} ${hora}` : "",
        atualizadaEm: new Date().toISOString(),
      };

      await axios.patch(`${API}/api/publicacoes?id=${id}`, payload);
      toast.success("Atividade atualizada com sucesso!");

      
      if (tipo === "avaliacao" && questoes.length > 0) {
        for (const q of questoes) {
          const qRef = doc(collection(db, "publicacoes", id, "questoes"), q.id || undefined);
          await setDoc(qRef, q, { merge: true });
        }
      }

      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações.");
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
          <h3 className="titulo-editar">Editar {tipo === "avaliacao" ? "Avaliação" : tipo === "atividade" ? "Atividade" : "Conteúdo"}</h3>

          <form className="form-add-ativ" onSubmit={handleSalvar}>
            <label>
              <p>Título</p>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </label>

            <label>
            <p>Descrição</p>
            <textarea
                value={descricao}
                onChange={(e) => {
                setDescricao(e.target.value);
                setDescCount(contarPalavras(e.target.value));
                }}
                rows={4}
            />
            <small style={{ color: descCount > 150 ? "#b91c1c" : "#64748b" }}>
                {descCount} / 150 palavras
            </small>
            </label>


            <label>
              <p>Conteúdo (tema)</p>
              <input value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
            </label>

           {tipo !== "avaliacao" && (
            <div className="anexos">
              <p>Anexos</p>
              <label className="btn-add-anexo">
                <MdOutlineDriveFolderUpload size={20} /> Adicionar arquivo
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) await addAnexoFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="link-add">
            <input
                type="url"
                placeholder="Cole um link (com ou sem http)"
                value={linkTmp}
                onChange={(e) => setLinkTmp(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    if (!linkTmp.trim()) return;
                    addAnexoLink(linkTmp.trim());
                    setLinkTmp("");
                }
                }}
            />
            <button type="button" onClick={() => {
                if (!linkTmp.trim()) return;
                addAnexoLink(linkTmp.trim());
                setLinkTmp("");
            }}>Adicionar</button>
            </div>

              {anexos.length > 0 && (
                <ul className="anexo-list">
                  {anexos.map((a, i) => (
                    <li key={i}>
                      <span>
                        {a.kind === "file" ? <MdOutlineInsertDriveFile /> : <FaLink />} {a.nome || "Link"}:
                      </span>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        {a.url}
                      </a>
                      <button type="button" onClick={() => removerAnexo(a.url)}>
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}
            
            {tipo !== "conteudo" && (
              <>
                <h4 style={{ marginTop: 12, color: "#12285a" }}>
                  <FaCalendarAlt /> Prazo
                </h4>
                <div className="row">
                  <label>
                    <p>Data</p>
                    <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                  </label>
                  <label>
                    <p>Hora</p>
                    <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                  </label>
                  <label>
                    <p>Valor</p>
                    <input
                      type="number"
                      min="0"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </label>
                </div>
              </>
            )}

           
            {tipo === "avaliacao" && (
              <>
                <h4 style={{ marginTop: 12, color: "#12285a" }}>
                  <IoMdSettings /> Configurações
                </h4>
                <div className="row">
                  <label className="checkbox-questoes">
                    <p>Embaralhar respostas</p>
                    <input
                      type="checkbox"
                      checked={!!embaralharRespostas}
                      onChange={(e) => setEmbaralharRespostas(e.target.checked)}
                    />
                  </label>
                  <label className="checkbox-questoes">
                    <p>Permitir repetição</p>
                    <input
                      type="checkbox"
                      checked={!!permitirRepeticoes}
                      onChange={(e) => setPermitirRepeticoes(e.target.checked)}
                    />
                  </label>
                  <label>
                    <p>Tentativas máximas</p>
                    <input
                      type="number"
                      min="1"
                      disabled={!permitirRepeticoes}
                      value={tentativasMax}
                      onChange={(e) => setTentativasMax(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="questoes-wrapper">
                  <div className="questoes-header">
                    <h4>Questões ({questoes.length})</h4>
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
                        const clone = JSON.parse(JSON.stringify(q));
                        if (clone.alternativas)
                          clone.alternativas = clone.alternativas.map((a) => ({
                            ...a,
                            id: crypto.randomUUID(),
                          }));
                        setQuestoes((prev) => {
                          const arr = [...prev];
                          arr.splice(i + 1, 0, clone);
                          return arr;
                        });
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="acoes-salvar-cancelar">
              <button type="button" className="btn cancelar-atividade" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="submit" className="btn salvar-atividade" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

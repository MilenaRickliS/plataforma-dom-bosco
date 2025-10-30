import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import { getTurmasDoProfessor, getAlunosDaTurma } from "../../../services/turma.js";
import { getTemplates, createTemplate, atribuirMedalhas } from "../../../services/medalhas.js";
import "./style.css";
import { FaMedal } from "react-icons/fa6";
import { MdModeEdit } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { adicionarPontos, removerPontos, mostrarToastPontosAdicionar, mostrarToastPontosRemover, regrasPontuacao } from "../../../services/gamificacao";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function MedalhasAtribuir() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [selecionados, setSelecionados] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [comment, setComment] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [editando, setEditando] = useState(null);


  const [criando, setCriando] = useState(false);
  const [novo, setNovo] = useState({
    title: "",
    imageUrl: "",
    unique: true,
    category: "geral",
    color: "#2563eb",
  });

  useEffect(() => {
    if (!user?.uid) return;
    getTurmasDoProfessor(user.uid).then(setTurmas).catch(console.error);
    getTemplates(user.uid).then(setTemplates).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      setSelecionados({});
      setSelectAll(false);
      return;
    }
    getAlunosDaTurma(turmaId).then((lista) => {
      setAlunos(lista);
      setSelecionados({});
      setSelectAll(false);
    }).catch(console.error);
  }, [turmaId]);

  const alunosSelecionados = useMemo(
    () => Object.entries(selecionados).filter(([, v]) => v).map(([k]) => k),
    [selecionados]
  );

  function toggleAluno(id) {
    setSelecionados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAll() {
    if (selectAll) {
      
      setSelecionados({});
      setSelectAll(false);
    } else {
      
      const all = {};
      alunos.forEach((a) => (all[a.id] = true));
      setSelecionados(all);
      setSelectAll(true);
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();

    const isEditing = !!editando;
    const item = isEditing ? editando : novo;

    const palavrasTitulo = item.title.trim().split(/\s+/).length;
    if (!item.title.trim()) {
        toast.error("⚠️ O título não pode estar vazio.");
        return;
    }
    if (palavrasTitulo > 10) {
        toast.error("⚠️ O título deve ter no máximo 10 palavras.");
        return;
    }

    if (!isEditing && !item.imageFile) {
        toast.error("⚠️ É necessário enviar uma imagem da medalha.");
        return;
    }

    if (isEditing && !item.imageUrl && !item.novaImagem) {
        toast.error("⚠️ A medalha precisa ter uma imagem.");
        return;
    }

    if (!item.category.trim()) {
        toast.error("⚠️ Selecione ou crie uma categoria.");
        return;
    }

    try {
        setCriando(true);
        const formData = new FormData();
        formData.append("title", item.title);
        formData.append("ownerProfessorId", user.uid);
        formData.append("unique", item.unique);
        formData.append("category", item.category);
        formData.append("color", item.color);

        if (item.imageFile || item.novaImagem) {
        formData.append("image", item.imageFile || item.novaImagem);
        }

        const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/medalhas/templates/${item.id}`
        : `${import.meta.env.VITE_API_URL}/api/medalhas/templates`;

        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          body: formData,
          headers: {},
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro ao salvar medalha.");

        if (isEditing) {
        setTemplates((prev) =>
            prev.map((tpl) => (tpl.id === data.id ? data : tpl))
        );
        toast.success("🏅 Medalha atualizada com sucesso!");
        setEditando(null);
        } else {
        setTemplates((prev) => [data, ...prev]);
        await adicionarPontos(user.uid, regrasPontuacao.criarMedalha, "Criou um novo modelo de medalha 🏅");
        mostrarToastPontosAdicionar(
          regrasPontuacao.criarMedalha,
          "Criou um novo modelo de medalha 🏅"
        );

        toast.success(" Modelo criado com sucesso!");
        setNovo({
            title: "",
            imageUrl: "",
            imageFile: null,
            unique: true,
            category: "geral",
            color: "#2563eb",
        });
        }
    } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar modelo.");
    } finally {
        setCriando(false);
    }
    }




    async function handleAtribuir() {
        if (!user?.uid) return toast.error("⚠️ Usuário não autenticado.");
        if (!templateId) return toast.error("⚠️ Selecione um modelo de medalha.");
        const lista = alunosSelecionados;
        if (lista.length === 0)
            return toast.error("⚠️ Selecione ao menos um aluno.");

        const palavrasComentario = comment.trim().split(/\s+/).length;
        if (comment && palavrasComentario > 15) {
            return toast.error("⚠️ O comentário deve ter no máximo 15 palavras.");
        }
        

    try {
      console.log({
        professorId: user?.uid,
        turmaId,
        templateId,
        alunos: lista,
        comment,
      });
      await atribuirMedalhas({
        professorId: user?.uid,
        turmaId,
        templateId,
        comment,
        alunos: lista
      });
      await adicionarPontos(user.uid, regrasPontuacao.atribuirMedalha, `Atribuiu medalhas a ${lista.length} aluno(s) 🏆`);
      mostrarToastPontosAdicionar(
        regrasPontuacao.atribuirMedalha,
        `Atribuiu medalhas a ${lista.length} aluno(s) 🏆`
      );

      toast.success("🏆 Medalha(s) atribuída(s) com sucesso!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("❌ Erro ao atribuir medalhas.");
    }
  }

  const categoriasExistentes = useMemo(() => {
    const cats = templates.map(t => t.category || "geral");
    return Array.from(new Set(cats)); 
    }, [templates]);

    async function handleExcluirTemplate(id) {
        if (!confirm("Deseja realmente excluir esta medalha?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medalhas/templates/${id}`, {
            method: "DELETE",
            });
            if (!res.ok) throw new Error("Erro ao excluir");
            setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
            await removerPontos(user.uid, Math.abs(regrasPontuacao.excluirMedalha), "Excluiu um modelo de medalha 🗑️");
            mostrarToastPontosRemover(
              regrasPontuacao.excluirMedalha,
              "Excluiu um modelo de medalha 🗑️"
            );

             toast.success("Medalha excluída com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("❌ Erro ao excluir medalha.");
        }
    }

   



  return (
    <div className="layout">
      <ToastContainer position="bottom-right" theme="colored" />
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
          <h2 className="titulo-atribuir">Atribuir Medalhas</h2>

          <section className="filtros-atribuir">
            <label>
              Turma:
              <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                <option value="">Selecione</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomeTurma} — {t.materia}
                  </option>
                ))}
              </select>
            </label>

            <div className="alunos-box">
              <div className="alunos-header">
                <strong>Alunos</strong>
                <button type="button" onClick={toggleAll}>
                  {selectAll ? "Desmarcar todos" : "Selecionar todos"}
                </button>
              </div>
             <ul className="lista-alunos-medalhas">
                {alunos.length === 0 ? (
                    <p className="aviso-vazio">Nenhum aluno encontrado nesta turma </p>
                ) : (
                    alunos.map((a) => (
                    <li key={a.id}>
                        <label>
                        <input
                            type="checkbox"
                            checked={!!selecionados[a.id]}
                            onChange={() => toggleAluno(a.id)}
                        />
                        {a.nome || a.id}
                        </label>
                    </li>
                    ))
                )}
                </ul>

              <p>Selecionados: <strong>{alunosSelecionados.length}</strong></p>
            </div>
          </section>

         <section className="picker">
            <h3>Escolher um modelo existente</h3>

            {templates.length === 0 ? (
                <p className="aviso-vazio">Nenhum modelo de medalha criado ainda.</p>
            ) : (
                <div className="grid-medalhas">
                    {templates.map((tpl) => (
                        <div
                        key={tpl.id}
                        className={`card-medalha ${templateId === tpl.id ? "selecionado" : ""}`}
                        >
                        <div className="imagem-medalha" style={{ borderColor: tpl.color }} onClick={() => setTemplateId(tpl.id)}>
                            {tpl.imageUrl ? (
                            <img src={tpl.imageUrl} alt={tpl.title} />
                            ) : (
                            <FaMedal style={{ color: tpl.color, fontSize: 40 }} />
                            )}
                        </div>

                        <div className="info-medalha" onClick={() => setTemplateId(tpl.id)}>
                            <h4>{tpl.title}</h4>
                            <p>
                            <span className="badge-categoria">{tpl.category}</span>
                            </p>
                            <p className="status-unico">{tpl.unique ? "🏅 Única" : "🔁 Repetível"}</p>
                        </div>

                        <div className="acoes-medalha">
                            <button onClick={() => setEditando(tpl)} className="edit"><MdModeEdit /></button>
                            <button onClick={() => handleExcluirTemplate(tpl.id)}><FaTrashAlt /></button>
                        </div>
                        </div>
                    ))}
                    </div>

            )}

            <label style={{ display: "block", marginTop: 12 }}>
                Comentário (opcional):
                <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex.: desempenho excelente no projeto X"
                />
            </label>

            <button className="btn-atribuir" onClick={handleAtribuir} style={{ marginTop: 12 }}>
                <FaMedal /> Atribuir Medalha
            </button>
            </section>


         

          <section className="criar-modelo">
            <h3>{editando ? "Editar Medalha" : "Criar Novo Modelo"}</h3>
            <form onSubmit={handleSalvar} className="form-modelo">
                <label>
                Título:
                <input
                    type="text"
                    value={editando ? editando.title : novo.title}
                    onChange={(e) =>
                    editando
                        ? setEditando((p) => ({ ...p, title: e.target.value }))
                        : setNovo((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Ex.: Estrela da Semana"
                />
                </label>

                <label>
                Imagem da medalha:
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                    const file = e.target.files[0];
                    if (editando) setEditando((p) => ({ ...p, novaImagem: file }));
                    else setNovo((p) => ({ ...p, imageFile: file }));
                    }}
                />
                {(editando?.novaImagem || editando?.imageUrl || novo.imageFile) && (
                    <div className="preview-imagem">
                    <img
                        src={
                        editando
                            ? editando.novaImagem
                            ? URL.createObjectURL(editando.novaImagem)
                            : editando.imageUrl
                            : URL.createObjectURL(novo.imageFile)
                        }
                        alt="Prévia da medalha"
                    />
                    </div>
                )}
                </label>

                <label>
                Única por aluno?
                <input
                    type="checkbox"
                    checked={editando ? editando.unique : novo.unique}
                    onChange={(e) =>
                    editando
                        ? setEditando((p) => ({ ...p, unique: e.target.checked }))
                        : setNovo((p) => ({ ...p, unique: e.target.checked }))
                    }
                />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                <label style={{ flex: 1 }}>
                    Categoria:
                    <select
                    value={editando ? editando.category : novo.category}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "__nova__") {
                        editando
                            ? setEditando((p) => ({ ...p, category: "" }))
                            : setNovo((p) => ({ ...p, category: "" }));
                        setCriandoCategoria(true);
                        } else {
                        editando
                            ? setEditando((p) => ({ ...p, category: valor }))
                            : setNovo((p) => ({ ...p, category: valor }));
                        setCriandoCategoria(false);
                        }
                    }}
                    >
                    <option value="">Selecione</option>
                    {categoriasExistentes.map((cat) => (
                        <option key={cat} value={cat}>
                        {cat}
                        </option>
                    ))}
                    <option value="__nova__">➕ Criar nova categoria</option>
                    </select>

                    {criandoCategoria && (
                    <input
                        type="text"
                        value={editando ? editando.category : novo.category}
                        onChange={(e) =>
                        editando
                            ? setEditando((p) => ({ ...p, category: e.target.value }))
                            : setNovo((p) => ({ ...p, category: e.target.value }))
                        }
                        placeholder="Digite o nome da nova categoria"
                        className="input-nova-categoria"
                        style={{ marginTop: "8px" }}
                    />
                    )}
                </label>

                <label style={{ width: 140 }}>
                    Cor da medalha:
                    <input
                    id="color"
                    type="color"
                    value={editando ? editando.color : novo.color}
                    onChange={(e) =>
                        editando
                        ? setEditando((p) => ({ ...p, color: e.target.value }))
                        : setNovo((p) => ({ ...p, color: e.target.value }))
                    }
                    />
                </label>
                </div>

                <button type="submit" disabled={criando} style={{ marginTop: 10 }}>
                {criando
                    ? "Salvando..."
                    : editando
                    ? "Atualizar Medalha"
                    : "Salvar Modelo"}
                </button>

                {editando && (
                <button
                    type="button"
                    onClick={() => setEditando(null)}
                    className="btn-cancelar-edicao"
                >
                    Cancelar Edição
                </button>
                )}
            </form>
            </section>

        </main>
      </div>
    </div>
  );
}

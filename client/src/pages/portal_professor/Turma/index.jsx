import { useContext, useEffect, useState } from "react";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { FaPlus } from "react-icons/fa";
import "./style.css";
import { Link, NavLink, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";
import ChatTurma from "../../../components/portais/ChatTurma";
import { FaEye } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { FaBox } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Turma() {
  const { id } = useParams(); 
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const [publicacoes, setPublicacoes] = useState([]);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const API = import.meta.env.VITE_API_URL;
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  
  useEffect(() => {
    if (!user?.uid || !id) return;
    const fetchTurma = async () => {
      try {
        setCarregando(true);
        const res = await axios.get(`${API}/api/turmas?id=${id}`);
        setTurma(res.data);
      } catch (e) {
        console.error("Erro ao carregar turma:", e);
      } finally {
        setCarregando(false);
      }
    };
    fetchTurma();
  }, [user, id, API]);


 
  useEffect(() => {
    if (turma?.id) {
      try {
        localStorage.setItem("lastTurmaId", id);
      } catch {}
    }
  }, [turma?.id]);

  
  useEffect(() => {
    if (!id) return;
    const carregarPublicacoes = async () => {
      try {
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];
        const filtradas = todas.filter((p) => p.turmaId === id);
        setPublicacoes(filtradas);
      } catch (e) {
        console.error("Erro ao carregar publicações:", e);
      }
    };
    carregarPublicacoes();
  }, [id, API]);

 const titulo = turma?.nomeTurma ?? "Carregando...";
const subtitulo = turma?.materia ?? "";


  const getCorTipo = (tipo) => {
    switch (tipo) {
      case "conteudo":
        return "#4059AD";
      case "atividade":
        return "#FFC857";
      case "avaliacao":
        return "#B72A4D";
      default:
        return "#999";
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              {carregando ? (
                  <h3>Carregando turma...</h3>
                ) : (
                  <>
                    <h3>{turma?.nomeTurma || "Turma sem nome"}</h3>
                    {turma?.materia && <p>{turma.materia}</p>}
                  </>
                )}


              <button className="btn-codigo" onClick={() => setMostrarCodigo(true)}>
                <FaEye />  Mostrar Código da Turma
              </button>
            </div>
            <div className="acoes-turma">
              <button onClick={() => setEditando(true)} className="btn-acao-turma editar">
                <MdEdit />  Editar
              </button>
              <button
                onClick={async () => {
                  if (confirm("Tem certeza que deseja arquivar esta turma?")) {
                    try {
                      await axios.patch(`${API}/api/turmas/arquivar?id=${id}`);
                      toast.success("Turma arquivada com sucesso!");
                      window.location.href = "/professor/turmas-arquivadas";
                    } catch (err) {
                      console.error("Erro ao arquivar turma:", err);
                      const msg = err.response?.data?.error || "Erro ao arquivar turma. Tente novamente.";
                      toast.error(msg);
                    }
                  }
                }}
                className="btn-acao-turma arquivar"
              >
                <FaBox /> Arquivar
              </button>

              <button
                onClick={async () => {
                  if (confirm("Tem certeza que deseja excluir esta turma permanentemente?")) {
                    try {
                      await axios.delete(`${API}/api/turmas?id=${id}`);
                      toast.success("Turma excluída com sucesso!");
                      window.location.href = "/professor/inicio";
                    } catch (err) {
                      const msg = err.response?.data?.error || "Erro ao excluir turma.";
                      toast.error(msg);
                    }
                  }
                }}

                className="btn-acao-turma excluir"
              >
                <FaTrashAlt />  Excluir
              </button>
            </div>

          </div>

         
          <div className="menu-ativ">
            <div className="div-cor">
              <div className="cor1">cor</div>
              <p>Conteúdo consulta</p>
            </div>
            <div className="div-cor">
              <div className="cor2">cor</div>
              <p>Atividades</p>
            </div>
            <div className="div-cor">
              <div className="cor3">cor</div>
              <p>Avaliações</p>
            </div>
          </div>

        
          <div className="ativ-sala">
            <div className="prox-ativ">
              <p>Próximas atividades</p>
              <ul>
                {publicacoes
                  .filter((p) => p.tipo === "atividade" && p.entrega?._seconds)
                  .filter((p) => {
                    const agora = new Date();
                    const entrega = new Date(p.entrega._seconds * 1000);
                    const doisDiasDepois = new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000);
                    return entrega >= agora && entrega <= doisDiasDepois;
                  })
                  .sort((a, b) => a.entrega._seconds - b.entrega._seconds)
                  .map((p) => {
                    const dataEntrega = new Date(p.entrega._seconds * 1000);
                    const dataFormatada = dataEntrega.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    });
                    const horaFormatada = dataEntrega.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <li key={p.id}>
                        <Link to={`/professor/detalhes-ativ/${p.id}`} className="prox-link">
                          Data de entrega: {dataFormatada} - {horaFormatada}h -{" "}
                          <strong>{p.titulo}</strong>
                        </Link>
                      </li>
                    );
                  })}
                {publicacoes.filter((p) => p.tipo === "atividade").length === 0 && (
                  <li>Nenhuma atividade com prazo próximo.</li>
                )}
              </ul>
            </div>

            <div className="atividades">
              <div className="postar-ativ">
                <Link to="/add-atividade-professor" className="botao-postar-ativ">
                  <FaPlus /> adicionar atividade
                </Link>
              </div>

              {publicacoes.length === 0 ? (
                <p>Nenhuma publicação encontrada.</p>
              ) : (
                publicacoes.map((p) => (
                  <Link
                    key={p.id}
                    to={`/professor/detalhes-ativ/${p.id}`}
                    className="atividade"
                    style={{ borderLeft: `10px solid ${getCorTipo(p.tipo)}` }}
                  >
                    <div className="div-atividade">
                      <h4>{p.titulo}</h4>
                      
                      {p.tipo === "atividade" && p.entrega && (
                        <p className="prazo">
                          <strong>Prazo:</strong>{" "}
                          {new Date(p.entrega._seconds * 1000).toLocaleDateString("pt-BR")}
                        </p>
                      )}

                      {p.tipo === "avaliacao" && (
                        <p className="valor">
                          <strong>Valor total:</strong> {p.valor || 0} pts
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          
          <ChatTurma codigoTurma={turma?.codigo} turmaId={id} />

          {mostrarCodigo && (
            <div className="overlay-codigo" onClick={() => setMostrarCodigo(false)}>
              <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
                <h2>Código da Turma</h2>
                <p className="codigo-grande">{turma?.codigo || "—"}</p>
                <button onClick={() => setMostrarCodigo(false)}>Fechar</button>
              </div>
            </div>
          )}
          {editando && (
            <div className="overlay-codigo" onClick={() => setEditando(false)}>
              <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
                <h2>Editar Turma</h2>

                <label className="labels">Nome da turma:</label>
                <input
                  type="text"
                  value={turma.nomeTurma}
                  onChange={(e) => setTurma({ ...turma, nomeTurma: e.target.value })}
                />

                <label className="labels">Matéria:</label>
                <input
                  type="text"
                  value={turma.materia}
                  onChange={(e) => setTurma({ ...turma, materia: e.target.value })}
                />

                <label className="labels">Imagem da turma:</label>
                {turma.imagem && (
                  <img
                    src={turma.imagem}
                    alt="Prévia"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      objectFit: "cover",
                      maxHeight: "180px",
                    }}
                  />
                )}

                 <div className="upload-section-editarTurma">
                  <label htmlFor="file-upload" className="label-upload-editarTurma">
                    Escolher imagem de fundo
                  </label>

                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                     onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const upload = await axios.post(`${API}/api/upload`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      setTurma({ ...turma, imagem: upload.data.url });
                      
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao enviar imagem.");
                    }
                  }}
                  />

                  <img id="preview-img" className="preview-img-criarTurma" alt="Prévia da imagem" />
                </div>

                

                <div className="botoes-editar">
                  <button
                    onClick={async () => {
                     
                      if (!turma.nomeTurma.trim() || !turma.materia.trim()) {
                        toast.warn("Preencha o nome da turma e a matéria antes de salvar.");
                        return;
                      }

                      const regexValido = /^[A-Za-zÀ-ú0-9\s.,;:/()º°'"!?\-_]+$/;

                      if (!regexValido.test(turma.nomeTurma)) {
                        toast.error("O nome da turma contém caracteres inválidos.");
                        return;
                      }

                      if (!regexValido.test(turma.materia)) {
                        toast.error("A matéria contém caracteres inválidos.");
                        return;
                      }

                      try {
                        await axios.patch(`${API}/api/turmas?id=${id}`, {
                          nomeTurma: turma.nomeTurma,
                          materia: turma.materia,
                          imagem: turma.imagem,
                        });
                        toast.success("Turma atualizada com sucesso!");
                        setEditando(false);
                        window.location.reload();
                      } catch (err) {
                        console.error(err);
                        toast.error("Erro ao atualizar turma. Tente novamente.");
                      }
                    }}
                    className="salvar"
                  >
                    Salvar
                  </button>

                  <button onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}


        </main>
      </div>
    </div>
  );
}

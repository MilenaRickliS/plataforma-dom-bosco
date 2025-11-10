import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./style.css";
import { IoIosArrowBack } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GerenciarTurmasDetalhado() {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [professores, setProfessores] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [novoProfessor, setNovoProfessor] = useState("");
  const [novoAluno, setNovoAluno] = useState("");

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    carregarTurmas();
    carregarUsuarios();
  }, []);

  async function carregarTurmas() {
    try {
      const res = await axios.get(`${API}/api/gestao-turmas`);
      setTurmas(res.data);
    } catch (e) {
      console.error("Erro ao carregar turmas:", e);
    }
  }

  async function carregarUsuarios() {
    try {
      const res = await axios.get(`${API}/api/usuarios`);
      const lista = res.data;
      setProfessores(lista.filter((u) => u.role === "professor"));
      setAlunos(lista.filter((u) => u.role === "aluno"));
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    }
  }

  async function verDetalhes(id) {
    setTurmaSelecionada(id);
    try {
      const res = await axios.get(`${API}/api/gestao-turmas/detalhes?turmaId=${id}`);
      setDetalhes(res.data);
    } catch (e) {
      console.error("Erro ao buscar detalhes:", e);
    }
  }

  async function removerAluno(turmaId, alunoId) {
  if (!confirm("Remover aluno desta turma?")) return;
  try {
    await axios.patch(`${API}/api/gestao-turmas/removerAluno`, { turmaId, alunoId });
    toast.success("Aluno removido com sucesso!");
    verDetalhes(turmaId);
  } catch (e) {
    console.error("Erro ao remover aluno:", e);
    toast.error(e.response?.data?.error || "Erro ao remover aluno.");
  }
}

async function adicionarAluno(turmaId) {
  if (!novoAluno) {
    toast.warning("Selecione um aluno para adicionar!");
    return;
  }

  try {
    const res = await axios.post(`${API}/api/gestao-turmas/adicionarAluno`, {
      turmaId,
      alunoIdentificador: novoAluno,
    });
    toast.success(res.data.message || "Aluno adicionado com sucesso!");
    setNovoAluno("");
    verDetalhes(turmaId);
  } catch (e) {
    console.error("Erro ao adicionar aluno:", e);
    toast.error(e.response?.data?.error || "Erro ao adicionar aluno.");
  }
}

async function alterarProfessor(turmaId) {
  if (!novoProfessor) {
    toast.warning("Selecione um professor!");
    return;
  }

  try {
    const res = await axios.patch(`${API}/api/gestao-turmas/alterarProfessor`, {
      turmaId,
      novoProfessorIdentificador: novoProfessor,
    });
    toast.success(res.data.message || "Professor alterado com sucesso!");
    setNovoProfessor("");
    verDetalhes(turmaId);
  } catch (e) {
    console.error("Erro ao alterar professor:", e);
    toast.error(e.response?.data?.error || "Erro ao alterar professor.");
  }
}


  return (
    <main className="gerenciar-turmas">
      <ToastContainer/>


      <div className="cabecalho">
        <Link to="/gestao-portais" className="voltar-adm">
          <IoIosArrowBack /> Voltar
        </Link>
        <h1>Gerenciar Turmas</h1>
      </div>

      {!turmaSelecionada && (
        <div className="grid-turmas-gestao">
          {turmas.map((t) => (
            <div key={t.id} className="card-turma-gestao" onClick={() => verDetalhes(t.id)}>
              <img src={t.imagem || "/default.jpg"} alt={t.nomeTurma} />
              <h3>{t.nomeTurma}</h3>
              <p><b>Professor:</b> {t.professorNome}</p>
              <p><b>Alunos:</b> {t.alunos?.length || 0}</p>
            </div>
          ))}
        </div>
      )}

      {detalhes && (
        <div className="detalhes-turma-gestao">
          <button
            className="btn-voltar-lista"
            onClick={() => {
              setTurmaSelecionada(null);
              setDetalhes(null);
            }}
          >
            <IoIosArrowBack /> Voltar para lista de turmas
          </button>

          <h2>{detalhes.nomeTurma} - {detalhes.materia}</h2>

          <div className="box-professor">
            <p><b>Professor atual:</b> {detalhes.professorNome}</p>
            <select
              value={novoProfessor}
              onChange={(e) => setNovoProfessor(e.target.value)}
              className="select-professor-alterar"
            >
              <option value="">Selecione um novo professor</option>
              {professores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.email})
                </option>
              ))}
            </select>
            <button
              className="btn-alterar-professor"
              onClick={() => alterarProfessor(detalhes.id)}
            >
              Mudar Professor
            </button>
          </div>

          <div className="info-turma">
            <p><b>Atividades:</b> {detalhes.totalAtividades}</p>
            <p><b>Avaliações:</b> {detalhes.totalAvaliacoes}</p>
          </div>

          <h3>👩‍🎓 Alunos</h3>
          <div className="box-adicionar-aluno">
            <select
              value={novoAluno}
              onChange={(e) => setNovoAluno(e.target.value)}
              className="select-aluno-adicionar"
            >
              <option value="">Selecione um aluno</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.email})
                </option>
              ))}
            </select>
            <button
              className="btn-adicionar-aluno"
              onClick={() => adicionarAluno(detalhes.id)}
            >
              Adicionar Aluno
            </button>
          </div>
          <div className="tabela-alunos-gestao-wrapper">
            <table className="tabela-alunos-gestao">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Média</th>
                    <th>Pontos</th>
                    <th>Medalhas</th>
                    <th>Entregas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhes.alunos?.length > 0 ? (
                    detalhes.alunos.map((a) => (
                      <tr key={a.id}>
                        <td>{a.nome}</td>
                        <td>{a.mediaFinal ?? "-"}</td>
                        <td>{a.pontos ?? 0}</td>
                        <td>{a.medalhas ?? 0}</td>
                        <td>{a.entregas ?? 0}</td>
                        <td>
                          <button onClick={() => removerAluno(detalhes.id, a.id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "10px", color: "#ffffffff" }}>
                        Nenhum aluno encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
          
        </div>
      )}
    </main>
  );
}

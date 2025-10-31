import { useContext, useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "axios";
import { FaMedal, FaCrown } from "react-icons/fa";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";

export default function Alunos() {
  const { id } = useParams(); // 🔹 Agora usa o ID da turma, não o código
  const { user } = useContext(AuthContext);
  const API = import.meta.env.VITE_API_URL;

  const [alunos, setAlunos] = useState([]);
  const [medalhasAlunos, setMedalhasAlunos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [turma, setTurma] = useState(null);

  // 🔹 Carrega dados da turma e alunos da turma
  useEffect(() => {
    if (!user?.uid || !id) return;

    const carregarDados = async () => {
      try {
        setCarregando(true);

        // 🔸 Carrega a turma pelo professor e filtra pelo ID
        const turmasRes = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
        const lista = turmasRes.data || [];
        const turmaEncontrada = lista.find((t) => t.id === id);
        setTurma(turmaEncontrada || null);

        if (!turmaEncontrada) return;

        // 🔸 Carrega os alunos da turma usando o ID
        const alunosRes = await axios.get(`${API}/api/turmas/alunos?turmaId=${id}`);
        let alunosList = alunosRes.data || [];

        // 🔸 Busca os pontos de gamificação de cada aluno
        const alunosComPontos = await Promise.all(
          alunosList.map(async (a) => {
            try {
              const pontosRes = await axios.get(`${API}/api/gamificacao?userId=${a.id}`);
              return { ...a, pontos: pontosRes.data.pontos || 0 };
            } catch {
              return { ...a, pontos: 0 };
            }
          })
        );

        // 🔸 Ordena do maior para o menor pontuador
        alunosComPontos.sort((a, b) => b.pontos - a.pontos);

        setAlunos(alunosComPontos);
      } catch (e) {
        console.error("Erro ao carregar alunos:", e);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [user, id, API]);

  // 🔹 Carrega medalhas dos alunos
  useEffect(() => {
    if (alunos.length === 0) return;
    const carregarMedalhas = async () => {
      const resultados = {};
      for (const aluno of alunos) {
        try {
          const res = await axios.get(`${API}/api/medalhas/aluno/${aluno.id}`);
          resultados[aluno.id] = res.data || [];
        } catch (err) {
          console.warn("Erro ao carregar medalhas de", aluno.nome, err);
          resultados[aluno.id] = [];
        }
      }
      setMedalhasAlunos(resultados);
    };
    carregarMedalhas();
  }, [alunos, API]);

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />

          {/* 🔹 Menu superior da turma */}
          <div className="menu-turma">
            <NavLink to={`/professor/turma/${id}`}>Painel</NavLink>
            <NavLink to={`/professor/atividades/${id}`}>Todas as atividades</NavLink>
            <NavLink to={`/professor/alunos-turma/${id}`}>Alunos</NavLink>
          </div>

          {/* 🔹 Banner da turma */}
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

          {/* 🔹 Lista de alunos com pontuação e medalhas */}
          <section className="lista-alunos">
            <h3>Alunos da turma</h3>

            {carregando ? (
              <p>Carregando alunos...</p>
            ) : alunos.length === 0 ? (
              <p className="aviso-vazio">Nenhum aluno nesta turma.</p>
            ) : (
              <div className="ranking-lista-alunos">
                {alunos.map((aluno, index) => (
                  <div key={aluno.id} className="aluno-card">
                    <div className="aluno-topo">
                      <span className="posicao">{index + 1}º</span>
                      <div className="aluno-nome">
                        {index === 0 && <FaCrown className="icone-coroa" />}
                        <strong>{aluno.nome}</strong>
                      </div>
                      <span className="pontos-alunos">{aluno.pontos} pts</span>
                    </div>

                    {/* Medalhas */}
                    <div className="medalhas-miniaturas">
                      {(medalhasAlunos[aluno.id] || []).length === 0 ? (
                        <span className="sem-medalhas">Sem medalhas</span>
                      ) : (
                        medalhasAlunos[aluno.id].map((m) => (
                          <div
                            key={m.id}
                            className="mini-medalha"
                            title={m.template?.title}
                          >
                            <div className="mini-img">
                              {m.template?.imageUrl ? (
                                <img src={m.template.imageUrl} alt={m.template.title} />
                              ) : (
                                <FaMedal style={{ color: m.template?.color || "#2563eb" }} />
                              )}
                            </div>
                            <span>{m.template?.title}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

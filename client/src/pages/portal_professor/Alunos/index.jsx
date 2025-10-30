import { useContext, useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "axios";
import { FaMedal, FaCrown } from "react-icons/fa";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";

export default function Alunos() {
  const { codigo } = useParams();
  const { user } = useContext(AuthContext);
  const API = import.meta.env.VITE_API_URL;

  const [alunos, setAlunos] = useState([]);
  const [medalhasAlunos, setMedalhasAlunos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [turma, setTurma] = useState(null);


  useEffect(() => {
    if (!user?.uid) return;

    const carregarDados = async () => {
      try {
        setCarregando(true);

      
        const turmasRes = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
        const lista = turmasRes.data || [];
        const turmaEncontrada = lista.find((t) => t.codigo === codigo);
        setTurma(turmaEncontrada || null);

        if (!turmaEncontrada) return;

       
        const alunosRes = await axios.get(`${API}/api/turmas/alunos?turmaId=${turmaEncontrada.id}`);
        let alunosList = alunosRes.data || [];

        
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

        
        alunosComPontos.sort((a, b) => b.pontos - a.pontos);

        setAlunos(alunosComPontos);
      } catch (e) {
        console.error("Erro ao carregar alunos:", e);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [user, codigo, API]);

 
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
  const subtitulo = turma?.nomeTurma || (codigo ? `Código: ${codigo}` : "");

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />

          <div className="menu-turma">
            <NavLink to={codigo ? `/professor/turma/${codigo}` : "/professor/turma"}>
              Painel
            </NavLink>
            <NavLink
              to={codigo ? `/professor/atividades/${codigo}` : "/professor/atividades"}
            >
              Todas as atividades
            </NavLink>
            <NavLink
              to={codigo ? `/professor/alunos-turma/${codigo}` : "/professor/alunos-turma"}
              className="ativo"
            >
              Alunos
            </NavLink>
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

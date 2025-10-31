import { useEffect, useState, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import axios from "axios";
import { FaPaperclip, FaClock, FaBookOpen, FaCalendarAlt } from "react-icons/fa";

export default function AtivDetalhes() {
  const { id } = useParams(); // ID da publicação (atividade ou avaliação)
  const { user } = useContext(AuthContext);
  const [publicacao, setPublicacao] = useState(null);
  const [turma, setTurma] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!id || !user?.uid) return;
    const carregar = async () => {
      try {
        setCarregando(true);
        // Busca a publicação específica
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];
        const encontrada = todas.find((p) => p.id === id);
        setPublicacao(encontrada || null);

        // Se a publicação tiver turmaId, busca os dados da turma
        if (encontrada?.turmaId) {
          const turmaRes = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
          const lista = turmaRes.data || [];
          const t = lista.find((t) => t.id === encontrada.turmaId);
          setTurma(t || null);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id, user, API]);

  if (carregando) {
    return <p className="info">Carregando detalhes da atividade...</p>;
  }

  if (!publicacao) {
    return <p className="info">Atividade não encontrada.</p>;
  }

  const formatarData = (dataIso) => {
    if (!dataIso) return "—";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />

          {/* 🔹 Menu fixo da turma */}
          <div className="menu-turma">
            <NavLink to={`/professor/turma/${publicacao.turmaId || ""}`}>Painel</NavLink>
            <NavLink to={`/professor/atividades/${publicacao.turmaId || ""}`}>Todas as atividades</NavLink>
            <NavLink to={`/professor/alunos-turma/${publicacao.turmaId || ""}`}>Alunos</NavLink>
          </div>

          {/* 🔹 Cabeçalho da atividade */}
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
          </div><br/>

          {/* 🔹 Corpo do conteúdo */}
          <section className="detalhes-atividade">
            <h3><FaBookOpen /> Descrição</h3>
            <p>{publicacao.descricao || "Sem descrição"}</p>

            <div className="info-bloco">
              {publicacao.tipo === "atividade" && publicacao.entrega && (
                <p><FaClock /> Prazo: {formatarData(publicacao.entrega._seconds ? new Date(publicacao.entrega._seconds * 1000) : publicacao.entrega)}</p>
              )}
              {publicacao.tipo === "avaliacao" && (
                <p><FaCalendarAlt /> Avaliação — Valor total: {publicacao.valor || 0} pts</p>
              )}
              <p><strong>Tipo:</strong> {publicacao.tipo}</p>
              <p><strong>Criada em:</strong> {formatarData(publicacao.criadaEm)}</p>
            </div>

            {publicacao.anexos?.length > 0 && (
              <div className="anexos-detalhes">
                <h3><FaPaperclip /> Anexos</h3>
                <ul>
                  {publicacao.anexos.map((a, i) => (
                    <li key={i}>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        {a.nome || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          
        </main>
      </div>
    </div>
  );
}

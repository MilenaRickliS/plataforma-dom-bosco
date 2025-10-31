import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import "./style.css";
import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { VscKebabVertical } from "react-icons/vsc";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";

export default function Atividades() {
  const { user } = useContext(AuthContext);
  const { id } = useParams(); 
  const [carregando, setCarregando] = useState(true);
  const [publicacoes, setPublicacoes] = useState([]);
  const [turma, setTurma] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  
  useEffect(() => {
    if (!user?.uid || !id) return;
    const carregarTurma = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?id=${id}`);
        setTurma(res.data || null);
        localStorage.setItem("lastTurmaId", id);
      } catch (e) {
        console.error("Erro ao carregar turma:", e);
      }
    };
    carregarTurma();
  }, [user, id, API]);

 
  useEffect(() => {
    if (!user?.uid || !id) return;
    const fetch = async () => {
      try {
        setCarregando(true);
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];

        const filtradas = todas
          .filter(
            (p) =>
              p.turmaId === id &&
              (p.tipo === "atividade" || p.tipo === "avaliacao")
          )
          .sort(
            (a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()
          );

        setPublicacoes(filtradas);
      } catch (e) {
        console.error("Erro ao carregar publicações:", e);
      } finally {
        setCarregando(false);
      }
    };
    fetch();
  }, [user, API, id]);

 
  const getCorTipo = (tipo) => {
    switch (tipo) {
      case "atividade":
        return "#FFC857";
      case "avaliacao":
        return "#B72A4D";
      default:
        return "#999";
    }
  };

  const formatData = (iso) => {
    try {
      const d = new Date(iso);
      const data = d.toLocaleDateString("pt-BR");
      const hora = d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${data} - ${hora}`;
    } catch {
      return "Data inválida";
    }
  };

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main id="sala">
          <MenuTopoAluno />

        
          <div className="menu-turma">
            <NavLink to={`/aluno/turma/${id}`}>Painel</NavLink>
            <NavLink to={`/aluno/atividades/${id}`}>Todas as atividades</NavLink>
            <NavLink to={`/aluno/alunos-turma/${id}`}>Alunos</NavLink>
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
              <h3 style={{ marginBottom: "0.5rem" }}>{titulo}</h3>
              {subtitulo && <p>{subtitulo}</p>}
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

         
          {carregando ? (
            <p className="info">Carregando publicações...</p>
          ) : publicacoes.length === 0 ? (
            <p className="info">
              Nenhuma atividade ou avaliação encontrada para esta turma.
            </p>
          ) : (
            <div className="lista-publicacoes-ativ">
              {publicacoes.map((p) => (
                <Link
                  key={p.id}
                  to={`/aluno/detalhes-ativ/${p.id}`}
                  className="ativ"
                  style={{ borderLeft: `10px solid ${getCorTipo(p.tipo)}` }}
                >
                  <div className="div-atividade">
                    <h4>{p.titulo}</h4>
                    
                    
                    {p.tipo === "atividade" && p.entrega && (
                      <p className="prazo">
                        <strong>Prazo:</strong>{" "}
                        {new Date(p.entrega._seconds * 1000).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    )}
                    {p.tipo === "avaliacao" && (
                      <p className="valor">
                        <strong>Valor total:</strong> {p.valor || 0} pts
                      </p>
                    )}
                  </div>
                  
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

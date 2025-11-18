import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { useContext, useEffect, useState } from "react";
import "./style.css";
import { Link, NavLink, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";
import ChatTurma from "../../../components/portais/ChatTurma";
import { BsFillPersonFill } from "react-icons/bs";

export default function Turma() {
  const { id } = useParams(); 
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const [publicacoes, setPublicacoes] = useState([]);
  const API = import.meta.env.VITE_API_URL;

 
  useEffect(() => {
    if (!user?.uid || !id) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?id=${id}`);
        setTurma(res.data || null);
      } catch (e) {
        console.error("Erro ao carregar turma:", e);
      }
    };
    fetch();
  }, [user, id, API]);

  
  useEffect(() => {
    if (id) {
      try {
        localStorage.setItem("lastTurmaId", id);
      } catch {}
    }
  }, [id]);

  
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

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

  const getCorTipo = (tipo) => {
    switch (tipo) {
      case "conteudo":
        return "#2D408E";
      case "atividade":
        return "#0DB39E";
      case "avaliacao":
        return "#CC3F43";
      default:
        return "#999";
    }
  };

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

              {turma?.professorNome && (
                <p style={{ marginTop: "0.8rem", fontSize: "0.95rem", opacity: 0.9 }}>
                  <BsFillPersonFill /> <strong>Professor:</strong> {turma.professorNome}
                </p>
              )}
            </div>

            {turma?.professorFoto && (
              <img
                src={turma.professorFoto}
                alt="Foto do professor"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #fff",
                  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                }}
              />
            )}
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
                        <Link to={`/aluno/detalhes-ativ/${p.id}`} className="prox-link">
                          Data de entrega: {dataFormatada} - {horaFormatada}h -{" "}
                          <strong>{p.titulo}</strong>
                        </Link>
                      </li>
                    );
                  })}
                {publicacoes.filter((p) => p.tipo === "atividade").length === 0 && (
                  <li className="sem-atividade">Nenhuma atividade com prazo próximo.</li>
                )}
              </ul>
            </div>

            <div className="atividades">
              {publicacoes.length === 0 ? (
                <p className="sem-atividade">Nenhuma publicação encontrada.</p>
              ) : (
                publicacoes.map((p) => (
                  <Link
                    key={p.id}
                    to={`/aluno/detalhes-ativ/${p.id}`}
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

          <ChatTurma codigoTurma={turma?.codigo || ""} />
        </main>
      </div>
    </div>
  );
}

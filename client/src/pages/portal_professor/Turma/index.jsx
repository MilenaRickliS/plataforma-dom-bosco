import { useContext, useEffect, useState } from "react";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import {FaPlus } from "react-icons/fa";
import "./style.css";
import { Link, NavLink, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";
import ChatTurma from "../../../components/portais/ChatTurma";
import { FaEye } from "react-icons/fa6";

export default function Turma() {
  const { codigo } = useParams();
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const [publicacoes, setPublicacoes] = useState([]);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
        const lista = res.data || [];
        const encontrada = codigo ? lista.find((t) => t.codigo === codigo) : null;
        setTurma(encontrada || null);
      } catch (e) {
        console.error("Erro ao carregar turma:", e);
      }
    };
    fetch();
  }, [user, codigo, API]);

  useEffect(() => {
    if (codigo) {
      try {
        localStorage.setItem("lastTurmaCodigo", codigo);
      } catch {}
    }
  }, [codigo]);

  useEffect(() => {
    if (!codigo) return;
    const carregarPublicacoes = async () => {
      try {
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];
        const filtradas = todas.filter((p) => p.turmaCodigo === codigo);
        setPublicacoes(filtradas);
      } catch (e) {
        console.error("Erro ao carregar publicações:", e);
      }
    };
    carregarPublicacoes();
  }, [codigo, API]);

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || (codigo ? `Código: ${codigo}` : "");

  
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
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />
          
          <div className="menu-turma">
            <NavLink to={codigo ? `/professor/turma/${codigo}` : "/professor/turma"}>
              Painel
            </NavLink>
            <NavLink to={codigo ? `/professor/atividades/${codigo}` : "/professor/turma"}>Todas as atividades</NavLink>
            <NavLink to={codigo ? `/professor/alunos-turma/${codigo}` : "/professor/alunos-turma"}>Alunos</NavLink>
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
              {subtitulo ? <p>{subtitulo}</p> : null}
             <button
                className="btn-codigo"
                onClick={() => setMostrarCodigo(true)}
              >
                <FaEye /> Mostrar Código da Turma
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
                    <div>
                      <h4>{p.titulo}</h4>
                      <p>{p.descricao || "Sem descrição"}</p>

                      {p.tipo === "atividade" && p.entrega && (
                        <p>
                          <strong>Prazo:</strong>{" "}
                          {new Date(p.entrega._seconds * 1000).toLocaleDateString("pt-BR")}
                        </p>
                      )}

                      {p.tipo === "avaliacao" && (
                        <p>
                          <strong>Valor total:</strong> {p.valor || 0} pts
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          <ChatTurma codigoTurma={codigo} />

           {mostrarCodigo && (
            <div className="overlay-codigo" onClick={() => setMostrarCodigo(false)}>
              <div className="modal-codigo" onClick={(e) => e.stopPropagation()}>
                <h2>Código da Turma</h2>
                <p className="codigo-grande">{codigo}</p>
                <button onClick={() => setMostrarCodigo(false)}>Fechar</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { VscKebabVertical } from "react-icons/vsc";
import { FaEye } from "react-icons/fa6";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import axios from "axios";
import { useParams } from "react-router-dom";


export default function Atividades() {
  const { user } = useContext(AuthContext);
  const { codigo } = useParams();
  const [carregando, setCarregando] = useState(true);
  const [publicacoes, setPublicacoes] = useState([]);
   const [turma, setTurma] = useState(null);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const API = import.meta.env.VITE_API_URL;


  useEffect(() => {
    if (!user?.uid) return;
    const carregarTurma = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
        const lista = res.data || [];
        const encontrada =
          codigo
            ? lista.find((t) => t.codigo === codigo)
            : lista.find((t) => t.codigo === localStorage.getItem("lastTurmaCodigo"));
        setTurma(encontrada || null);
      } catch (e) {
        console.error("Erro ao carregar turma:", e);
      }
    };
    carregarTurma();
  }, [user, codigo, API]);

   useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        setCarregando(true);
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];

        let turmaCodigo = null;
        try { turmaCodigo = localStorage.getItem("lastTurmaCodigo"); } catch {}

        
        const filtradas = todas
          .filter(
            (p) =>
              p.turmaCodigo === turmaCodigo &&
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
  }, [user, API]);

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
  const subtitulo = turma?.nomeTurma || (codigo ? `Código: ${codigo}` : "");

  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main id="sala">
            <MenuTopoProfessor/>
            <div className="menu-turma">
              <NavLink to={codigo ? `/professor/turma/${codigo}` : "/professor/turma"}>
                Painel
              </NavLink>
              <NavLink to={codigo ? `/professor/atividades/${codigo}` : "/professor/atividades"}>Todas as atividades</NavLink>
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
            <br/>
          <div className="postar-ativ">
            <NavLink to="/add-atividade-professor" className="botao-postar-ativ">
              + Adicionar atividade
            </NavLink>
          </div><br/>

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
                  to={`/professor/detalhes-ativ/${p.id}`}
                  className="ativ"
                  style={{ borderLeft: `10px solid ${getCorTipo(p.tipo)}` }}
                >
                  <div>
                    <h4>{p.titulo}</h4>
                    <p>{p.descricao || "Sem descrição"}</p>
                    <p>
                      <strong>Postada em:</strong> {formatData(p.criadaEm)}
                    </p>
                    {p.tipo === "atividade" && p.entrega && (
                      <p>
                        <strong>Prazo:</strong>{" "}
                        {new Date(p.entrega._seconds * 1000).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    )}
                    {p.tipo === "avaliacao" && (
                      <p>
                        <strong>Valor total:</strong> {p.valor || 0} pts
                      </p>
                    )}
                  </div>
                  <VscKebabVertical />
                </Link>
              ))}
            </div>
          )}
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
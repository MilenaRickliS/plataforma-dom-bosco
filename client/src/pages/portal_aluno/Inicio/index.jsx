import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import prof from "../../../assets/site/Enri-Clemente-Leigman-scaled-removebg-preview.png";
import { GoKebabHorizontal } from "react-icons/go";
import { MdOutlinePushPin, MdAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import { FaSearch } from "react-icons/fa";
import { FaQuoteLeft } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import frases from "../../../data/frases.json";

export default function Inicio() {
  const { user } = useContext(AuthContext); 
  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [fraseHoje, setFraseHoje] = useState("");
  const API = import.meta.env.VITE_API_URL;

  
  useEffect(() => {
    if (!user?.uid) return;
    const fetchTurmas = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}`);
        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao carregar turmas do aluno:", err);
      }
    };
    fetchTurmas();
  }, [user]);

 
  const handleIngressar = async () => {
    if (!codigo.trim()) {
      alert("Digite o código da turma.");
      return;
    }
    if (!user?.uid) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    try {
      await axios.post(`${API}/api/turmas/ingressar`, {
        codigo,
        alunoId: user.uid, 
      });
      alert("Ingressou na turma com sucesso!");
      setOpen(false);
      setCodigo("");

      
      const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}`);
      setTurmas(res.data);
    } catch (err) {
      console.error("Erro ao ingressar:", err.response?.data || err);
      alert(err.response?.data?.error || "Código inválido ou erro ao ingressar.");
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );

    
    const somaChar = user.uid
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);

   
    const index = (diaDoAno + somaChar) % frases.length;

    setFraseHoje(frases[index]);
  }, [user]);


  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />
          <div className="barra-pesquisa-dashboard">
            <p>Pesquisar...</p>
            <FaSearch />
          </div>
          <div className="inicio-dashboard">
            <div className="frase">
              <FaQuoteLeft />
              <p>{fraseHoje}</p>
            </div>
            <div className="agenda">
              <div className="mini-calendario">
                <div className="topo-mini">
                  <h3>{new Date().toLocaleString("pt-BR", { month: "long" })} {new Date().getFullYear()}</h3>
                </div>
                <div className="semana-mini">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((dia) => (
                    <span key={dia}>{dia}</span>
                  ))}
                </div>
                <div className="dias-mini">
                  {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map((dia) => {
                    const hoje = new Date();
                    const isHoje =
                      dia === hoje.getDate() &&
                      hoje.getMonth() === new Date().getMonth() &&
                      hoje.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={dia}
                        className={`dia-mini ${isHoje ? "hoje-mini" : ""}`}
                      >
                        {dia}
                      </div>
                    );
                  })}
                </div>
                <Link to="/aluno/agenda" className="botao-mini-agenda">Ver Agenda Completa</Link>
              </div>
            </div>

          </div>
          <div className="dashboard">
            <div>
              <div className="turmas-grid">
                {turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <Link
                      key={turma.codigo}
                      to={`/aluno/turma/${turma.codigo}`}
                      className="container-turma"
                    >
                      <div className="turma-inicio">
                        <div className="img-turma">
                          <img src={turma.imagem || prof} alt="turma" />
                          <GoKebabHorizontal size={20} className="kebab-icon" />
                        </div>
                        <p>{turma.nomeTurma}</p>
                      </div>
                      <div className="atividades-turma">
                        <p>
                          <MdOutlinePushPin /> {turma.materia}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="sem-turmas">Nenhuma turma encontrada.</p>
                )}
              </div>
              <div className="section-avisos">
                <p>Avisos e Comunicados</p>
                <div className="aviso">
                  <div>
                    <strong>Titulo</strong>
                    <p>descricao</p>
                    <strong>Atensiosamente,<br/>Nome Completo</strong>
                  </div>
                  <Link to="/aluno/avisos"><FaBell /> Visualizar todos</Link>
                </div>
              </div>
            </div>
            <div>
              <p>Vídeo Destaque</p>
              <div>
                Vídeo
              </div>
            </div>
          </div>
          
          <button className="botao-flutuante" onClick={() => setOpen(true)}>
            <MdAdd size={28} />
          </button>

          
          {open && (
            <div className="modal-criar">
              <div className="modal-content">
                <h2>Ingressar em uma turma</h2>
                <input
                  placeholder="Código da Turma"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <button onClick={handleIngressar}>Ingressar</button>
                <button onClick={() => setOpen(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

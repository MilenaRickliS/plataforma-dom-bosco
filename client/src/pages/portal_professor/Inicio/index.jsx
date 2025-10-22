import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import { MdAdd, MdOutlinePushPin } from "react-icons/md";
import { GoKebabHorizontal } from "react-icons/go";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";
import { FaSearch } from "react-icons/fa";
import { FaQuoteLeft } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import frases from "../../../data/frases.json";

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [nomeTurma, setNomeTurma] = useState("");
  const [materia, setMateria] = useState("");
  const [imagem, setImagem] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [fraseHoje, setFraseHoje] = useState("");
  const API = import.meta.env.VITE_API_URL;

  
  useEffect(() => {
    if (!user?.uid) return;
    const fetchTurmas = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?professorId=${user.uid}`);
        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    };
    fetchTurmas();
  }, [user]);

  const handleUpload = async () => {
    if (!imagem) return null;
    const data = new FormData();
    data.append("file", imagem);
    data.append("upload_preset", "plataforma_dom_bosco");
    data.append("folder", "turmas");
    const res = await axios.post(`https://api.cloudinary.com/v1_1/dfbreo0qd/image/upload`, data);
    return res.data.secure_url;
  };

  const handleCriar = async () => {
    if (!user?.uid) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }
    if (!nomeTurma || !materia) {
      alert("Preencha todos os campos antes de criar a turma.");
      return;
    }

    try {
      const imgUrl = await handleUpload();
      const { data } = await axios.post(`${API}/api/turmas/criar`, {
        nomeTurma,
        materia,
        imagem: imgUrl,
        professorId: user.uid,
      });
      alert(`Turma criada com sucesso!\nCódigo: ${data.codigo}`);
      setOpen(false);
      setNomeTurma("");
      setMateria("");
      setImagem(null);
      
      setTurmas((prev) => [...prev, { nomeTurma, materia, imagem: imgUrl, codigo: data.codigo }]);
    } catch (error) {
      console.error("Erro ao criar turma:", error.response?.data || error);
      alert("Erro ao criar turma. Verifique os dados e tente novamente.");
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

  if (!user) {
    return <p>Carregando informações do professor...</p>;
  }

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
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
                  <Link to="/professor/agenda" className="botao-mini-agenda">Ver Agenda Completa</Link>
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
                         to={`/professor/turma/${turma.codigo}`}
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
                            <Link to="/professor/avisos"><FaBell /> Visualizar todos</Link>
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
                <h2>Criar Turma</h2>
                <input
                  placeholder="Nome da Turma"
                  value={nomeTurma}
                  onChange={(e) => setNomeTurma(e.target.value)}
                />
                <input
                  placeholder="Matéria"
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                />
                <input type="file" onChange={(e) => setImagem(e.target.files[0])} />
                <button onClick={handleCriar}>Criar</button>
                <button onClick={() => setOpen(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

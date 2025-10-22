import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import { MdAdd, MdOutlinePushPin } from "react-icons/md";
import { GoKebabHorizontal } from "react-icons/go";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [nomeTurma, setNomeTurma] = useState("");
  const [materia, setMateria] = useState("");
  const [imagem, setImagem] = useState(null);
  const [turmas, setTurmas] = useState([]);
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
      // Atualiza lista
      setTurmas((prev) => [...prev, { nomeTurma, materia, imagem: imgUrl, codigo: data.codigo }]);
    } catch (error) {
      console.error("Erro ao criar turma:", error.response?.data || error);
      alert("Erro ao criar turma. Verifique os dados e tente novamente.");
    }
  };

  if (!user) {
    return <p>Carregando informações do professor...</p>;
  }

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
          <h1>Minhas Turmas</h1>

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
                      <img src={turma.imagem} alt={turma.nomeTurma} />
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
              <p className="sem-turmas">Nenhuma turma criada ainda.</p>
            )}
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

import { useContext, useEffect, useState } from "react";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { VscKebabVertical } from "react-icons/vsc";
import { FaFolder } from "react-icons/fa";
import "./style.css";
import { Link, NavLink, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";

export default function Turma() {
  const { codigo } = useParams();
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/turmas?alunoId=${user.uid}`);
        const lista = res.data || [];
        const encontrada = codigo ? lista.find((t) => t.codigo === codigo) : null;
        setTurma(encontrada || null);
      } catch (e) {
        console.error("Erro ao carregar turma do aluno:", e);
      }
    };
    fetch();
  }, [user, codigo, API]);

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || (codigo ? `Código: ${codigo}` : "");

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main id="sala">
          <MenuTopoAluno />
          <div className="menu-turma">
            <NavLink to={codigo ? `/aluno/turma/${codigo}` : "/aluno/turma"}>Painel</NavLink>
            <NavLink to="/aluno/atividades">Todas as atividades</NavLink>
            <NavLink to="/aluno/alunos-turma">Alunos</NavLink>
          </div>
          <div className="titulo-sala">
            <h3>{titulo}</h3>
            {subtitulo ? <p>{subtitulo}</p> : null}
          </div>
          <div className="ativ-sala">
            <div className="prox-ativ">
              <p>Próximas atividades</p>
              <ul>
                <li>Data de entrega:15/09 - 00:00h - Atividade 1</li>
              </ul>
            </div>
            <Link to="/aluno/detalhes-ativ" className="atividade">
              <FaFolder className="folder" />
              <div>
                <h4>Título Atividade</h4>
                <p>Prazo 00/00/00 - 00h</p>
              </div>
              <VscKebabVertical />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> main

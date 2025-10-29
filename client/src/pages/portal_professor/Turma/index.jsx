import { useContext, useEffect, useState } from "react";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { VscKebabVertical } from "react-icons/vsc";
import { FaFolder } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
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
      try { localStorage.setItem('lastTurmaCodigo', codigo); } catch {}
    }
  }, [codigo]);

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || (codigo ? `Código: ${codigo}` : "");

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />
          <div className="menu-turma">
            <NavLink to={codigo ? `/professor/turma/${codigo}` : "/professor/turma"}>Painel</NavLink>
            <NavLink to="/professor/atividades">Todas as atividades</NavLink>
            <NavLink to="/professor/alunos-turma">Alunos</NavLink>
          </div>
          <div className="titulo-sala-alunos">
            <div>
              <h3>{titulo}</h3>
              {subtitulo ? <p>{subtitulo}</p> : null}
            </div>
            <div className="botoes-chamada">
              <Link to="/add-atividade-professor" className="botao-postar-avisos">
                <FaPlus /> adicionar atividade
              </Link>
            </div>
          </div>
          <div className="ativ-sala">
            <div className="prox-ativ">
              <p>Próximas atividades</p>
              <ul>
                <li>Data de entrega:15/09 - 00:00h - Atividade 1</li>
              </ul>
            </div>
            <Link to="/professor/detalhes-ativ" className="atividade">
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
}


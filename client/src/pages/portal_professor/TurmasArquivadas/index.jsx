import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";

export default function TurmasArquivadas() {
  const { user } = useContext(AuthContext);
  const [turmas, setTurmas] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user?.uid) return;
    axios
      .get(`${API}/api/turmas?professorId=${user.uid}&arquivada=true`)
      .then((res) => setTurmas(res.data))
      .catch((err) => console.error("Erro ao carregar turmas arquivadas:", err));
  }, [user]);

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
          <h2 className="titulo-arquivadas">Turmas Arquivadas</h2>
          <div className="turmas-grid">
            {turmas.length ? (
              turmas.map((turma) => (
                <div className="container-turma arquivada">
                  <img src={turma.imagem} className="img-turma" />
                  <p>{turma.nomeTurma}</p>
                  <p>{turma.materia}</p>
                  <small>(somente visualização)</small>
                  <button
                    className="btn-acao desarquivar"
                    onClick={async () => {
                      if (confirm("Deseja desarquivar esta turma?")) {
                        await axios.patch(`${API}/api/turmas/desarquivar?id=${turma.id}`);
                        alert("Turma desarquivada com sucesso!");
                        window.location.reload();
                      }
                    }}
                  >
                    🔓 Desarquivar
                  </button>

                </div>

              ))
            ) : (
              <p className="sem-turmas">Nenhuma turma arquivada.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

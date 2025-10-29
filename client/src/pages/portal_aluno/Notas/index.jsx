import { useContext, useEffect, useState } from "react";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { AuthContext } from "../../../contexts/auth";
import { FaMedal } from "react-icons/fa6";
import "./style.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";

export default function Notas() {
  const { user } = useContext(AuthContext);
  const [medalhas, setMedalhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    async function carregarMedalhas() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/medalhas/aluno/${user.uid}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao buscar medalhas");
        setMedalhas(data);
      } catch (err) {
        console.error("Erro ao carregar medalhas:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarMedalhas();
  }, [user]);

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main className="notas-aluno">
          <MenuTopoAluno />
          <h2 className="titulo-medalhas-aluno">🏅 Minhas Medalhas</h2>

          {loading ? (
            <p className="aviso-carregando">Carregando medalhas...</p>
          ) : medalhas.length === 0 ? (
            <p className="aviso-vazio">Você ainda não recebeu nenhuma medalha.</p>
          ) : (
            <div className="grid-medalhas-aluno">
              {medalhas.map((m) => (
                <div key={m.id} className="card-medalha-aluno">
                  <div
                    className="imagem-medalha"
                    style={{ borderColor: m.template?.color || "#2563eb" }}
                  >
                    {m.template?.imageUrl ? (
                      <img
                        src={m.template.imageUrl}
                        alt={m.template.title}
                      />
                    ) : (
                      <FaMedal
                        style={{
                          color: m.template?.color || "#2563eb",
                          fontSize: 50,
                        }}
                      />
                    )}
                  </div>

                  <div className="info-medalha-aluno">
                    <h4>{m.template?.title || "Medalha"}</h4>
                    <p className="categoria-aluno">
                      {m.template?.category || "Sem categoria"}
                    </p>
                    {m.comment && (
                      <p className="comentario">
                        <FaRegComment /> <em>{m.comment}</em>
                      </p>
                    )}
                    <p className="data">
                      <FaRegCalendarAlt /> {new Date(m.awardedAt._seconds * 1000).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useContext, useEffect, useState } from "react";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { AuthContext } from "../../../contexts/auth";
import { FaMedal } from "react-icons/fa6";
import "./style.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { BiHappyHeartEyes } from "react-icons/bi";
import { TbMoodSadSquint } from "react-icons/tb";
import { FaRegFaceGrinBeamSweat } from "react-icons/fa6";
import { getPontos } from "../../../services/gamificacao";
import { db } from "../../../services/firebaseConnection";
import {
  collection,
  query,
  where,
  getDocs,

} from "firebase/firestore";
import { adicionarPontos, removerPontos, mostrarToastPontosAdicionar, mostrarToastPontosRemover, regrasPontuacao } from "../../../services/gamificacao";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Notas() {
  const { user } = useContext(AuthContext);
  const [medalhas, setMedalhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pontos, setPontos] = useState(0);
  const [perfil, setPerfil] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
  async function carregarMedalhas() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medalhas/aluno/${user.uid}`);
      const data = await res.json();
      setMedalhas(data);

      
      const medalhasAntigas = JSON.parse(localStorage.getItem("medalhasAluno") || "[]");

    
      const novas = data.filter((m) => !medalhasAntigas.find((a) => a.id === m.id));
      if (novas.length > 0) {
        await adicionarPontos(user.uid, regrasPontuacao.receberMedalha, "Você recebeu uma nova medalha! 🥇");
        mostrarToastPontosAdicionar(
          regrasPontuacao.receberMedalha,
          "Você recebeu uma nova medalha! 🥇"
        );
      }

      
      const removidas = medalhasAntigas.filter((a) => !data.find((m) => m.id === a.id));
      if (removidas.length > 0) {
        await removerPontos(user.uid, regrasPontuacao.perderMedalha, "Você perdeu uma medalha 😞");
        mostrarToastPontosRemover(
          regrasPontuacao.perderMedalha,
          "Você perdeu uma medalha 😞"
        );
      }

      
      localStorage.setItem("medalhasAluno", JSON.stringify(data));

    } catch (err) {
      console.error("Erro ao carregar medalhas:", err);
    } finally {
      setLoading(false);
    }
  }

  if (user?.uid) carregarMedalhas();
}, [user]);


  useEffect(() => {
    if (user?.uid) getPontos(user.uid).then(setPontos);
  }, [user]);

  let icone, humor, corHumor;

  if (pontos < 25) {
    icone = <TbMoodSadSquint color="red" size={40} />;
    humor = "Triste 😢";
    corHumor = "red";
  } else if (pontos < 50) {
    icone = <FaRegFaceGrinBeamSweat color="orange" size={40} />;
    humor = "Feliz 😊";
    corHumor = "orange";
  } else {
    icone = <BiHappyHeartEyes color="green" size={40} />;
    humor = "Apaixonado 😍";
    corHumor = "green";
  }


  useEffect(() => {
    async function carregarMedalhas() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/medalhas/aluno/${user.uid}`);
        const data = await res.json();
        setMedalhas(data);

      
        const medalhasAntigas = JSON.parse(localStorage.getItem("medalhasProcessadas") || "[]");
        const idsAtuais = data.map((m) => m.id);

        
        const novas = data.filter((m) => !medalhasAntigas.includes(m.id));
        if (novas.length > 0) {
          await adicionarPontos(user.uid, regrasPontuacao.receberMedalha, "Você recebeu uma nova medalha! 🥇");
          mostrarToastPontosAdicionar(
            regrasPontuacao.receberMedalha,
            `Você recebeu ${novas.length > 1 ? `${novas.length} novas medalhas! 🥇` : "uma nova medalha! 🥇"}`
          );
        }

       
        const removidas = medalhasAntigas.filter((id) => !idsAtuais.includes(id));
        if (removidas.length > 0) {
          await removerPontos(user.uid, regrasPontuacao.perderMedalha, "Você perdeu uma medalha 😞");
          mostrarToastPontosRemover(
            regrasPontuacao.perderMedalha,
            `Você perdeu ${removidas.length > 1 ? `${removidas.length} medalhas 😞` : "uma medalha 😞"}`
          );
        }

      
        if (novas.length > 0 || removidas.length > 0) {
          localStorage.setItem("medalhasProcessadas", JSON.stringify(idsAtuais));
        }
      } catch (err) {
        console.error("Erro ao carregar medalhas:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) carregarMedalhas();
  }, [user]);


  return (
    <div className="layout">
       <ToastContainer position="bottom-right" theme="colored" />
      <MenuLateralAluno />
      <div className="page2">
        <main className="notas-aluno">
          <MenuTopoAluno />
          <div className="meu-ranking">
              {!perfil ? (
                  <p>Carregando perfil...</p>
                ) : (
                  <img
                    src={preview || perfil?.foto || "/src/assets/user-placeholder.png"}
                    alt="Foto do usuário"
                    className="foto-circulo-ranking"
                    onError={(e) => e.target.src = "/src/assets/user-placeholder.png"}
                  />
                )}

            <div className="status-pontuacao">
              <p className="meus-pontos">Meus pontos</p>              
              
              <p className="pontos">{pontos} pontos</p>
              <p style={{ color: corHumor }}>{humor}</p>
            </div>

          </div>
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

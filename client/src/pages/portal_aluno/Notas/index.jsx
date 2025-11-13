import { useContext, useEffect, useState } from "react";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { AuthContext } from "../../../contexts/auth";
import { FaBook, FaMedal, FaRegCalendarAlt, FaRegComment } from "react-icons/fa";
import { BiHappyHeartEyes } from "react-icons/bi";
import { TbMoodSadSquint } from "react-icons/tb";
import { FaRegFaceGrinBeamSweat } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import { getPontos } from "../../../services/gamificacao.jsx";
import { db } from "../../../services/firebaseConnection";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function NotasAluno() {
  const { user } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [boletim, setBoletim] = useState([]);
  const [medalhas, setMedalhas] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
 const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";


 
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const q = query(collection(db, "usuarios"), where("email", "==", user.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setPerfil({ id: doc.id, ...doc.data() });
        }
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    }
    if (user?.email) carregarPerfil();
  }, [user]);

  
  useEffect(() => {
    if (!user?.uid) return;
    const carregarTurmas = async () => {
      try {
        const res = await fetch(`${API}/api/turmas?alunoId=${user.uid}`);
        const data = await res.json();
        setTurmas(data || []);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    };
    carregarTurmas();
  }, [user, API]);

  
  useEffect(() => {
  if (!turmaSelecionada || !user?.uid) return;
  const carregarBoletim = async () => {
    try {
      setLoading(true);


      const [atividadesRes, notasRes] = await Promise.all([
        fetch(`${API}/api/atividade?turmaId=${turmaSelecionada}`).then(r => r.json()),
        fetch(`${API}/api/notas?turmaId=${turmaSelecionada}`).then(r => r.json())
      ]);

      console.log("📘 Notas retornadas:", notasRes);

     
      const notasAluno = (notasRes || []).filter(n => n.alunoId === user.uid);

      const avaliacoesEncontradas = [];
      notasAluno.forEach(n => {
        if (n.tipo === "avaliacao" && !avaliacoesEncontradas.some(a => a.id === n.itemId)) {
          avaliacoesEncontradas.push({
            id: n.itemId,
            titulo: n.titulo || "Avaliação",
            valor: n.valorPadrao || 10,
            nota: n.valor ?? null,
          });
        }
      });

      const todas = [
        ...atividadesRes.map(a => ({
          tipo: "Atividade",
          titulo: a.titulo,
          valor: a.valor || 10,
          nota: notasAluno.find(n => n.itemId === a.id && n.tipo === "atividade")?.valor ?? null,
        })),
        ...avaliacoesEncontradas.map(av => ({
          tipo: "Avaliação",
          titulo: av.titulo,
          valor: av.valor,
          nota: av.nota ?? null,
        })),
      ];

      const notasValidas = todas.map(t => Number(t.nota) || 0);
      const soma = notasValidas.reduce((acc, n) => acc + n, 0);
      const mediaParcial = todas.length > 0 ? soma / todas.length : 0;

      const notaExtra = notasAluno.find(n => n.tipo === "extra")?.valor || 0;
      const mediaFinal = Math.min(mediaParcial + notaExtra, 10);

      setBoletim({ linhas: todas, mediaParcial, notaExtra, mediaFinal });
    } catch (err) {
      console.error("Erro ao carregar boletim:", err);
      toast.error("Erro ao carregar notas.");
    } finally {
      setLoading(false);
    }
  };
  carregarBoletim();
}, [turmaSelecionada, user, API]);


 
  useEffect(() => {
  if (!user || !user.uid) {
    console.log("⏳ Aguardando user carregar...");
    return;
  }

  async function carregarMedalhasEPontos() {
    try {
      console.log("🚀 Buscando medalhas e pontos do aluno:", user.uid);
      const [medalhasRes, pontosRes] = await Promise.all([
        fetch(`${API}/api/medalhas/aluno/${user.uid}`).then(r => r.json()),
        getPontos(user.uid),
      ]);
      setMedalhas(medalhasRes || []);
      setPontos(pontosRes);
      console.log("🎯 Pontos recebidos:", pontosRes);
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados do aluno.");
    }
  }

  carregarMedalhasEPontos();
}, [user?.uid, API]);


 
  const humorIcone =
    pontos < 25 ? <TbMoodSadSquint color="red" size={40} /> :
    pontos < 50 ? <FaRegFaceGrinBeamSweat color="orange" size={40} /> :
    <BiHappyHeartEyes color="green" size={40} />;

  const humorLabel =
    pontos < 25 ? "Triste 😢" :
    pontos < 50 ? "Feliz 😊" : "Motivado 😍";

  const corHumor =
    pontos < 25 ? "red" :
    pontos < 50 ? "orange" : "green";

  const formatarData = (valor) => {
    if (!valor) return "—";
    const data = valor._seconds ? new Date(valor._seconds * 1000) : new Date(valor);
    return data.toLocaleDateString("pt-BR");
  };

  return (
    <div className="layout">
     
      <MenuLateralAluno />
      <div className="page2">
        <main className="notas-aluno">
          <MenuTopoAluno />

          
          <div className="meu-ranking">
            <img
              src={perfil?.foto || "/src/assets/user-placeholder.png"}
              alt="Foto do usuário"
              className="foto-circulo-ranking"
              onError={(e) => (e.target.src = "/src/assets/user-placeholder.png")}
            />
            <div key={user?.uid} className="status-pontuacao">
              <p className="meus-pontos">Meus pontos</p>
              <p className="pontos">
                {pontos === 0 ? "Carregando..." : `${pontos} pontos`}
              </p>
              <p style={{ color: corHumor }}>{humorLabel}</p>
            </div>

          </div>

          
          <section className="selecao-turma">
            <label>
              <strong>Selecione sua turma:</strong>
              <select
                value={turmaSelecionada}
                onChange={(e) => setTurmaSelecionada(e.target.value)}
              >
                <option value="">Selecione...</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomeTurma} — {t.materia} ({t.professorNome})
                  </option>
                ))}
              </select>
            </label>
          </section>

          
          {turmaSelecionada && (
            <section className="boletim-section">
              <h3><FaBook /> Meu Boletim</h3>
              {loading ? (
                <p>Carregando boletim...</p>
              ) : boletim.linhas?.length === 0 ? (
                <p>Você ainda não possui notas nesta turma.</p>
              ) : (
                <>
                  <div className="boletim-tabela-container">
                    <table className="boletim-tabela">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Atividade</th>
                          <th>Nota</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boletim.linhas.map((linha, i) => (
                          <tr key={i}>
                            <td>{linha.tipo}</td>
                            <td>{linha.titulo}</td>
                            <td><strong>{linha.nota ?? "—"}</strong></td>
                            <td>{linha.valor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="boletim-resumo">
                    <p><strong>Média Parcial:</strong> {boletim.mediaParcial.toFixed(1)}</p>
                    <p><strong>Nota Extra:</strong> {boletim.notaExtra}</p>
                    <p><strong>Média Final:</strong> {boletim.mediaFinal.toFixed(1)}</p>
                  </div>
                </>
              )}
            </section>
          )}

          
          <section className="medalhas-section">
            <h3 className="titulo-medalhas-aluno">🏅 Minhas Medalhas</h3>
            {medalhas.length === 0 ? (
              <p>Você ainda não recebeu medalhas.</p>
            ) : (
              <div className="grid-medalhas-aluno">
                {medalhas.map((m) => (
                  <div key={m.id} className="card-medalha-aluno">
                    <div
                      className="imagem-medalha"
                      style={{ borderColor: m.template?.color || "#2563eb" }}
                    >
                      {m.template?.imageUrl ? (
                        <img src={m.template.imageUrl} alt={m.template.title} />
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
                      <p>{m.template?.category || "Sem categoria"}</p>
                      {m.comment && (
                        <p className="comentario">
                          <FaRegComment /> <em>{m.comment}</em>
                        </p>
                      )}
                      <p className="data">
                        <FaRegCalendarAlt /> {formatarData(m.awardedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";
import { LuSendHorizontal } from "react-icons/lu";
import { IoChatbubblesOutline } from "react-icons/io5";

export default function ChatPrivado({ atividadeId, aluno, nomeAtividade }) {
  const { user } = useContext(AuthContext);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const API = import.meta.env.VITE_API_URL;
 const alunoId = aluno?.uid || aluno?.id;

  useEffect(() => {
    if (!atividadeId || !alunoId) return;

    const carregarMensagens = async () => {
      try {
        const res = await axios.get(`${API}/api/chatPrivado`, {
          params: { atividadeId, alunoId },
        });
        setMensagens(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar chat privado:", err);
      }
    };

    carregarMensagens();
    const interval = setInterval(carregarMensagens, 4000); 
    return () => clearInterval(interval);
  }, [atividadeId, alunoId]);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    await axios.post(`${API}/api/chatPrivado`, {
      atividadeId,
      alunoId,
      autorId: user.uid,
      autorNome: user.nome || "Usuário",
      texto,
    });
    await adicionarPontos(user.uid, regrasPontuacao.enviarDuvida, "Enviou dúvida ao professor");
    mostrarToastPontosAdicionar(regrasPontuacao.enviarDuvida, "Enviou dúvida ao professor");


    setTexto("");
  };

  return (
    <div className="chat-privado">
      <h3>
  <IoChatbubblesOutline /> Chat Particular -{" "}
        {user?.tipo === "professor"
            ? aluno?.nome || "Aluno"
            : "Professor"}
        </h3>


      <p className="info-chat-privado">
        Esta conversa é privada entre o professor e o aluno, referente à atividade:
        <strong> {nomeAtividade}</strong>.
      </p>

      <div className="mensagens-privado">
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`msg ${m.autorId === user.uid ? "enviada" : "recebida"}`}
          >
            <strong>{m.autorNome}</strong>
            <p>{m.texto}</p>
          </div>
        ))}
      </div>

      <form onSubmit={enviarMensagem} className="chat-privado-form">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button type="submit"><LuSendHorizontal /> Enviar</button>
      </form>
    </div>
  );
}

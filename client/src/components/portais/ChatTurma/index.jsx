import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import { FaComments } from "react-icons/fa6";
import "./style.css";
import { IoClose } from "react-icons/io5";
import { IoSendSharp } from "react-icons/io5";
import {
  adicionarPontos,
  mostrarToastPontosAdicionar,
  regrasPontuacao,
} from "../../../services/gamificacao.jsx";

export default function ChatTurma({ codigoTurma }) {
  const { user } = useContext(AuthContext);
  const API = import.meta.env.VITE_API_URL;
  const [open, setOpen] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");

  useEffect(() => {
  console.log("Usuário logado:", user);
}, [user]);


  useEffect(() => {
    if (!codigoTurma) return;
    const fetchMensagens = async () => {
      const res = await axios.get(`${API}/api/chat?codigoTurma=${codigoTurma}`);
      setMensagens(res.data);
    };
    fetchMensagens();

    
    const interval = setInterval(fetchMensagens, 5000);
    return () => clearInterval(interval);
  }, [codigoTurma]);

 const enviarMensagem = async () => {
  if (!texto.trim()) return;

  try {
    await axios.post(`${API}/api/chat`, {
      codigoTurma,
      autorId: user.uid,
      autorNome: user.nome || "Usuário",
      texto,
    });

    const key = `chat-turma-${user.uid}`;
      const agora = Date.now();
      const ultima = localStorage.getItem(key);
    
      if (!ultima || agora - ultima > 60000) {
        if (user?.role === "aluno") {
          await adicionarPontos(user.uid, regrasPontuacao.enviarDuvida, "Participou do chat da turma");
          mostrarToastPontosAdicionar(regrasPontuacao.enviarDuvida, "Participou do chat da turma");
        } else if (user?.role === "professor") {
          await adicionarPontos(user.uid, regrasPontuacao.responderDuvida, "Interagiu no chat da turma");
          mostrarToastPontosAdicionar(regrasPontuacao.responderDuvida, "Interagiu no chat da turma");
        }

        localStorage.setItem(key, agora.toString());
      }
    setTexto("");
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
};


  return (
    <>
      
      <button className="botao-chat" onClick={() => setOpen(!open)}>
        <FaComments />
      </button>

     
      {open && (
        <div className="chat-container">
          <div className="chat-header">
            <strong>Chat da Turma</strong>
            <button onClick={() => setOpen(false)}><IoClose /></button>
          </div>

          <div className="chat-mensagens">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`msg ${msg.autorId === user.uid ? "eu" : "outro"}`}
              >
                <p className="autor">{msg.autorNome}</p>
                <p className="texto">{msg.texto}</p>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={texto}
              placeholder="Digite uma mensagem..."
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
            />
            <button onClick={enviarMensagem}><IoSendSharp /></button>
          </div>
        </div>
      )}
    </>
  );
}

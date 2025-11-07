import axios from "axios";
const API = import.meta.env.VITE_API_URL;
import { toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function adicionarPontos(userId, valor, motivo = "Ação positiva") {
  await axios.post(`${API}/api/gamificacao/add`, { userId, valor, motivo });
}

export async function removerPontos(userId, valor, motivo = "Ação negativa") {
  await axios.post(`${API}/api/gamificacao/remove`, { userId, valor, motivo });
}

export async function getPontos(userId) {
  const res = await axios.get(`${API}/api/gamificacao/${userId}`);
  return res.data.pontos;
}

export function mostrarToastPontosAdicionar(valor, motivo) {
  

  toast.success(
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "1.8rem" }}>🏆</span>
      <div>
        <strong>+{Math.abs(valor)} pts!</strong>
        <div style={{ fontSize: "0.9rem" }}>{motivo}</div>
      </div>
    </div>,
    {
      containerId: "gamificacao",
      transition: Zoom,
      style: {
        background: "linear-gradient(135deg, #00c853, #b2ff59)",
        border: "2px solid #d4ff00",
        boxShadow: "0 0 20px rgba(180,255,0,0.8)",
        color: "#fff",
      },
      icon: false,
    }
  );
}


export function mostrarToastPontosRemover(valor, motivo) {
  toast.error(
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "1.8rem" }}>💀</span>
      <div>
        <strong>-{Math.abs(valor)} pts!</strong>
        <div style={{ fontSize: "0.9rem" }}>{motivo}</div>
      </div>
    </div>,
    {
      containerId: "penalidade",
      transition: Zoom,
      
      style: {
        background: "linear-gradient(135deg, #b71c1c, #ff1744)",
        color: "#fff",
        border: "2px solid #ff8a80",
        boxShadow: "0 0 25px rgba(255,0,0,0.8)",
        borderRadius: "14px",
        fontFamily: "Poppins, sans-serif",
        
      },
      icon: false,
    }
  );
}


export function mostrarToastMedalha(titulo, categoria, imageUrl) {
 

  toast(
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <img
        src={imageUrl}
        alt="medalha"
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          border: "2px solid gold",
        }}
      />
      <div>
        <strong>🏅 {titulo}</strong>
        <p style={{ fontSize: "0.9rem" }}>{categoria}</p>
      </div>
    </div>,
    {
      containerId: "gamificacao",
      transition: Zoom,
      style: {
        background: "linear-gradient(135deg, #ffcc33, #ffd700)",
        color: "#000",
        borderRadius: "12px",
      },
      icon: false,
    }
  );
}


export function mostrarToastSistema(msg, tipo = "info") {
  toast[tipo](msg, { containerId: "sistema" });
}

export function usePenalidadeSaida(condicao, user, API, regra) {
  useEffect(() => {
    const penalizar = () => {
      if (!condicao && user) {
        toast.error(`💀 -${Math.abs(regra)} pontos! Ignorou aviso 😢`, {
          position: "bottom-right",
          theme: "colored",
        });
        navigator.sendBeacon(
          `${API}/api/gamificacao/remove`,
          JSON.stringify({
            userId: user.uid,
            valor: Math.abs(regra),
          })
        );
      }
    };

    window.addEventListener("beforeunload", penalizar);
    return () => {
      window.removeEventListener("beforeunload", penalizar);
      penalizar();
    };
  }, [condicao, user]);
}

export const regrasPontuacao = {
  //aluno e professor - agenda
  criarTarefa: 5,
  concluirTarefaAntes: 10,
  tarefaPendente: -10,
  concluir5AtivDia: 15,
  concluir10AtivDia: 30,
  concluirTarefaImportante: 15,

  //aluno e professor - videos
  assistirVideo: 10,
  sairVideo: -10,
  //professor - videos
  postarVideo: 10,

  //professor - turmas
  criarTurma: 5,
  postarAtividade: 2,
  responderDuvida: 5,
  mediaAlunosBoa: 5,
  mediaAlunosRuim: -5,
  PostarNota: 10,
  corrigirAtividade: 5,
  naoCorrigirAtividade: -5,
  excluirAtividade: -5,
  //aluno - turmas
  participarTurma: 5,
  entregarAtividade: 10,
  atividadeAtrasada: -10,
  abadonarAtividade: -10,
  acertarQuestao: 15,  
  concluirAtividade: 10,
  gabaritarAtividade: 20,  
  enviarDuvida: 5,
  verAtividadeConteudo: 2,  

  //aluno e professor - ajuda
  abriuAjuda: 2, 

  //aluno e professor - documentos
  lerDocumento: 5,
  ignorarDocumento: -5,

  //aluno - avisos
  lerAviso: 2,
  ignorarAviso: -2,
  //professor - avisos
  postAviso: 3,
  excluirAviso: -3,

  //aluno e professor - perfil
  atualizarFoto: 3,

  //aluno e professor - login
  loginDiario: 5, 
  diasSemLogar: -10, 

  //aluno - medalhas
  receberMedalha: 20,
  perderMedalha: -20,
  //professor - medalhas
  criarMedalha: 10,
  atribuirMedalha: 5,  
  excluirMedalha: -5,
  removerMedalhaAluno: -5,
    
};
import axios from "axios";
const API = import.meta.env.VITE_API_URL;
import { toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function adicionarPontos(userId, valor) {
  await axios.post(`${API}/api/gamificacao/add`, { userId, valor });
}

export async function removerPontos(userId, valor) {
  await axios.post(`${API}/api/gamificacao/remove`, { userId, valor });
}

export async function getPontos(userId) {
  const res = await axios.get(`${API}/api/gamificacao/${userId}`);
  return res.data.pontos;
}

export function mostrarToastPontosAdicionar(valor, motivo) {
  toast.success(`🏅 +${Math.abs(valor)} pontos! ${motivo}`, {
    position: "bottom-right",
    autoClose: 2500,
    transition: Zoom,
    theme: "colored",
    style: { background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff" },
    icon: "🎉",
  });
}

export function mostrarToastPontosRemover(valor, motivo) {
  toast.error(`💀 -${Math.abs(valor)} pontos! ${motivo}`, {
    position: "bottom-right",
    autoClose: 3000,
    transition: Zoom,
    theme: "colored",
    style: { background: "linear-gradient(135deg, #b91c1c, #ef4444)", color: "#fff" },
    icon: "⚠️",
  });
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
  criarTarefa: 5,
  concluirTarefaAntes: 10,
  tarefaPendente: -10,
  concluir5AtivDia: 15,
  concluir10AtivDia: 30,
  concluirTarefaImportante: 15,

  assistirVideo: 10,
  sairVideo: -10,
  postarVideo: 10,

  acertarQuestao: 15,
  concluirAtividade: 10,
  gabaritarAtividade: 20,
  participarTurma: 5,
  enviarDuvida: 10,
  corrigirAtividade: 10,
  naoCorrigirAtividade: -5,
  atividadeAtrasada: -10,
  sairDaTurma: -10,
  abadonarAtividade: -10,

  lerDocumento: 5,
  ignorarDocumento: -5,

  lerAviso: 2,
  ignorarAviso: -2,
  postAviso: 3,
  excluirAviso: -3,

  atualizarFoto: 3,

  loginDiario: 5, 
  diasSemLogar: -10, 

  receberMedalha: 20,
  
};
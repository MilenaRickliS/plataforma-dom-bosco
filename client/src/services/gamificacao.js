import axios from "axios";
const API = import.meta.env.VITE_API_URL;
import { toast, Zoom } from "react-toastify";

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


export const regrasPontuacao = {
  criarTarefa: 5,
  concluirTarefaAntes: 10,
  tarefaPendente: -10,
  concluir5AtivDia: 15,
  concluir10AtivDia: 30,
  concluirTarefaImportante: 15,

  assistirVideo: 10,
  sairVideo: -10,

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

  AtualizarFoto: 3,

  loginDiario: 5, 
  diasSemLogar: -10, 

  receberMedalha: 20,
  
};

import axios from "axios";

const API = import.meta.env.VITE_API_URL;


function normalizeIds(list = []) {
  return list
    .filter(Boolean)
    .map((x) => (typeof x === "string" ? x : x.id || x.uid))
    .filter(Boolean);
}



export async function getTemplates(professorId) {
  if (!professorId) return [];
  const { data } = await axios.get(`${API}/api/medalhas/templates`, {
    params: { professorId },
  });
  return data || [];
}

export async function createTemplate({
  title,
  imageUrl = "",
  ownerProfessorId,
  unique = true,
  category = "geral",
  color = "#2563eb",
}) {
  const { data } = await axios.post(`${API}/api/medalhas/templates`, {
    title,
    imageUrl,
    ownerProfessorId,
    unique,
    category,
    color,
  });
  return data;
}

export async function updateTemplate(id, payload) {
  if (!id) throw new Error("Template id é obrigatório");
  const { data } = await axios.put(`${API}/api/medalhas/templates/${id}`, {
    ...payload,
  });
  return data;
}

export async function deleteTemplate(id) {
  if (!id) throw new Error("Template id é obrigatório");
  const { data } = await axios.delete(`${API}/api/medalhas/templates/${id}`);
  return data;
}



export async function atribuirMedalhas({
  professorId,
  turmaId = null,
  templateId,
  comment = "",
  alunos = [],
}) {
  const alunosIds = normalizeIds(alunos);
  const payload = {
    professorId,
    turmaId,
    templateId,
    comment,
    alunos: alunosIds, 
  };

  const { data } = await axios.post(`${API}/api/medalhas/atribuir`, payload);
  return data; 
}



export async function getMedalhasDoAluno(alunoId) {
  if (!alunoId) return [];
  const { data } = await axios.get(`${API}/api/medalhas/aluno/${alunoId}`);
  return data || [];
}

import axios from "axios";

const API = import.meta.env.VITE_API_URL;


export async function getTurmasDoProfessor(professorId) {
  if (!professorId) return [];
  const { data } = await axios.get(`${API}/api/turmas`, {
    params: { professorId },
  });
  return data || [];
}


export async function getAlunosDaTurma(turmaId) {
  if (!turmaId) return [];

  try {
    const { data } = await axios.get(`${API}/api/turmas/alunos`, {
      params: { turmaId },
    });

    if (!data || data.length === 0) {
      console.warn("⚠️ Nenhum aluno encontrado nesta turma.");
      return [];
    }

    return data.map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome || "Aluno sem nome",
      email: aluno.email || "",
      foto: aluno.foto || "",
      role: aluno.role || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar alunos da turma:", error);
    return [];
  }
}

import { useEffect, useState, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import { toast } from "react-toastify";
import "./style.css";

export default function RespostasAluno() {
  const { avaliacaoId, alunoId } = useParams();
  const { user } = useContext(AuthContext);
  const [publicacao, setPublicacao] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [notaTotal, setNotaTotal] = useState(0);
  const [salvando, setSalvando] = useState(false);
 const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";


  useEffect(() => {
    if (!avaliacaoId || !alunoId || !user?.uid) return;

    const carregar = async () => {
      try {
        const pubRes = await axios.get(`${API}/api/publicacoes`);
        const pub = (pubRes.data || []).find((x) => x.id === avaliacaoId);
        setPublicacao(pub || null);

        const qs = await axios.get(`${API}/api/questoes`, { params: { avaliacaoId } });
        setQuestoes(qs.data || []);

        const r = await axios.get(`${API}/api/respostas`, { params: { avaliacaoId } });
        const alunoResp = (r.data.alunos || []).find((a) => a.alunoId === alunoId);

        const questoesAluno = alunoResp?.questoes || [];
        setRespostas(questoesAluno);
        const somaNotas = questoesAluno.reduce((acc, q) => acc + (q.valorObtido || 0), 0);
        setNotaTotal(somaNotas);
      } catch (e) {
        console.error("Erro ao carregar respostas:", e);
        toast.error("Erro ao carregar respostas do aluno.");
      }
    };
    carregar();
  }, [avaliacaoId, alunoId, user, API]);

 
  const handleNotaChange = (questaoId, valorDigitado) => {
  let novaNota = valorDigitado.trim();

  
  if (novaNota === "") novaNota = "0";

  
  let numero = parseFloat(novaNota.replace(",", "."));
  if (isNaN(numero)) numero = 0;

  
  if (numero < 0) numero = 0;

  
  numero = Math.round(numero * 100) / 100;

 
  const novaLista = respostas.map((q) =>
    q.id === questaoId ? { ...q, valorObtido: numero } : q
  );
  setRespostas(novaLista);

  
  const total = novaLista.reduce((acc, q) => acc + (q.valorObtido || 0), 0);
  setNotaTotal(Math.round(total * 100) / 100);
};


const handleSalvar = async () => {
  try {
   
    for (const q of respostas) {
      if (q.valorObtido === "" || q.valorObtido === undefined || isNaN(q.valorObtido)) {
        toast.error(`A questão "${q.id}" está sem nota.`);
        return;
      }
      if (q.valorObtido < 0) {
        toast.error(`A questão "${q.id}" não pode ter nota negativa.`);
        return;
      }
      const casasDecimais = q.valorObtido.toString().split(".")[1];
      if (casasDecimais && casasDecimais.length > 2) {
        toast.error(`A nota da questão "${q.id}" deve ter no máximo 2 casas decimais.`);
        return;
      }
    }

    if (notaTotal < 0) {
      toast.error("Nota total não pode ser negativa.");
      return;
    }

    setSalvando(true);

    
    await axios.patch(`${API}/api/respostas`, {
      avaliacaoId,
      alunoId,
      questoes: respostas,
      notaTotal,
    });

    toast.success("Correção salva com sucesso!");

    
    window.dispatchEvent(
      new CustomEvent("notaAtualizada", {
        detail: { avaliacaoId, alunoId, notaTotal, melhorNota: notaTotal },
      })
    );

    
    setTimeout(() => {
      window.location.href = `/professor/avaliacao/${avaliacaoId}/respostas`;
    }, 1500);
  } catch (e) {
    console.error(e);
    toast.error("Erro ao salvar correção.");
  } finally {
    setSalvando(false);
  }
};


  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />
          <div className="menu-turma-voltar">
            <NavLink to={`/professor/avaliacao/${avaliacaoId}/respostas`}>
              ← Voltar
            </NavLink>
          </div>

          <h2 className="titulo-respostas">Correção - {publicacao?.titulo || "Avaliação"}</h2>

          <div className="correcao-card">
            <p className="nota-total">
              Total atual: <strong>{notaTotal.toFixed(1)}</strong> / {publicacao?.valor || 10}
            </p>

            <ul className="lista-questoes-corrigir">
              {questoes.map((q, i) => {
                const respostaAluno = respostas.find((r) => r.id === q.id);
                const respostaFormatada = respostaAluno
                  ? typeof respostaAluno.resposta === "object"
                    ? Array.isArray(respostaAluno.resposta)
                      ? respostaAluno.resposta.join(", ")
                      : Object.entries(respostaAluno.resposta)
                          .map(([k, v]) => `${k} → ${v}`)
                          .join(", ")
                    : respostaAluno.resposta
                  : "Sem resposta";

                return (
                  <li key={q.id} className="item-corrigir">
                    <h4>
                      Q{i + 1}: {q.enunciado}
                    </h4>
                  
                    <p>
                      <em style={{ color: "#2563eb", fontWeight: "600" }}>Resposta do aluno:</em>{" "}
                      <span style={{ color: "#333" }}>{respostaFormatada || "Sem resposta"}</span>
                    </p>

                    
                    {q.alternativas && q.alternativas.length > 0 && (
                      <p>
                        <em style={{ color: "#16a34a", fontWeight: "600" }}>Gabarito:</em>{" "}
                        {q.alternativas
                          .filter((a) => a.correta)
                          .map((a) => a.texto)
                          .join(", ") || "Sem gabarito definido"}
                      </p>
                    )}

                    {q.tipo === "dissertativa" && q.gabarito && (
                      <p>
                        <em style={{ color: "#16a34a", fontWeight: "600" }}>Gabarito:</em>{" "}
                        {q.gabarito}
                      </p>
                    )}

                    {q.tipo === "correspondencia" && q.colA && q.colB && q.gabarito && (
                      <p>
                        <em style={{ color: "#16a34a", fontWeight: "600" }}>Gabarito:</em>{" "}
                        {Object.entries(q.gabarito)
                          .map(([k, v]) => `${k} → ${v}`)
                          .join(", ")}
                      </p>
                    )}


                    <div className="nota-input">
                      <input
                        type="number"
                        min="0"
                        max={q.valor || 10}
                        step="0.1"
                        value={
                          respostaAluno?.valorObtido !== undefined
                            ? respostaAluno.valorObtido
                            : 0
                        }
                        onChange={(e) => handleNotaChange(q.id, e.target.value)}
                      />
                      <span>/ {q.valor || 10} pts</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              className="btn-salvar-nota"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar Correção"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

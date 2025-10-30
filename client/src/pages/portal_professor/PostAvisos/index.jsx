import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import { AiTwotoneNotification } from "react-icons/ai";
import {
  adicionarPontos,
  mostrarToastPontosAdicionar,
  regrasPontuacao,
} from "../../../services/gamificacao";


export default function PostAvisos() {
  const { user } = useContext(AuthContext);
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    responsavel: "",
    turmasSelecionadas: [],
  });
  const [marcarTodas, setMarcarTodas] = useState(false);
  const [contagem, setContagem] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const API = import.meta.env.VITE_API_URL;

  const modoEdicao = Boolean(id);

 
  useEffect(() => {
    if (!user?.uid) return;
    axios
      .get(`${API}/api/turmas?professorId=${user.uid}`)
      .then((res) => setTurmas(res.data))
      .catch(() => toast.error("Erro ao carregar turmas."));
  }, [user]);


  useEffect(() => {
    if (modoEdicao) {
      axios
        .get(`${API}/api/avisos?professorId=${user.uid}`)
        .then((res) => {
          const aviso = res.data.find((a) => a.id === id);
          if (aviso) {
            setForm({
              titulo: aviso.titulo,
              descricao: aviso.descricao,
              responsavel: aviso.responsavel,
              turmasSelecionadas: aviso.turmasIds || [],
            });
          }
        })
        .catch(() => toast.error("Erro ao carregar aviso para edição."));
    }
  }, [modoEdicao, id, user]);

  
  useEffect(() => {
    const palavras = form.descricao.trim().split(/\s+/);
    setContagem(form.descricao.trim() === "" ? 0 : palavras.length);
  }, [form.descricao]);

  
  const validarFormulario = () => {
    const regexTitulo = /^[A-Za-zÀ-ÿ0-9\s]+$/;
    const regexResp = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!form.titulo.trim()) {
      toast.warning("⚠️ O título não pode estar vazio.");
      return false;
    }
    if (!regexTitulo.test(form.titulo)) {
      toast.warning("⚠️ O título deve conter apenas letras, números e acentos.");
      return false;
    }

    const palavras = form.descricao.trim().split(/\s+/);
    if (!form.descricao.trim()) {
      toast.warning("⚠️ A descrição não pode estar vazia.");
      return false;
    }
    if (palavras.length < 15) {
      toast.warning("⚠️ A descrição deve ter no mínimo 15 palavras.");
      return false;
    }
    if (palavras.length > 100) {
      toast.warning("⚠️ A descrição deve ter no máximo 100 palavras.");
      return false;
    }

    if (!form.responsavel.trim()) {
      toast.warning("⚠️ O responsável não pode estar vazio.");
      return false;
    }
    if (!regexResp.test(form.responsavel)) {
      toast.warning("⚠️ O responsável deve conter apenas letras e acentos.");
      return false;
    }

    const temTurmas = marcarTodas || form.turmasSelecionadas.length > 0;
    if (!temTurmas) {
      toast.warning("⚠️ Selecione pelo menos uma turma.");
      return false;
    }

    return true;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const turmasSelecionadas = marcarTodas
        ? turmas.map((t) => t.id)
        : form.turmasSelecionadas;

      const turmasNomes = marcarTodas
        ? turmas.map((t) => t.nomeTurma)
        : turmas
            .filter((t) => turmasSelecionadas.includes(t.id))
            .map((t) => t.nomeTurma);

      if (modoEdicao) {
        await axios.put(`${API}/api/avisos/editar`, {
          id,
          titulo: form.titulo,
          descricao: form.descricao,
          responsavel: form.responsavel,
          turmasIds: turmasSelecionadas,
          turmasNomes,
        });
        toast.success("Aviso atualizado com sucesso!");
      } else {
        await axios.post(`${API}/api/avisos/criar`, {
          titulo: form.titulo,
          descricao: form.descricao,
          responsavel: form.responsavel,
          turmasIds: turmasSelecionadas,
          turmasNomes,
          criadorId: user.uid,
        });
        await adicionarPontos(user.uid, regrasPontuacao.postAviso, "Aviso criado com sucesso 🗞️");
        mostrarToastPontosAdicionar(
          regrasPontuacao.postAviso,
          "Aviso criado com sucesso 🗞️"
        );
        toast.success("Aviso criado com sucesso!");
      }

      setTimeout(() => navigate("/professor/avisos"), 1800);
    } catch (err) {
      console.error("Erro ao salvar aviso:", err);
      toast.error("Erro ao salvar aviso.");
    }
  };

 
  const corContador =
    contagem < 15 || contagem > 100
      ? "#c62828"
      : contagem >= 90
      ? "#f9a825"
      : "#2e7d32";

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main className="post-avisos">
          <MenuTopoProfessor />
          <h2 className="titulo-avisos">
            <AiTwotoneNotification />{" "}
            {modoEdicao ? "Editar aviso" : "Criar novo aviso"}
          </h2>

          <form onSubmit={handleSubmit} className="form-avisos">
            <input
              type="text"
              placeholder="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />

            <div className="campo-descricao-avisos">
              <textarea
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
              <span
                className="contador-palavras-avisos"
                style={{ color: corContador }}
              >
                {contagem} / 100 palavras
              </span>
            </div>

            <input
              type="text"
              placeholder="Responsável"
              value={form.responsavel}
              onChange={(e) =>
                setForm({ ...form, responsavel: e.target.value })
              }
            />

            <div className="turmas-box">
              <label>
                <input
                  type="checkbox"
                  checked={marcarTodas}
                  onChange={() => setMarcarTodas(!marcarTodas)}
                />
                Marcar todas as turmas
              </label>

              {!marcarTodas && (
                <div className="lista-turmas-avisos">
                  {turmas.map((turma) => (
                    <label key={turma.id}>
                      <input
                        type="checkbox"
                        checked={form.turmasSelecionadas.includes(turma.id)}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            turmasSelecionadas: prev.turmasSelecionadas.includes(
                              turma.id
                            )
                              ? prev.turmasSelecionadas.filter(
                                  (t) => t !== turma.id
                                )
                              : [...prev.turmasSelecionadas, turma.id],
                          }));
                        }}
                      />
                      {turma.nomeTurma} - {turma.materia}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="enviar-aviso">
              {modoEdicao ? "Atualizar aviso" : "Enviar aviso"}
            </button>
          </form>

          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            theme="colored"
          />
        </main>
      </div>
    </div>
  );
}

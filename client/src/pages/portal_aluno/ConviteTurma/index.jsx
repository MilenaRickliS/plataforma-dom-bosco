import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import { toast } from "react-toastify";
import { FaBook, FaUser } from "react-icons/fa";
import logo from "../../../assets/logo2.png";
import "./style.css";


import { adicionarPontos, mostrarToastPontosAdicionar, regrasPontuacao } 
  from "../../../services/gamificacao.jsx";

export default function ConviteTurma() {
  const { codigo } = useParams();
  const { user } = useContext(AuthContext);
  const [turma, setTurma] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function buscarTurma() {
      try {
        setCarregando(true);
        const res = await fetch(`${API}/api/turmas?codigo=${codigo}`);
        const data = await res.json();
        if (data && data.id) {
          setTurma(data);
        } else {
          toast.error("Código de turma inválido ou turma não encontrada.");
        }
      } catch (err) {
        console.error("Erro ao buscar turma:", err);
        toast.error("Erro ao carregar informações da turma.");
      } finally {
        setCarregando(false);
      }
    }
    if (codigo) buscarTurma();
  }, [codigo, API]);

  useEffect(() => {
    if (!user && codigo) {
      localStorage.setItem("codigoConvitePendente", codigo);
      toast.info("Faça login para entrar na turma.");
      navigate("/login");
    }
  }, [user, codigo, navigate]);

  async function entrarNaTurma() {
    try {
      const res = await fetch(`${API}/api/turmas/ingressar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          alunoId: user.uid,
          alunoNome: user.displayName || "Aluno",
          alunoEmail: user.email,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Você entrou na turma com sucesso!");
        
       
        await adicionarPontos(user.uid, regrasPontuacao.participarTurma, "Ingressou em uma turma");
        mostrarToastPontosAdicionar(regrasPontuacao.participarTurma, "Ingressou na turma");

        navigate("/aluno/inicio");
      } else {
        toast.error(data.error || "Erro ao entrar na turma.");
      }
    } catch (err) {
      console.error("Erro ao entrar na turma:", err);
      toast.error("Erro ao processar o convite.");
    }
  }

  if (carregando) {
    return (
      <div className="convite-container carregando">
        <p>Carregando informações da turma...</p>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="convite-container erro">
        <h2>⚠️ Turma não encontrada</h2>
        <Link to="/login" className="btn-voltar">Voltar</Link>
      </div>
    );
  }

  return (
    <div
      className="convite-fundo"
      style={{
        backgroundImage: turma.imagem
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${turma.imagem})`
          : "linear-gradient(to bottom right, #1e3a8a, #2563eb)",
      }}
    >
      <div className="convite-card">
        <img src={logo} alt="Logo" className="convite-logo" />
        <h2 className="convite-titulo">Convite para entrar na turma</h2>

        <div className="convite-info">
          <h3>{turma.nomeTurma}</h3>
          <p><FaBook /> Matéria: {turma.materia || "—"}</p>
          <p><FaUser /> Professor: {turma.professorNome || "—"}</p>
          <p className="codigo">Código: <strong>{turma.codigo}</strong></p>
        </div>

        {user ? (
          <button className="btn-entrar" onClick={entrarNaTurma}>
            Entrar na Turma
          </button>
        ) : (
          <Link to="/login" className="btn-login">
            Fazer Login para Entrar
          </Link>
        )}
      </div>
    </div>
  );
}

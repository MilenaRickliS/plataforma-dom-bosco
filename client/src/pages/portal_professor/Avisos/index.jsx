import { useState, useEffect, useContext } from "react";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/auth";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";
import { AiTwotoneNotification } from "react-icons/ai";
import { MdModeEdit } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  removerPontos,
  mostrarToastPontosRemover,
  regrasPontuacao,
} from "../../../services/gamificacao";


export default function Avisos() {
  const { user } = useContext(AuthContext);
  const [avisos, setAvisos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const API = import.meta.env.VITE_API_URL;

 
  const carregarAvisos = async () => {
    if (!user?.uid) return;
    setCarregando(true);
    try {
      const res = await axios.get(`${API}/api/avisos?professorId=${user.uid}`);
      const avisosOrdenados = res.data.sort((a, b) => {
        const dataA = a.criadoEm?._seconds
          ? new Date(a.criadoEm._seconds * 1000)
          : new Date(a.criadoEm);
        const dataB = b.criadoEm?._seconds
          ? new Date(b.criadoEm._seconds * 1000)
          : new Date(b.criadoEm);
        return dataB - dataA;
      });
      setAvisos(avisosOrdenados);
    } catch (err) {
      toast.error("Erro ao carregar avisos");
    } finally {
      setCarregando(false);
    }
  };


  useEffect(() => {
    carregarAvisos();
  }, [user]);

  
  const excluirAviso = async (id) => {
    if (!confirm("Deseja realmente excluir este aviso?")) return;
    try {
      await axios.delete(`${API}/api/avisos?id=${id}`);
      toast.success("Aviso excluído com sucesso!");
      await removerPontos(user.uid, Math.abs(regrasPontuacao.excluirAviso));
      mostrarToastPontosRemover(
        regrasPontuacao.excluirAviso,
        "Aviso removido 🗑️"
      );
      await carregarAvisos();
    } catch {
      toast.error("Erro ao excluir aviso.");
    }
  };

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main className="avisos-professor">
          <MenuTopoProfessor />

          <div className="topo-avisos">
            <h2>
              <AiTwotoneNotification /> Meus Avisos
            </h2>
            <Link to="/professor/add-avisos-professor" className="botao-postar-avisos">
              <FaPlus /> Adicionar aviso
            </Link>
          </div>

          {carregando ? (
            <p>Carregando avisos...</p>
          ) : avisos.length === 0 ? (
            <p className="sem-avisos">Você ainda não criou nenhum aviso.</p>
          ) : (
            <div className="lista-avisos">
              {avisos.map((aviso) => (
                <div key={aviso.id} className="aviso-card">
                  <h3>{aviso.titulo}</h3>
                  <p>{aviso.descricao}</p>

                  <p className="turmas">
                    <strong>Turmas:</strong>{" "}
                    {aviso.turmasNomes?.join(", ") || "—"}
                  </p>

                  <p className="responsavel">
                    <strong>Responsável:</strong> {aviso.responsavel}
                  </p>

                  <p className="data">
                    <strong>Criado em:</strong>{" "}
                    {aviso.criadoEm?._seconds
                      ? new Date(aviso.criadoEm._seconds * 1000).toLocaleString(
                          "pt-BR",
                          { dateStyle: "short", timeStyle: "short" }
                        )
                      : new Date(aviso.criadoEm).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                  </p>

                  <p className="leitores">
                    <strong>Leitores:</strong> {aviso.totalLeitores || 0}
                  </p>


                  <div className="acoes-avisos">
                    <Link
                      to={`/professor/editar-aviso/${aviso.id}`}
                      className="btn-editar-aviso"
                    >
                      <MdModeEdit /> Editar
                    </Link>

                    <button
                      onClick={() => excluirAviso(aviso.id)}
                      className="btn-excluir-aviso"
                    >
                      <FaTrashAlt /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ToastContainer
            position="bottom-right"
            autoClose={2500}
            hideProgressBar={false}
            pauseOnHover
            theme="colored"
          />
        </main>
      </div>
    </div>
  );
}

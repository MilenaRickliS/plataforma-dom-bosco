import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import "./style.css";
import { AiTwotoneNotification } from "react-icons/ai";

export default function Avisos() {
  const { user } = useContext(AuthContext);
  const [avisos, setAvisos] = useState([]);
  const [naoLidos, setNaoLidos] = useState(0);
  const API = import.meta.env.VITE_API_URL;

  const carregarAvisos = async () => {
    if (!user?.uid) return;
    try {
      const res = await axios.get(`${API}/api/avisos?alunoId=${user.uid}`);

      const ordenados = res.data.sort((a, b) => {
        const dataA = a.criadoEm?._seconds
          ? new Date(a.criadoEm._seconds * 1000)
          : new Date(a.criadoEm);
        const dataB = b.criadoEm?._seconds
          ? new Date(b.criadoEm._seconds * 1000)
          : new Date(b.criadoEm);
        return dataB - dataA;
      });

      setAvisos(ordenados);
      const novos = ordenados.filter((a) => !a.lido).length;
      setNaoLidos(novos);
    } catch (err) {
      alert("Erro ao carregar avisos.");
    }
  };

  useEffect(() => {
    carregarAvisos();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("avisosNaoLidos", naoLidos.toString());
    window.dispatchEvent(new Event("storage")); 
  }, [naoLidos]);

  const toggleLido = async (avisoId, lido) => {
    try {
      await axios.put(`${API}/api/avisos/marcar-lido`, {
        avisoId,
        alunoId: user.uid,
        remover: lido, 
      });
      await carregarAvisos(); 
    } catch (err) {
      console.error("Erro ao atualizar leitura:", err);
    }
  };

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main className="avisos-aluno">
          <MenuTopoAluno />
          <h2 className="titulo-avisos">
            <AiTwotoneNotification /> Avisos recebidos
          </h2>

          {avisos.length === 0 ? (
            <p>Nenhum aviso disponível.</p>
          ) : (
            avisos.map((aviso) => (
              <div
                key={aviso.id}
                className={`aviso-card-alunos ${aviso.lido ? "lido" : "nao-lido"}`}
              >
                
                  <h3>{aviso.titulo}</h3>
                  
               
                <p>{aviso.descricao}</p>
                <p className="responsavel">
                  <strong>Atenciosamente,</strong> {aviso.responsavel}
                </p>
                <p className="data">
                  <strong>Postado em:</strong>{" "}
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
                <br/>
                <label className="checkbox-lido">
                    <input
                      type="checkbox"
                      checked={aviso.lido}
                      onChange={() => toggleLido(aviso.id, aviso.lido)}
                    />
                    {aviso.lido ? "Lido" : "Não lido"}
                  </label>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

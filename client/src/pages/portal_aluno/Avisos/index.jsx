import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import "./style.css";
import { AiTwotoneNotification } from "react-icons/ai";
import {
  adicionarPontos,
  removerPontos,
  mostrarToastPontosAdicionar,
  mostrarToastPontosRemover,
  regrasPontuacao,
} from "../../../services/gamificacao";
import { usePenalidadeSaida } from "../../../hooks/usePenalidadeSaida";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Avisos() {
  const { user } = useContext(AuthContext);
  const [avisos, setAvisos] = useState([]);
  const [naoLidos, setNaoLidos] = useState(0);
  const [avisosCarregados, setAvisosCarregados] = useState(false);
  const [penalizadoHoje, setPenalizadoHoje] = useState(false);
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
      setNaoLidos(ordenados.filter((a) => !a.lido).length);
      setAvisosCarregados(true);
    } catch (err) {
      console.error("Erro ao carregar avisos:", err);
      toast.error("Erro ao carregar avisos.");
    }
  };

  
  useEffect(() => {
    carregarAvisos();
  }, [user]);

 
  useEffect(() => {
    localStorage.setItem("avisosNaoLidos", naoLidos.toString());
    window.dispatchEvent(new Event("storage"));
  }, [naoLidos]);

 
  usePenalidadeSaida(naoLidos === 0, user, API, regrasPontuacao.ignorarAviso, "Saiu sem ver aviso 📄");

 
  useEffect(() => {
    if (avisosCarregados && naoLidos > 0 && !penalizadoHoje) {
      const chaveDia = `${user.uid}-penalidade-${new Date().toDateString()}`;
      if (!localStorage.getItem(chaveDia)) {
        removerPontos(user.uid, Math.abs(regrasPontuacao.ignorarAviso), "Ignorou avisos não lidos 💀");
        mostrarToastPontosRemover(
          Math.abs(regrasPontuacao.ignorarAviso),
          "Ignorou avisos não lidos 💀"
        );
        localStorage.setItem(chaveDia, "true");
        setPenalizadoHoje(true);
      }
    } else if (avisosCarregados && naoLidos === 0) {
      toast.info("✅ Nenhum aviso novo — sem penalidade hoje!", {
        position: "bottom-right",
        theme: "colored",
        autoClose: 2000,
      });
    }
  }, [avisosCarregados, naoLidos]);

  
  const toggleLido = async (avisoId, lido, titulo) => {
    try {
      await axios.put(`${API}/api/avisos/marcar-lido`, {
        avisoId,
        alunoId: user.uid,
        remover: lido,
      });

      await carregarAvisos();

      const chave = `${user.uid}-aviso-${avisoId}`;

     
      if (!lido) {
        if (!localStorage.getItem(chave)) {
          await adicionarPontos(user.uid, regrasPontuacao.lerAviso, `Leu "${titulo}" 📰`);
          mostrarToastPontosAdicionar(
            regrasPontuacao.lerAviso,
            `Leu "${titulo}" 📰`
          );
          localStorage.setItem(chave, "lido");
        }
      }
      
      else {
        if (localStorage.getItem(chave)) {
          await removerPontos(user.uid, Math.abs(regrasPontuacao.lerAviso), `Desmarcou "${titulo}" 👎`);
          mostrarToastPontosRemover(
            Math.abs(regrasPontuacao.lerAviso),
            `Desmarcou "${titulo}" 👎`
          );
          localStorage.removeItem(chave);
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar leitura:", err);
      toast.error("Erro ao atualizar status do aviso.");
    }
  };

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main className="avisos-aluno">
          <MenuTopoAluno />
          <ToastContainer position="bottom-right" theme="colored" />

          <h2 className="titulo-avisos">
            <AiTwotoneNotification /> Avisos recebidos
          </h2>

          {!avisosCarregados ? (
            <p>Carregando avisos...</p>
          ) : avisos.length === 0 ? (
            <p>Nenhum aviso disponível.</p>
          ) : (
            avisos.map((aviso) => (
              <div
                key={aviso.id}
                className={`aviso-card-alunos ${
                  aviso.lido ? "lido" : "nao-lido"
                }`}
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
                <br />
                <label className="checkbox-lido">
                  <input
                    type="checkbox"
                    checked={aviso.lido}
                    onChange={() =>
                      toggleLido(aviso.id, aviso.lido, aviso.titulo)
                    }
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

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/auth";
import { TbPointFilled } from "react-icons/tb";
import { ToastContainer } from "react-toastify";
import { adicionarPontos, mostrarToastPontosAdicionar, mostrarToastPontosRemover, regrasPontuacao } from "../../../services/gamificacao";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import { usePenalidadeSaida } from "../../../hooks/usePenalidadeSaida";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";


export default function Documentos() {
  const { user } = useContext(AuthContext);
  const API = import.meta.env.VITE_API_URL;
  const [acessouDocumento, setAcessouDocumento] = useState(false);
  usePenalidadeSaida(acessouDocumento, user, API, regrasPontuacao.ignorarDocumento);


  const documentos = [
    {
      id: "regras",
      titulo: "Regras do Instituto",
      link: "https://drive.google.com/file/d/12oizD8zJA9qLGFIywcIpBzAnLY8KUMWV/view?usp=sharing",
    },
    {
      id: "horarios",
      titulo: "Horários do Instituto",
      link: "https://drive.google.com/file/d/12oizD8zJA9qLGFIywcIpBzAnLY8KUMWV/view?usp=sharing",
    },
  ];

  
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && !acessouDocumento) {
        const body = JSON.stringify({
          userId: user.uid,
          valor: Math.abs(regrasPontuacao.ignorarDocumento),
        });
        navigator.sendBeacon(`${API}/api/gamificacao/remove`, body);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user, acessouDocumento]);

  
  useEffect(() => {
    return () => {
      if (user && !acessouDocumento) {
        const body = JSON.stringify({
          userId: user.uid,
          valor: Math.abs(regrasPontuacao.ignorarDocumento),
        });
        navigator.sendBeacon(`${API}/api/gamificacao/remove`, body);
        
        console.log("⚠️ Penalidade aplicada: saiu sem abrir documento");
      }
    };
  }, [user, acessouDocumento]);

 
  const handleAcesso = async (docId, titulo) => {
    if (!user) return;
    setAcessouDocumento(true);

    const chave = `${user.uid}-doc-${docId}`;
    const jaLeu = localStorage.getItem(chave);

    if (!jaLeu) {
      await adicionarPontos(user.uid, regrasPontuacao.lerDocumento);
      mostrarToastPontosAdicionar(regrasPontuacao.lerDocumento, `Leu "${titulo}" 📘`);
      localStorage.setItem(chave, "lido");
    }
  };

  return (
    <div className="layout">
      <MenuLateralProfessor/>
      <div className="page2">
        <main>
          <ToastContainer position="bottom-right" theme="colored" />
          <MenuTopoProfessor />

          <section className="sessao-documentos">
            <h2 className="titulo-documento">Documentos do Instituto</h2>

            <div className="div-documentos">
              {documentos.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="documento"
                  onClick={() => handleAcesso(doc.id, doc.titulo)}
                >
                  <TbPointFilled /> {doc.titulo}
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

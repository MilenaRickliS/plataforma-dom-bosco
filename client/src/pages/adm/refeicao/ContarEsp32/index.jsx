import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../services/firebaseConnection";
import { IoArrowUndoSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { BsCameraVideoOff } from "react-icons/bs";
import { BsCameraVideo } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend.vercel.app";
const CONTADOR_ID = "porta-refeitorio";

 const getEstadoTipo = (tipo) => {
    switch (tipo) {
      case "CONTANDO":
        return { icon: <BsCameraVideo style={{ color: "#ad4045ff" }} />, color: "#ad4045ff" };
      case "PARADO":
        return { icon: <BsCameraVideoOff style={{ color: "#3f51b5" }} />, color: "#3f51b5" };
      default:
        return { icon: <BsCameraVideo style={{ color: "#999" }} />, color: "#999" };
    }
  };

export default function ContadorESP32() {
  const [estado, setEstado] = useState({ status: "parado", total: 0, titulo: "" });
  const [titulo, setTitulo] = useState("");
  const contando = estado.status === "contando";
  const estadoAtual = contando ? "CONTANDO" : "PARADO";
 const { icon, color } = getEstadoTipo(estadoAtual);


  useEffect(() => {
    const ref = doc(db, "contadores", CONTADOR_ID);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setEstado({
          status: d.status || "parado",
          total: d.total || 0,
          titulo: d.titulo || "",
        });
      }
    });
    return () => unsub();
  }, []);

  function validarTitulo(t) {
   
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/;
    return regex.test(t.trim());
  }

   async function start() {
    if (!titulo.trim()) {
      toast.warn("Digite um título antes de iniciar a contagem!");
      return;
    }

    if (!validarTitulo(titulo)) {
      toast.warn("O título deve conter apenas letras, números e acentos!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/contador/${CONTADOR_ID}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });

      if (res.ok) {
        toast.success("Contagem iniciada com sucesso!");
      } else {
        toast.error("Erro ao iniciar a contagem!");
      }
    } catch (err) {
      toast.error("Falha de conexão com o servidor!");
    }
  }

  async function stopAndFinalize() {
    try {
      const res = await fetch(`${API_URL}/api/contador/${CONTADOR_ID}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });

      if (res.ok) {
        toast.success("Contagem finalizada e salva com sucesso!");
      } else {
        toast.error("Erro ao finalizar a contagem!");
      }

      setTitulo("");
    } catch (err) {
      toast.error("Falha de conexão com o servidor!");
    }
  }

  


  return (
    <div className="esp32-container">
       <ToastContainer position="top-center" autoClose={3000} />
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>
      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Contar Alunos</h2>
      </div>

      <div className="painel">
        <p style={{ color }}>
          {icon} Status: <strong>{estadoAtual}</strong>
        </p>
        <h1>Total: {estado.total}</h1>
      </div>

      <div className="contagem">
        <input
          type="text"
          placeholder="Título (ex.: Almoço)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={contando}
          style={{ minWidth: 260 }}
        />
        {!contando ? (
          <button  className="btn-iniciar" onClick={start}>Iniciar contagem</button>
        ) : (
          <button className="btn-finalizar" onClick={stopAndFinalize}>Finalizar & salvar</button>
        )}
      </div>
    </div>
  );
}

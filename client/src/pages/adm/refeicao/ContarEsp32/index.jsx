import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../services/firebaseConnection";

const API_URL = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend.vercel.app";
const CONTADOR_ID = "porta-refeitorio";

export default function ContadorESP32() {
  const [estado, setEstado] = useState({ status: "parado", total: 0, titulo: "" });
  const [titulo, setTitulo] = useState("");

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

  async function start() {
    await fetch(`${API_URL}/api/contador/${CONTADOR_ID}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
  }

  async function stopAndFinalize() {
    await fetch(`${API_URL}/api/contador/${CONTADOR_ID}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
    setTitulo("");
  }

  const contando = estado.status === "contando";

  return (
    <div className="esp32-container">
      <h2>Contagem (ESP32)</h2>

      <div className="painel">
        <p>Status: <strong>{contando ? "CONTANDO" : "PARADO"}</strong></p>
        <h1>Total: {estado.total}</h1>
      </div>

      <div className="acoes">
        <input
          type="text"
          placeholder="Título (ex.: Almoço)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={contando}
          style={{ minWidth: 260 }}
        />
        {!contando ? (
          <button onClick={start}>Iniciar contagem</button>
        ) : (
          <button onClick={stopAndFinalize}>Finalizar & salvar</button>
        )}
      </div>
    </div>
  );
}

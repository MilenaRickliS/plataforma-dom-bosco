import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";

export default function Contar() {
  const [contador, setContador] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [mensagem, setMensagem] = useState("Pressione ENTER para contar");
  const [segundos, setSegundos] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const pressTimer = useRef(null);
  const intervalTimer = useRef(null);

  
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (!pressTimer.current) {
          let tempoRestante = 6;
          setSegundos(tempoRestante);
          setMensagem(finalizado ? "Segure para reiniciar..." : "Segure para finalizar...");

          intervalTimer.current = setInterval(() => {
            tempoRestante -= 1;
            setSegundos(tempoRestante);
          }, 1000);

          pressTimer.current = setTimeout(() => {
            clearInterval(intervalTimer.current);
            intervalTimer.current = null;
            setSegundos(null);

            if (!finalizado) {
              setFinalizado(true);
              setMensagem("✅ Contagem finalizada!");
            } else {
              setContador(0);
              setFinalizado(false);
              setMensagem("🔄 Contagem reiniciada!");
              setSalvo(false);
            }

            pressTimer.current = null;
          }, 6000);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Enter") {
        if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          clearInterval(intervalTimer.current);
          pressTimer.current = null;
          intervalTimer.current = null;
          setSegundos(null);

          if (!finalizado) {
            setContador((prev) => prev + 1);
            setMensagem("Aluno contado ✅");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearTimeout(pressTimer.current);
      clearInterval(intervalTimer.current);
    };
  }, [finalizado]);

 
  const salvarRegistro = async () => {
    if (!titulo) {
      alert("Digite um título antes de salvar (ex: Almoço, Jantar, etc.)");
      return;
    }
    setSalvando(true);
    try {
      const response = await fetch(`${API_URL}/api/refeicoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          total: contador,
        }),
      });

      if (response.ok) {
        setMensagem("💾 Registro salvo com sucesso!");
        setSalvo(true);
      } else {
        setMensagem("❌ Erro ao salvar. Verifique a conexão.");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setMensagem("⚠️ Erro de rede ou servidor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="contar-container">
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Contar Alunos</h2>
      </div>

      {!finalizado ? (
        <div className="contagem">
          <h1>{contador}</h1>
          <p>{mensagem}</p>
          {segundos !== null && <p className="contador-tempo">⏱️ {segundos}s</p>}
          <small>(Segure ENTER por 6 segundos para encerrar)</small>
        </div>
      ) : (
        <div className="resultado-final">
          <h1>🍽️ Total de refeições: {contador}</h1>
          <p>{mensagem}</p>
          {segundos !== null && (
            <p className="contador-tempo">🔄 Reiniciando em {segundos}s...</p>
          )}

          {!salvo ? (
            <div className="salvar-box">
              <input
                type="text"
                placeholder="Digite o título (ex: Almoço)"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <button
                onClick={salvarRegistro}
                disabled={salvando}
                className="salvar-refeicao-btn"
              >
                {salvando ? "Salvando..." : "💾 Salvar registro"}
              </button>
            </div>
          ) : (
            <p className="salvo-ok">✅ Registro salvo!</p>
          )}

          <small>(Segure ENTER por 6 segundos para reiniciar)</small>
        </div>
      )}
    </div>
  );
}

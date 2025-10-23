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
  const pressTimer = useRef(null);
  const intervalTimer = useRef(null);

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
          } else {
            setMensagem("Contagem finalizada!");
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
          {segundos !== null && (
            <p className="contador-tempo">⏱️ {segundos}s</p>
          )}
          <small>(Segure ENTER por 6 segundos para encerrar)</small>
        </div>
      ) : (
        <div className="resultado-final">
          <h1>🍽️ Total de refeições: {contador}</h1>
          <p>{mensagem}</p>
          {segundos !== null && (
            <p className="contador-tempo">🔄 Reiniciando em {segundos}s...</p>
          )}
          <small>(Segure ENTER por 6 segundos para reiniciar)</small>
        </div>
      )}
    </div>
  );
}

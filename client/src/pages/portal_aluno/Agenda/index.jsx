import { useState, useEffect, useRef } from "react";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import "./style.css";

export default function Agenda() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const scrollRef = useRef(null);

  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();
  const diaAtual = dataAtual.getDate();

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);

 
  
  useEffect(() => {
    const elemento = document.getElementById(`dia-${diaAtual}`);
    if (elemento && scrollRef.current) {
      const scrollX =
        elemento.offsetLeft -
        scrollRef.current.offsetWidth / 2 +
        elemento.offsetWidth / 2;

      scrollRef.current.scrollTo({
        left: Math.max(scrollX, 0),
        behavior: "smooth",
      });
    }
  }, [dataAtual]);


  const mudarDia = (direcao) => {
    const novaData = new Date(dataAtual);
    novaData.setDate(diaAtual + direcao);
    setDataAtual(novaData);
  };


  const selecionarDia = (dia) => {
    setDataAtual(new Date(anoAtual, mesAtual, dia));
  };


  const handleMesChange = (e) => {
    setDataAtual(new Date(anoAtual, parseInt(e.target.value), diaAtual));
  };

  const handleAnoChange = (e) => {
    setDataAtual(new Date(parseInt(e.target.value), mesAtual, diaAtual));
  };

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />
          <div className="calendario">
            <div className="inicio-calendario">
              <IoIosArrowDropleft
                size={40}
                onClick={() => mudarDia(-1)}
                className="seta"
              />
              <div className="selects">
                <select value={mesAtual} onChange={handleMesChange}>
                  {meses.map((mes, i) => (
                    <option key={i} value={i}>
                      {mes}
                    </option>
                  ))}
                </select>
                <select value={anoAtual} onChange={handleAnoChange}>
                  {Array.from({ length: 10 }, (_, i) => anoAtual - 5 + i).map(
                    (ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    )
                  )}
                </select>
              </div>
              <IoIosArrowDropright
                size={40}
                onClick={() => mudarDia(1)}
                className="seta"
              />
            </div>

            <div className="dias" ref={scrollRef}>
              {dias.map((dia) => {
                const diff = Math.abs(dia - diaAtual);
                const escala = Math.max(0.6, 1 - diff * 0.1);
                const isHoje =
                  dia === new Date().getDate() &&
                  mesAtual === new Date().getMonth() &&
                  anoAtual === new Date().getFullYear();

                return (
                  <div
                    key={dia}
                    id={`dia-${dia}`}
                    onClick={() => selecionarDia(dia)}
                    className={`dia ${isHoje ? "hoje" : ""} ${
                      dia === diaAtual ? "selecionado" : ""
                    }`}
                    style={{ transform: `scale(${escala})`, opacity: escala }}
                  >
                    <p>
                      {
                        ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][
                          new Date(anoAtual, mesAtual, dia).getDay()
                        ]
                      }
                    </p>
                    <strong>{dia}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

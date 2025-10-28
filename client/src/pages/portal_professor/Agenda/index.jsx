import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { FaPlus, FaBell, FaCircle } from "react-icons/fa";
import "./style.css";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { FaTrashCan } from "react-icons/fa6";

export default function Agenda() {
  const { user } = useContext(AuthContext);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [tarefas, setTarefas] = useState({});
   const [mostrarForm, setMostrarForm] = useState(null);
  const [novaTarefa, setNovaTarefa] = useState({
    nome: "",
    descricao: "",
    prioridade: "baixa",
    lembrete: "",
  });
 const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());
  const [tarefaAberta, setTarefaAberta] = useState(null);
  const scrollRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "";
  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();
  const diaAtual = dataAtual.getDate();

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  
  useEffect(() => {
    if (Notification.permission !== "granted") Notification.requestPermission();
  }, []);

 
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_URL}/api/tarefas`, {
        params: { usuarioId: user.uid, ano: anoAtual, mes: mesAtual },
      })
      .then((res) => setTarefas(res.data))
      .catch((err) => console.error("Erro ao carregar tarefas:", err));
  }, [user, anoAtual, mesAtual]);

  
  useEffect(() => {
    const agora = new Date();
    Object.values(tarefas).flat().forEach((t) => {
      if (t.lembrete && !t.concluida) {
        const horaLembrete = new Date(`${t.data}T${t.lembrete}`);
        const diff = horaLembrete.getTime() - agora.getTime();
        if (diff > 0) {
          setTimeout(() => {
            new Notification("Lembrete de tarefa", {
              body: `${t.nome} (${t.prioridade})`,
              icon: "/icon.png",
            });
          }, diff);
        }
      }
    });
  }, [tarefas]);

  useEffect(() => {
    const idDia = `dia-${diaSelecionado}`;
    const elementoDia = document.getElementById(idDia);

    if (scrollRef.current && elementoDia) {
      const container = scrollRef.current;
      const pos =
        elementoDia.offsetLeft -
        container.offsetWidth / 2 +
        elementoDia.offsetWidth / 2;
      container.scrollTo({ left: pos, behavior: "smooth" });
    }
  }, [diaSelecionado]);

  
  const handleAdicionarTarefa = async (e) => {
    e.preventDefault();
    if (!novaTarefa.nome.trim()) return alert("Informe o nome da tarefa.");
    if (!user) return alert("Usuário não autenticado.");

    const payload = {
      ...novaTarefa,
      usuarioId: user.uid,
      data: new Date(anoAtual, mesAtual, diaSelecionado).toISOString(),
      ano: anoAtual,
      mes: mesAtual,
      dia: diaSelecionado,
    };

    try {
      const { data } = await axios.post(`${API_URL}/api/tarefas`, payload);
      const chaveDia = `${anoAtual}-${mesAtual}-${diaSelecionado}`;
      setTarefas((prev) => ({
        ...prev,
        [chaveDia]: [...(prev[chaveDia] || []), data],
      }));
      setNovaTarefa({ nome: "", descricao: "", prioridade: "baixa", lembrete: "" });
      setMostrarForm(null);
      setDiaSelecionado(null);
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    }
  };

  
  const toggleConclusao = async (chaveDia, id) => {
    const novas = { ...tarefas };
    novas[chaveDia] = novas[chaveDia].map((t) =>
      t.id === id ? { ...t, concluida: !t.concluida } : t
    );
    setTarefas(novas);

    try {
      await axios.put(`${API_URL}/api/tarefas?id=${id}`, {
        concluida: !tarefas[chaveDia].find((t) => t.id === id).concluida,
      });
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  };

  const handleEditarTarefa = async () => {
  if (!novaTarefa.id) return alert("Nenhuma tarefa selecionada para edição.");

  try {
    await axios.put(`${API_URL}/api/tarefas?id=${novaTarefa.id}`, {
      nome: novaTarefa.nome,
      descricao: novaTarefa.descricao,
      prioridade: novaTarefa.prioridade,
      lembrete: novaTarefa.lembrete,
    });

    const chaveDia = `${anoAtual}-${mesAtual}-${novaTarefa.dia}`;

    setTarefas((prev) => ({
      ...prev,
      [chaveDia]: prev[chaveDia].map((t) =>
        t.id === novaTarefa.id ? { ...t, ...novaTarefa } : t
      ),
    }));

    setNovaTarefa({ nome: "", descricao: "", prioridade: "baixa", lembrete: "" });
    setEditando(null);
    setMostrarForm(null);
  } catch (err) {
    console.error("Erro ao editar tarefa:", err);
  }
};

  
  const removerTarefa = async (chaveDia, id) => {
    try {
      await axios.delete(`${API_URL}/api/tarefas?id=${id}`);
      setTarefas((prev) => ({
        ...prev,
        [chaveDia]: prev[chaveDia].filter((t) => t.id !== id),
      }));
      setTarefaAberta(null);
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
    }
  };

    const diasFiltrados = dias.filter((dia) => {
      const chaveDia = `${anoAtual}-${mesAtual}-${dia}`;
      const tarefasDia = (tarefas[chaveDia] || []).filter((t) => {
        const nomeMatch = t.nome.toLowerCase().includes(busca.toLowerCase());
        const prioridadeMatch =
          filtroPrioridade === "todas" || t.prioridade === filtroPrioridade;
        const statusMatch =
          filtroStatus === "todas" ||
          (filtroStatus === "concluidas" && t.concluida) ||
          (filtroStatus === "pendentes" && !t.concluida);
        return nomeMatch && prioridadeMatch && statusMatch;
      });

      
      return (
        tarefasDia.length > 0 ||
        (!busca && filtroPrioridade === "todas" && filtroStatus === "todas")
      );
    });

  
  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
          <div className="sigar">
            <p>Não perca nenhum detalhe do Instituto</p>
            <Link to="https://sigar.rsb.org.br/">Acesse o Sigar</Link>
          </div>
          <div className="filtros-container">
          <div className="campo-busca">
            <FaSearch className="icone-busca" />
            <input
              type="text"
              placeholder="Buscar tarefa por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-busca"
            />
          </div>

          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="select-filtro"
          >
            <option value="todas">Todas prioridades</option>
            <option value="alta">Alta</option>
            <option value="média">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="select-filtro"
          >
            <option value="todas">Todas</option>
            <option value="concluidas">Concluídas</option>
            <option value="pendentes">Pendentes</option>
          </select>
        </div>

          <div className="calendario">
            <div className="inicio-calendario">
              <IoIosArrowDropleft
                size={40}
                className="seta"
                onClick={() => {
                  const novoDia = new Date(dataAtual);
                  novoDia.setDate(dataAtual.getDate() - 1);
                  setDataAtual(novoDia);
                  setDiaSelecionado(novoDia.getDate());
                }}
              />
              <div className="selects">
                <select
                  value={mesAtual}
                  onChange={(e) => setDataAtual(new Date(anoAtual, e.target.value, diaAtual))}
                >
                  {meses.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={anoAtual}
                  onChange={(e) => setDataAtual(new Date(e.target.value, mesAtual, diaAtual))}
                >
                  {Array.from({ length: 10 }, (_, i) => anoAtual - 5 + i).map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <IoIosArrowDropright
                size={40}
                className="seta"
                onClick={() => {
                  const novoDia = new Date(dataAtual);
                  novoDia.setDate(dataAtual.getDate() + 1);
                  setDataAtual(novoDia);
                  setDiaSelecionado(novoDia.getDate());
                }}
              />
            </div>

            <div className="dias" ref={scrollRef}>
              {diasFiltrados.map((dia) => {
                const chaveDia = `${anoAtual}-${mesAtual}-${dia}`;
                const tarefasDia = (tarefas[chaveDia] || []).filter((t) => {
                  const nomeMatch = t.nome.toLowerCase().includes(busca.toLowerCase());
                  const prioridadeMatch =
                    filtroPrioridade === "todas" || t.prioridade === filtroPrioridade;
                  const statusMatch =
                    filtroStatus === "todas" ||
                    (filtroStatus === "concluidas" && t.concluida) ||
                    (filtroStatus === "pendentes" && !t.concluida);
                  return nomeMatch && prioridadeMatch && statusMatch;
                });

                
                const isHoje =
                  dia === new Date().getDate() &&
                  mesAtual === new Date().getMonth() &&
                  anoAtual === new Date().getFullYear();

                return (
                  <div
                    key={dia}
                    id={`dia-${dia}`}
                    onClick={() => {
                      if (mostrarForm === dia) return; 
                      setDiaSelecionado(diaSelecionado === dia ? null : dia);
                      setTarefaAberta(null);
                    }}

                    className={`dia ${isHoje ? "hoje" : ""} ${diaSelecionado === dia ? "selecionado" : ""}`}
                  >
                    <p>{["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][new Date(anoAtual, mesAtual, dia).getDay()]}</p>
                    <strong>{dia}</strong>

                    
                      <div className="tarefas-card" onClick={(e) => e.stopPropagation()}>
                        {tarefaAberta && tarefaAberta.dia === dia ? (
                          <div className="detalhe-tarefa">
                            <h4>{tarefaAberta.nome}</h4>
                            <p>{tarefaAberta.descricao || "Sem descrição"}</p>
                            {tarefaAberta.lembrete && (
                              <p><FaBell /> Lembrete: {tarefaAberta.lembrete}</p>
                            )}
                            <p>
                              Prioridade:{" "}
                              <span
                                className={`prioridade-detalhe ${tarefaAberta.prioridade}`}
                              >
                                {tarefaAberta.prioridade.charAt(0).toUpperCase() +
                                  tarefaAberta.prioridade.slice(1)}
                              </span>
                            </p>
                            <div className="acoes-tarefa">
                              <button onClick={() => setTarefaAberta(null)}>Voltar</button>
                              <button
                                onClick={() => {
                                  setNovaTarefa({ ...tarefaAberta });
                                  setEditando(dia); 
                                  setTarefaAberta(null);
                                }}
                              >
                                <FiEdit3 />
                              </button>
                              <button
                                onClick={() => {
                                  const confirmar = window.confirm(
                                    `Tem certeza que deseja excluir a tarefa "${tarefaAberta.nome}"?`
                                  );
                                  if (confirmar) removerTarefa(chaveDia, tarefaAberta.id);
                                }}
                                className="btn-excluir-tarefa"
                                title="Excluir tarefa"
                              >
                                <FaTrashCan />
                              </button>

                            </div>

                          </div>
                        ) : (
                          <>
                        <ul
                          className={`lista-tarefas ${
                            (mostrarForm === dia || editando === dia) ? "ocultar" : ""
                          }`}
                        >
                          {tarefasDia.map((t) => (
                            <li
                              key={t.id}
                              className={`tarefa ${t.prioridade} ${
                                t.concluida ? "concluida-tarefa" : ""
                              }`}
                              onClick={(e) => {
                                if (e.target.tagName !== "INPUT")
                                  setTarefaAberta({ ...t, dia });
                              }}
                            >
                              <label>
                                <input
                                  type="checkbox"
                                  checked={t.concluida}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleConclusao(chaveDia, t.id);
                                  }}
                                />
                                <span>{t.nome}</span>
                              </label>
                              <FaCircle
                                className="prioridade-icon"
                                color={
                                  t.prioridade === "alta"
                                    ? "#d9534f"
                                    : t.prioridade === "média"
                                    ? "#f0ad4e"
                                    : "#5cb85c"
                                }
                              />
                            </li>
                          ))}
                        </ul>

                        
                        {(mostrarForm === dia || editando === dia) && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (editando) {
                                handleEditarTarefa();
                              } else {
                                setDiaSelecionado(dia); 
                                handleAdicionarTarefa(e);
                              }
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Nome da tarefa..."
                              value={novaTarefa.nome}
                              onChange={(e) =>
                                setNovaTarefa({ ...novaTarefa, nome: e.target.value })
                              }
                            />
                            <textarea
                              placeholder="Descrição (opcional)"
                              value={novaTarefa.descricao}
                              onChange={(e) =>
                                setNovaTarefa({ ...novaTarefa, descricao: e.target.value })
                              }
                            />
                            <select
                              value={novaTarefa.prioridade}
                              onChange={(e) =>
                                setNovaTarefa({ ...novaTarefa, prioridade: e.target.value })
                              }
                            >
                              <option value="">Selecione Prioridade...</option>
                              <option value="baixa">Baixa</option>
                              <option value="média">Média</option>
                              <option value="alta">Alta</option>
                            </select>

                            <label className="lembrete-label">
                              <FaBell /> Lembrete:
                              <input
                                type="time"
                                value={novaTarefa.lembrete}
                                onChange={(e) =>
                                  setNovaTarefa({ ...novaTarefa, lembrete: e.target.value })
                                }
                              />
                            </label>

                            <button type="submit" className="btn-add-tarefa">
                              {editando ? "Salvar alterações" : "Adicionar tarefa"}
                            </button>

                            <button
                              type="button"
                              className="btn-cancelar-tarefa"
                              onClick={() => {
                                setMostrarForm(null);
                                setEditando(null);
                                setNovaTarefa({
                                  nome: "",
                                  descricao: "",
                                  prioridade: "baixa",
                                  lembrete: "",
                                });
                              }}
                            >
                              Cancelar
                            </button>
                          </form>
                        )}

                        
                        {!editando && mostrarForm !== dia && (
                          <button
                            className="btn-add-tarefa"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMostrarForm(dia);
                              setDiaSelecionado(dia);
                            }}
                          >
                            <FaPlus /> Nova tarefa
                          </button>
                        )}

                        </>
                        )}
                      </div>

                    
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

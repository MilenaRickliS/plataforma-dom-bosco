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
import { adicionarPontos, removerPontos, mostrarToastPontosAdicionar, mostrarToastPontosRemover, regrasPontuacao } from "../../../services/gamificacao";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Agenda() {
  const { user } = useContext(AuthContext);
  const [contagemDescricao, setContagemDescricao] = useState(0);
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

    if (!user) return toast.error("Usuário não autenticado.");

    const nome = novaTarefa.nome.trim();
    const descricao = novaTarefa.descricao.trim();
    const prioridade = novaTarefa.prioridade;

    
    if (!nome) return toast.error("Informe o nome da tarefa.");
    if (nome.length < 3)
      return toast.error("O nome deve ter pelo menos 3 letras.");
    if (nome.split(" ").length > 5)
      return toast.error("O nome pode ter no máximo 5 palavras.");

    
    if (descricao && descricao.split(" ").length > 30)
      return toast.error("A descrição pode ter no máximo 30 palavras.");

   
    if (!prioridade)
      return toast.error("Selecione uma prioridade para a tarefa.");

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
      toast.success("Tarefa adicionada com sucesso!");
      await adicionarPontos(user.uid, regrasPontuacao.criarTarefa, "Tarefa criada 📝");
      mostrarToastPontosAdicionar(regrasPontuacao.criarTarefa, "Tarefa criada 📝");

    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      toast.error("Erro ao salvar tarefa. Tente novamente.");
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
      const tarefa = tarefas[chaveDia].find((t) => t.id === id);
      const concluindo = !tarefa.concluida; 

      if (concluindo) {
        const hoje = new Date();
        const dataTarefa = new Date(tarefa.data);
        const tarefaImportante = tarefa.prioridade === "alta";
        const totalConcluidasHoje = Object.values(tarefas)
          .flat()
          .filter((t) => t.concluida && new Date(t.data).toDateString() === hoje.toDateString())
          .length;

       
        await adicionarPontos(user.uid, regrasPontuacao.concluirAtividade, "Tarefa concluída ✅");
        mostrarToastPontosAdicionar(regrasPontuacao.concluirAtividade, "Tarefa concluída ✅");

        if (dataTarefa > hoje) {
          await adicionarPontos(user.uid, regrasPontuacao.concluirTarefaAntes, "Concluiu antes do prazo 🎯");
          mostrarToastPontosAdicionar(regrasPontuacao.concluirTarefaAntes, "Concluiu antes do prazo 🎯");
        }

        if (tarefaImportante) {
          await adicionarPontos(user.uid, regrasPontuacao.concluirTarefaImportante, "Tarefa importante finalizada 🏅");
          mostrarToastPontosAdicionar(regrasPontuacao.concluirTarefaImportante, "Tarefa importante finalizada 🏅");
        }

        if (totalConcluidasHoje >= 5) {
          await adicionarPontos(user.uid, regrasPontuacao.concluir5AtivDia, "Bônus do dia: 5 tarefas concluídas! 🔥");
          mostrarToastPontosAdicionar(regrasPontuacao.concluir5AtivDia, "Bônus do dia: 5 tarefas concluídas! 🔥");
        }

        } else {
        
        await removerPontos(user.uid, Math.abs(regrasPontuacao.tarefaPendente, "Tarefa desmarcada 😞"));
        mostrarToastPontosRemover(-regrasPontuacao.tarefaPendente, "Tarefa desmarcada 😞");

      }
  
  } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  };

  const handleEditarTarefa = async () => {
  if (!novaTarefa.id) return alert("Nenhuma tarefa selecionada para edição.");

   if (!user) return toast.error("Usuário não autenticado.");

    const nome = novaTarefa.nome.trim();
    const descricao = novaTarefa.descricao.trim();
    const prioridade = novaTarefa.prioridade;

    
    if (!nome) return toast.error("Informe o nome da tarefa.");
    if (nome.length < 3)
      return toast.error("O nome deve ter pelo menos 3 letras.");
    if (nome.split(" ").length > 5)
      return toast.error("O nome pode ter no máximo 5 palavras.");

    
    if (descricao && descricao.split(" ").length > 30)
      return toast.error("A descrição pode ter no máximo 30 palavras.");

   
    if (!prioridade)
      return toast.error("Selecione uma prioridade para a tarefa.");
  
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
    toast.success("Tarefa atualizada com sucesso!");

  } catch (err) {
    console.error("Erro ao editar tarefa:", err);
    toast.error("Erro ao salvar tarefa. Tente novamente.");
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

    useEffect(() => {
    if (!user) return;

    const penalizados = JSON.parse(localStorage.getItem("penalizados")) || {};
    const hoje = new Date();

    Object.values(tarefas).flat().forEach(async (t) => {
      const dataTarefa = new Date(t.data);
      const idUnico = `${user.uid}-${t.id}`;

      if (!t.concluida && dataTarefa < hoje && !penalizados[idUnico]) {
        await removerPontos(user.uid, Math.abs(regrasPontuacao.tarefaPendente), `Tarefa pendente: "${t.nome}" expirou ⏰`);
        mostrarToastPontosRemover(-regrasPontuacao.tarefaPendente, `Tarefa pendente: "${t.nome}" expirou ⏰`);


        penalizados[idUnico] = true;
        localStorage.setItem("penalizados", JSON.stringify(penalizados));
      }
    });
  }, [tarefas]);


     useEffect(() => {
        if (!user) return;
        
        const hoje = new Date().toDateString();
        const chaveBonus = `${user.uid}-bonus-${hoje}`;
        if (localStorage.getItem(chaveBonus)) return; 
    
        const concluidasHoje = Object.values(tarefas)
          .flat()
          .filter((t) => t.concluida && new Date(t.data).toDateString() === hoje)
          .length;
    
        if (concluidasHoje >= 10) {
          adicionarPontos(user.uid, regrasPontuacao.concluir10AtivDia, "Bônus do dia: 10 tarefas concluídas! 🎉");
          mostrarToastPontosAdicionar(regrasPontuacao.concluir10AtivDia, "Bônus do dia: 10 tarefas concluídas! 🎉");
          localStorage.setItem(chaveBonus, "true");
        }
      }, [tarefas]);




  
  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <ToastContainer position="bottom-right" theme="colored" />

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
                            <div className="campo-descricao-tarefa">
                            <textarea
                              placeholder="Descrição (opcional)"
                              value={novaTarefa.descricao}
                              onChange={(e) => {
                                const texto = e.target.value;
                                const palavras = texto.trim().split(/\s+/).filter(Boolean);
                                setNovaTarefa({ ...novaTarefa, descricao: texto });
                                setContagemDescricao(palavras.length);
                                if (palavras.length > 30) {
                                  toast.warning("⚠️ Limite de 30 palavras atingido!");
                                }
                              }}
                            />
                            <p className={`contador-palavras-tarefa ${contagemDescricao > 30 ? "excedido" : ""}`}>
                              {contagemDescricao}/30 palavras
                            </p>
                          </div>

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

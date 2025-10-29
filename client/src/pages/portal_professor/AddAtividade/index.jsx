import { useContext, useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { addDoc, collection, Timestamp, getDocs, query, where } from "firebase/firestore";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { db } from "../../../services/firebaseConnection";
import { AuthContext } from "../../../contexts/auth";
import "./style.css";

export default function AddAtividade() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tituloAtividade, setTituloAtividade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("23:59"); 
  const [valor, setValor] = useState("");
  const [estadoEntregue, setEstadoEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [conteudosSugeridos, setConteudosSugeridos] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchConteudos = async () => {
      try {
        let turmaCodigo = null; try { turmaCodigo = localStorage.getItem('lastTurmaCodigo'); } catch {}
        const filtros = [where("usuarioId", "==", user.uid)];
        if (turmaCodigo) filtros.push(where("turmaCodigo", "==", turmaCodigo));
        const qy = query(collection(db, "atividade"), ...filtros);
        const snap = await getDocs(qy);
        const s = new Set();
        snap.forEach((doc) => {
          const c = doc.data()?.conteudo;
          if (c && typeof c === 'string') s.add(c.trim());
        });
        setConteudosSugeridos(Array.from(s).sort((a,b)=>a.localeCompare(b)));
      } catch (e) {
        console.error('Erro ao carregar conteúdos sugeridos:', e);
      }
    };
    fetchConteudos();
  }, [user]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!user?.uid) return alert("Faça login novamente.");
    if (!tituloAtividade || !data) return alert("Preencha pelo menos título e data.");

    try {
      setSalvando(true);
      const dateTime = new Date(`${data}T${hora}:59`);
      const lastCodigo = (() => { try { return localStorage.getItem('lastTurmaCodigo'); } catch { return null } })();
      const payload = {
        tituloAtividade,
        Descricao: descricao,
        conteudo,
        entrega: Timestamp.fromDate(dateTime),
        valor: valor ? Number(valor) : 0,
        estadoEntregue,
        turmaCodigo: lastCodigo || null,
        usuarioId: user.uid,
        criadaEm: new Date().toISOString(),
      };

      await addDoc(collection(db, "atividade"), payload);
      alert("Atividade adicionada com sucesso!");
      if (lastCodigo) {
        navigate(`/professor/turma/${lastCodigo}`);
      } else {
        navigate("/professor/atividades");
      }
    } catch (err) {
      console.error("Erro ao salvar atividade:", err);
      alert("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main id="sala">
          <MenuTopoProfessor />
          <div className="menu-turma">
            <NavLink to="/professor/turma">Painel</NavLink>
            <NavLink to="/professor/atividades">Todas as atividades</NavLink>
            <NavLink to="/professor/alunos-turma">Alunos</NavLink>
          </div>

          <form className="form-add-ativ" onSubmit={handleSalvar}>
            <h3>Criar atividade</h3>
            <label>
              <p>Título:</p>
              <input
                type="text"
                value={tituloAtividade}
                onChange={(e) => setTituloAtividade(e.target.value)}
                placeholder="Coloque aqui o titulo da atividade."
                required
              />
            </label>

            <label>
              <p>Descrição:</p>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Instruções, passo a passo, etc."
                rows={4}
              />
            </label>

            <label>
              <p>Conteúdo:</p>
              <input
                type="text"
                list="conteudos-sugeridos"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Selecione ou digite um conteúdo"
              />
              <datalist id="conteudos-sugeridos">
                {conteudosSugeridos.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <div className="row">
              <label>
                <p>Data de entrega:</p>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </label>

              <label>
                <p>Hora de entrega:</p>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </label>

              <label>
                <p>Valor da atividade:</p>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Coloque aqui a nota da atividade"
                />
              </label>
            </div>
            <div className="acoes">
              <button type="button" className="btn secundario" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="submit" className="btn primario" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar atividade"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}



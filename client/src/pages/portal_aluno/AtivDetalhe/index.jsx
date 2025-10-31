import { useEffect, useState, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { AuthContext } from "../../../contexts/auth";
import axios from "axios";
import "./style.css";
import { FaPaperclip, FaClock, FaBookOpen, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

export default function AtivDetalhesAluno() {
  const { id } = useParams(); // ID da publicação (atividade)
  const { user } = useContext(AuthContext);
  const [publicacao, setPublicacao] = useState(null);
  const [turma, setTurma] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  // 🔹 Carrega detalhes da atividade
  useEffect(() => {
    if (!id || !user?.uid) return;
    const carregar = async () => {
      try {
        setCarregando(true);
        const res = await axios.get(`${API}/api/publicacoes`);
        const todas = res.data || [];
        const encontrada = todas.find((p) => p.id === id);
        setPublicacao(encontrada || null);

        // Busca dados da turma
        if (encontrada?.turmaId) {
          const turmaRes = await axios.get(`${API}/api/turmas?id=${encontrada.turmaId}`);
          setTurma(turmaRes.data || null);
        }

        // Busca entrega do aluno (se existir)
        const entregasRes = await axios.get(`${API}/api/entregas?atividadeId=${id}&alunoId=${user.uid}`);
        setEntrega(entregasRes.data?.[0] || null);
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id, user, API]);

  const formatarData = (valor) => {
    if (!valor) return "—";
    const data =
      valor._seconds != null ? new Date(valor._seconds * 1000) : new Date(valor);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 🔹 Enviar entrega
  const handleEnviarEntrega = async () => {
    if (!arquivo) return alert("Selecione um arquivo antes de enviar.");
    try {
      setEnviando(true);

      // Faz upload base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(arquivo);
      });

      const uploadRes = await fetch(`${API}/api/uploads/base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64, folder: "entregas" }),
      });

      if (!uploadRes.ok) throw new Error("Erro no upload do arquivo");
      const upload = await uploadRes.json();

      // Salva a entrega no backend
      await axios.post(`${API}/api/entregas`, {
        atividadeId: id,
        alunoId: user.uid,
        arquivoUrl: upload.url,
        nomeArquivo: arquivo.name,
        enviadaEm: new Date().toISOString(),
      });

      alert("Entrega enviada com sucesso!");
      setEntrega({
        arquivoUrl: upload.url,
        nomeArquivo: arquivo.name,
        enviadaEm: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Erro ao enviar entrega:", err);
      alert("Não foi possível enviar a entrega.");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return <p className="info">Carregando detalhes da atividade...</p>;
  }

  if (!publicacao) {
    return <p className="info">Atividade não encontrada.</p>;
  }

  const titulo = turma?.materia || "Turma";
  const subtitulo = turma?.nomeTurma || "";

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main id="sala">
          <MenuTopoAluno />

          {/* 🔹 Menu fixo */}
          <div className="menu-turma">
            <NavLink to={`/aluno/turma/${publicacao.turmaId || ""}`}>Painel</NavLink>
            <NavLink to={`/aluno/atividades/${publicacao.turmaId || ""}`}>
              Todas as atividades
            </NavLink>
            <NavLink to={`/aluno/alunos-turma/${publicacao.turmaId || ""}`}>Alunos</NavLink>
          </div>


          {/* 🔹 Cabeçalho visual */}
          <div
            className="titulo-sala-alunos"
            style={{
              backgroundImage: turma?.imagem
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${turma.imagem})`
                : "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/src/assets/fundo-turma-padrao.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "#fff",
              padding: "2rem",
              borderRadius: "12px",
            }}
          >
            <div>
              <h3>{titulo}</h3>
              <p>{subtitulo}</p>
            </div>
          </div>
          <br />

          {/* 🔹 Conteúdo da atividade */}
          <section className="detalhes-atividade">
            <h3><FaBookOpen /> {publicacao.titulo}</h3>
            <p>{publicacao.descricao || "Sem descrição disponível."}</p>

            <div className="info-bloco">
              {publicacao.tipo === "atividade" && publicacao.entrega && (
                <p>
                  <FaClock /> Prazo:{" "}
                  {formatarData(publicacao.entrega._seconds ? new Date(publicacao.entrega._seconds * 1000) : publicacao.entrega)}
                </p>
              )}
              {publicacao.tipo === "avaliacao" && (
                <p>
                  <FaCalendarAlt /> Avaliação — Valor total: {publicacao.valor || 0} pts
                </p>
              )}
              <p><strong>Tipo:</strong> {publicacao.tipo}</p>
              <p><strong>Criada em:</strong> {formatarData(publicacao.criadaEm)}</p>
            </div>

            {publicacao.anexos?.length > 0 && (
              <div className="anexos-detalhes">
                <h3><FaPaperclip /> Materiais de apoio</h3>
                <ul>
                  {publicacao.anexos.map((a, i) => (
                    <li key={i}>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        {a.nome || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 🔹 Seção de entrega */}
            {publicacao.tipo === "atividade" && (
              <div className="entrega-aluno">
                <h3>📤 Entrega do aluno</h3>

                {entrega ? (
                  <div className="entrega-ok">
                    <FaCheckCircle color="#16a34a" size={20} />{" "}
                    <span>
                      Entregue em {formatarData(entrega.enviadaEm)} <br />
                      <a href={entrega.arquivoUrl} target="_blank" rel="noreferrer">
                        {entrega.nomeArquivo}
                      </a>
                    </span>
                  </div>
                ) : (
                  <div className="envio-form">
                    <input
                      type="file"
                      onChange={(e) => setArquivo(e.target.files[0])}
                      disabled={enviando}
                    />
                    <button
                      onClick={handleEnviarEntrega}
                      disabled={!arquivo || enviando}
                      className="btn primario"
                    >
                      {enviando ? "Enviando..." : "Enviar entrega"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCalendarAlt } from "react-icons/fa";

export default function AdicionarCicloManual() {
  const [form, setForm] = useState({
    dataInicio: "",
    dataFim: "",
    totalPessoas: "",
    pesoTotal: "",
  });
  const [salvando, setSalvando] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  function handleChange(e) {
    const { name, value } = e.target;

    if ((name === "totalPessoas" || name === "pesoTotal") && value !== "") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.dataInicio || !form.dataFim || !form.totalPessoas || !form.pesoTotal) {
      toast.error("⚠️ Todos os campos são obrigatórios!");
      return;
    }

    if (isNaN(form.totalPessoas) || isNaN(form.pesoTotal)) {
      toast.error("❌ Total de pessoas e peso total devem ser números válidos.");
      return;
    }

    if (Number(form.totalPessoas) < 0 || Number(form.pesoTotal) < 0) {
      toast.error("⚠️ Os valores não podem ser negativos.");
      return;
    }

    const inicio = new Date(form.dataInicio);
    const fim = new Date(form.dataFim);
    if (fim <= inicio) {
      toast.error("⚠️ A data de fim deve ser posterior à data de início.");
      return;
    }

    const ciclo = {
      dataInicio: inicio.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      dataFim: fim.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      totalPessoas: Number(form.totalPessoas),
      pesoTotal: Number(form.pesoTotal),
      criadoManual: true,
    };

    try {
      setSalvando(true);
      const res = await fetch(`${API_URL}/api/pesagem?tipo=cicloManual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ciclo),
      });

      const data = await res.json();
      if (data.sucesso) {
        toast.success("✅ Ciclo manual salvo com sucesso!");
        setForm({ dataInicio: "", dataFim: "", totalPessoas: "", pesoTotal: "" });
      } else {
        toast.error("❌ Erro: " + (data.erro || "Falha ao salvar."));
      }
    } catch (err) {
      console.error("Erro ao salvar ciclo manual:", err);
      toast.error("❌ Erro ao salvar. Verifique a conexão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="refeicao-adicionar-container">
      <ToastContainer position="bottom-right" theme="colored" />
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref" aria-label="Voltar">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Adicionar Refeição Manual</h2>
      </div>

      <form className="form-ref" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="input-wrapper">
            <span className="label-text">Data de Início*:</span>
            <div className="input-with-icon">
              <input
                className="input-refeicao"
                type="datetime-local"
                name="dataInicio"
                value={form.dataInicio}
                onChange={handleChange}
                required
              />
              <FaCalendarAlt className="icon-calendario" />
            </div>
          </label>
          <label className="input-wrapper">
            <span className="label-text">Data de Fim*:</span>
            <div className="input-with-icon">
              <input
                className="input-refeicao"
                type="datetime-local"
                name="dataFim"
                value={form.dataFim}
                onChange={handleChange}
                required
              />
              <FaCalendarAlt className="icon-calendario" />
            </div>
          </label>
      
        </div>

        <div className="form-row">
          <label>
            <span className="label-text">Total de Pessoas*:</span>
            <input
              className="input-refeicao"
              type="text"
              name="totalPessoas"
              value={form.totalPessoas}
              onChange={handleChange}
              placeholder="Ex: 120"
              required
            />
          </label>

          <label>
            <span className="label-text">Peso Total (kg)*:</span>
            <input
              className="input-refeicao"
              type="text"
              name="pesoTotal"
              value={form.pesoTotal}
              onChange={handleChange}
              placeholder="Ex: 62.3"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="salvar-refeicao-btn"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";

export default function Adicionar() {
  const [form, setForm] = useState({
    titulo: "",
    total: "",
    dataHora: "",
  });
  const [salvando, setSalvando] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend.vercel.app";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.titulo || !form.total || !form.dataHora) {
      alert("⚠️ Preencha todos os campos obrigatórios.");
      return;
    }

   
    const dataHoraISO = new Date(form.dataHora);
    const dataString = dataHoraISO.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    const payload = {
      titulo: form.titulo.trim(),
      total: Number(form.total),
      data: dataString, 
    };

    try {
      setSalvando(true);
      const res = await fetch(`${API_URL}/api/refeicoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Registro salvo com sucesso!");
        setForm({ titulo: "", total: "", dataHora: "" });
      } else {
        alert("❌ Erro: " + (data.error || "Falha ao salvar."));
      }
    } catch (err) {
      console.error("Erro ao salvar refeição:", err);
      alert("❌ Erro ao salvar. Verifique a conexão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="refeicao-adicionar-container">
      <br />
      <Link to="/inicio-refeicao" className="voltar-ref" aria-label="Voltar">
        <IoArrowUndoSharp />
      </Link>

      <div className="titulo-ref">
        <img src={logo} alt="Logo" />
        <h2>Adicionar registro manual</h2>
      </div>

      <form className="form-ref" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            <span className="label-text">Título*:</span>
            <input
              className="input-refeicao"
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ex: Almoço, Lanche, Café..."
              required
            />
          </label>

          <label>
            <span className="label-text">Total de refeições*:</span>
            <input
              className="input-refeicao"
              type="number"
              name="total"
              value={form.total}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            <span className="label-text">Data e hora*:</span>
            <input
              className="input-refeicao"
              type="datetime-local"
              name="dataHora"
              value={form.dataHora}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="salvar-refeicao-btn"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar registro"}
        </button>
      </form>
    </div>
  );
}

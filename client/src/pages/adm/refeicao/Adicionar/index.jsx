import { useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../services/firebaseConnection";
import logo from "../../../../assets/logo2.png";
import "./style.css";
import { IoArrowUndoSharp } from "react-icons/io5";

export default function Adicionar() {
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    data: "",
    qtdAlunos: "",
    Refeicao: "",
    Observacao: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toNumber(val) {
    if (val === "" || val === null || val === undefined) return null;
    const normalized = String(val).replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.data || !form.qtdAlunos) {
      alert("Preencha os campos obrigatórios marcados com *.");
      return;
    }

    const payload = {
      data: form.data,
      qtdAlunos: toNumber(form.qtdAlunos),
      refeicao: form.Refeicao || null,
      observacao: form.Observacao || null,
      createdAt: serverTimestamp(),
    };

    try {
      setSalvando(true);
      await addDoc(collection(db, "refeicoes"), payload);
      alert("Registro salvo com sucesso!");
      setForm({
        data: "",
        qtdAlunos: "",
        refeicao: "",
        observacao: "",
      });
    } catch (err) {
      console.error("Erro ao salvar refeição:", err);
      alert("Erro ao salvar. Tente novamente.");
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
        <h2>Adicionar registro</h2>
      </div>

      <form className="form-ref" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            <span className="label-text">Data*:</span>
            <input type="date" name="data" value={form.data} onChange={handleChange} required />
          </label>
          <label>
            <span className="label-text">Quantidade de alunos*:</span>
            <input
              type="number"
              name="qtdAlunos"
              inputMode="numeric"
              step="1"
              value={form.qtdAlunos}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            <span className="label-text">Refeição:</span>
            <select name="refeicao" value={form.Refeicao} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="Café da manhã">Café da manhã</option>
              <option value="Almoço">Almoço</option>
              <option value="Lanche">Lanche</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label className="label-full">
            <span className="label-text">Observação:</span>
            <textarea name="observacao" value={form.Observacao} onChange={handleChange} rows={3} />
          </label>
        </div>

        <button type="submit" className="btn-salvar-registro" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar registro"}
        </button>
      </form>
    </div>
  );
}
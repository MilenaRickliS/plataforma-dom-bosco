import { useEffect, useState } from "react";

export default function MealNameModal({
  open,
  title = "Nova refeição",
  initialValue = "",
  confirmLabel = "Salvar",
  loading = false,
  onClose,
  onConfirm,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialValue || "");
      setError("");
    }
  }, [open, initialValue]);

  function capitalizeWords(value) {
    return value
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trimStart()
      .split(" ")
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");
  }

  function handleChange(value) {
    const clean = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÇç0-9\s-]/g, "");
    setName(capitalizeWords(clean));
    setError("");
  }

  function validate() {
    const cleanName = name.trim();

    if (!cleanName) {
      setError("O nome da refeição é obrigatório.");
      return false;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿÇç0-9\s-]+$/.test(cleanName)) {
      setError(
        "Use apenas letras, números, espaço, hífen, ç e acentos."
      );
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!validate()) return;
    await onConfirm(name.trim());
  }

  if (!open) return null;

  return (
    <div className="nutri-modal-backdrop" onClick={onClose}>
      <div className="nutri-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nutri-modal-icon">🍽️</div>

        <h3 className="nutri-modal-title">{title}</h3>

        <p className="nutri-modal-text">
          Digite o nome da refeição para continuar.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="nutri-label" style={{ textAlign: "left", marginTop: 12 }}>
            Nome da refeição
            <input
              className={`nutri-input ${error ? "nutri-input-error" : ""}`}
              type="text"
              value={name}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Ex: Café Da Manhã"
              autoFocus
              maxLength={60}
            />
            {error && <small className="nutri-error">{error}</small>}
          </label>

          <br/>

          <div className="nutri-modal-actions">
            <button
              type="button"
              className="nutri-btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="nutri-btn"
              disabled={loading}
            >
              {loading ? "Salvando..." : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";

export default function MealModal({ open, onClose, foods, onAdd }) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [portionUsed, setPortionUsed] = useState("");
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return foods;
    return foods.filter((f) => (f.name || "").toLowerCase().includes(s));
  }, [foods, q]);

  const selectedFood = useMemo(
    () => foods.find((f) => f.id === selectedId),
    [foods, selectedId]
  );

  function resetModal() {
    setQ("");
    setSelectedId("");
    setPortionUsed("");
    setErrors({});
  }

  function handleClose() {
    resetModal();
    onClose();
  }

  function handlePick(food) {
    setSelectedId(food.id);
    setPortionUsed(String(food.portion_g ?? 100).replace(/\D/g, "").slice(0, 6));
    setErrors((prev) => ({
      ...prev,
      selectedId: "",
      portionUsed: "",
    }));
  }

  function handlePortionChange(value) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setPortionUsed(clean);

    setErrors((prev) => ({
      ...prev,
      portionUsed: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!selectedFood) {
      newErrors.selectedId = "Selecione um alimento para adicionar.";
    }

    if (!String(portionUsed).trim()) {
      newErrors.portionUsed = "A porção é obrigatória.";
    } else if (!/^\d{1,6}$/.test(String(portionUsed))) {
      newErrors.portionUsed =
        "A porção deve conter apenas números (máx. 6 dígitos).";
    } else if (Number(portionUsed) <= 0) {
      newErrors.portionUsed = "A porção deve ser maior que zero.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleAdd() {
    if (!validateForm()) return;

    const g = Number(portionUsed);
    await onAdd(selectedFood, g);
    handleClose();
  }

  if (!open) return null;

  return (
    <div className="nutri-modal-backdrop" onClick={handleClose}>
      <div className="nutri-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nutri-row-between">
          <h3>Adicionar alimento</h3>
          <button
            type="button"
            className="nutri-btn-outline"
            onClick={handleClose}
          >
            Fechar
          </button>
        </div>

        <input
          className="nutri-input"
          placeholder="Pesquisar alimento..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="nutri-modal-list">
          {filtered.map((f) => (
            <button
              key={f.id}
              className={`nutri-modal-item ${selectedId === f.id ? "active" : ""}`}
              onClick={() => handlePick(f)}
              type="button"
            >
              <div className="nutri-item-title">{f.name}</div>
              <div className="nutri-item-sub">Porção base: {f.portion_g}g</div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="nutri-empty">Nada por aqui.</div>
          )}
        </div>

        {errors.selectedId && (
          <small className="nutri-error">{errors.selectedId}</small>
        )}

        <div className="nutri-modal-footer">
          <label className="nutri-label">
            Porção na refeição (g)
            <input
              className="nutri-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={portionUsed}
              onChange={(e) => handlePortionChange(e.target.value)}
              disabled={!selectedFood}
              placeholder="Ex: 100"
            />
            {errors.portionUsed && (
              <small className="nutri-error">{errors.portionUsed}</small>
            )}
          </label>

          <button
            type="button"
            className="nutri-btn"
            onClick={handleAdd}
            disabled={!selectedFood}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
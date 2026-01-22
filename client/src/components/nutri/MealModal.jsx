import { useMemo, useState } from "react";

export default function MealModal({ open, onClose, foods, onAdd }) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [portionUsed, setPortionUsed] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return foods;
    return foods.filter(f => (f.name || "").toLowerCase().includes(s));
  }, [foods, q]);

  const selectedFood = useMemo(
    () => foods.find(f => f.id === selectedId),
    [foods, selectedId]
  );

  function handlePick(food) {
    setSelectedId(food.id);
    setPortionUsed(String(food.portion_g ?? 100));
  }

  function handleAdd() {
    if (!selectedFood) return;
    const g = Number(portionUsed);
    if (!g || g <= 0) return;

    onAdd(selectedFood, g);
    onClose();
    setQ("");
    setSelectedId("");
    setPortionUsed("");
  }

  if (!open) return null;

  return (
    <div className="nutri-modal-backdrop" onClick={onClose}>
      <div className="nutri-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nutri-row-between">
          <h3>Adicionar alimento</h3>
          <button className="nutri-btn-outline" onClick={onClose}>Fechar</button>
        </div>

        <input className="nutri-input" placeholder="Pesquisar alimento..." value={q} onChange={(e) => setQ(e.target.value)} />

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
          {filtered.length === 0 && <div className="nutri-empty">Nada por aqui.</div>}
        </div>

        {selectedFood && (
          <div className="nutri-modal-footer">
            <label className="nutri-label">
              Porção na refeição (g)
              <input className="nutri-input" type="number" min="1" value={portionUsed} onChange={(e) => setPortionUsed(e.target.value)} />
            </label>
            <button className="nutri-btn" onClick={handleAdd}>Adicionar</button>
          </div>
        )}
      </div>
    </div>
  );
}

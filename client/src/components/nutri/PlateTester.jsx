import { useMemo, useState } from "react";
import { kcalFromItemSnapshot } from "../../utils/nutrition";

export default function PlateTester({ foods }) {
  const [q, setQ] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [portionUsed, setPortionUsed] = useState("");
  const [plateItems, setPlateItems] = useState([]);
  const [portionError, setPortionError] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return foods;
    return foods.filter((f) => (f.name || "").toLowerCase().includes(s));
  }, [foods, q]);

  const selectedFood = useMemo(
    () => foods.find((f) => f.id === selectedFoodId),
    [foods, selectedFoodId]
  );

  function handlePortionChange(value) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setPortionUsed(clean);

    if (clean.trim()) {
      setPortionError("");
    }
  }

  function pickFood(food) {
    setSelectedFoodId(food.id);
    setPortionUsed(String(food.portion_g ?? 100).replace(/\D/g, "").slice(0, 6));
    setPortionError("");
  }

  function validatePortion(value) {
    const v = String(value).trim();

    if (!v) {
      return "A porção é obrigatória.";
    }

    if (!/^\d{1,6}$/.test(v)) {
      return "A porção deve conter apenas números (máx. 6 dígitos).";
    }

    if (Number(v) <= 0) {
      return "A porção deve ser maior que zero.";
    }

    return "";
  }

  function addToPlate() {
    if (!selectedFood) return;

    const error = validatePortion(portionUsed);
    if (error) {
      setPortionError(error);
      return;
    }

    const g = Number(portionUsed);

    const item = {
      id: `${selectedFood.id}-${Date.now()}`,
      foodId: selectedFood.id,
      foodNameSnapshot: selectedFood.name,
      portionBase_g: Number(selectedFood.portion_g),
      carbsBase_g: Number(selectedFood.carbs_g),
      proteinBase_g: Number(selectedFood.protein_g),
      fatBase_g: Number(selectedFood.fat_g),
      portionUsed_g: g,
    };

    setPlateItems((prev) => [...prev, item]);

    setSelectedFoodId("");
    setPortionUsed("");
    setQ("");
    setPortionError("");
  }

  function removeItem(id) {
    setPlateItems((prev) => prev.filter((x) => x.id !== id));
  }

  function changePortion(id, newValue) {
    const clean = newValue.replace(/\D/g, "").slice(0, 6);

    setPlateItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              portionUsed_g: clean === "" ? "" : Number(clean),
            }
          : x
      )
    );
  }

  const totalKcal = useMemo(
    () =>
      plateItems.reduce(
        (s, it) => s + (it.portionUsed_g ? kcalFromItemSnapshot(it) : 0),
        0
      ),
    [plateItems]
  );

  return (
    <div className="nutri-card">
      <div className="nutri-row-between">
        <h3>Área de Teste do Prato</h3>
        <div style={{ fontWeight: 800 }}>
          Total: {Math.round(totalKcal)} kcal
        </div>
      </div>

      <div className="plate-tester-top">
        <div className="plate-search">
          <input
            className="nutri-input"
            placeholder="Pesquisar alimento..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="plate-search-list">
            {filtered.slice(0, 8).map((f) => (
              <button
                key={f.id}
                className={`plate-search-item ${
                  selectedFoodId === f.id ? "active" : ""
                }`}
                onClick={() => pickFood(f)}
                type="button"
              >
                <div className="nutri-item-title">{f.name}</div>
                <div className="nutri-item-sub">Porção base: {f.portion_g}g</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="nutri-empty">Nenhum alimento encontrado.</div>
            )}
          </div>
        </div>

        <div className="plate-add">
          <div className="plate-selected">
            <div className="nutri-item-title">
              {selectedFood ? selectedFood.name : "Selecione um alimento"}
            </div>
            <div className="nutri-item-sub">
              {selectedFood
                ? `Base: ${selectedFood.portion_g}g`
                : "Use a pesquisa ao lado"}
            </div>
          </div>

          <label className="nutri-label">
            Porção no prato (g)
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
            {portionError && (
              <small className="nutri-error">{portionError}</small>
            )}
          </label>

          <button
            className="nutri-btn"
            onClick={addToPlate}
            disabled={!selectedFood}
            type="button"
          >
            Adicionar ao prato
          </button>
        </div>
      </div>

      <div className="plate-area">
        <div className="plate-circle">
          {plateItems.length === 0 ? (
            <div className="plate-empty">Adicione itens para montar um prato 😊</div>
          ) : (
            <div className="plate-chips">
              {plateItems.map((it) => (
                <div key={it.id} className="plate-chip" title={`${it.foodNameSnapshot}`}>
                  <strong>{it.foodNameSnapshot}</strong>
                  <span>{it.portionUsed_g}g</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="plate-list">
          <h4 style={{ marginTop: 0 }}>Itens do prato</h4>

          {plateItems.map((it) => {
            const kcal = it.portionUsed_g ? kcalFromItemSnapshot(it) : 0;

            return (
              <div key={it.id} className="plate-list-item">
                <div>
                  <div className="nutri-item-title">{it.foodNameSnapshot}</div>
                  <div className="nutri-item-sub">{Math.round(kcal)} kcal</div>
                </div>

                <div className="plate-actions">
                  <input
                    className="nutri-input plate-portion-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={it.portionUsed_g}
                    onChange={(e) => changePortion(it.id, e.target.value)}
                  />
                  <button
                    className="nutri-btn-danger"
                    onClick={() => removeItem(it.id)}
                    type="button"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}

          {plateItems.length === 0 && (
            <div className="nutri-empty">Nenhum item no prato.</div>
          )}
        </div>
      </div>
    </div>
  );
}
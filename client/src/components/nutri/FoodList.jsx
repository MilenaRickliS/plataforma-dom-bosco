import { useMemo, useState } from "react";
import { caloriesFromMacros } from "../../utils/nutrition";
import { deleteFood, updateFood } from "../../services/food";

export default function FoodList({ uid, foods, onPickFood }) {
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    portion_g: 100,
    carbs_g: 0,
    protein_g: 0,
    fat_g: 0,
  });

  // 1) filtra e 2) ordena A-Z (ignorando acentos)
  const filteredSorted = useMemo(() => {
    const list = Array.isArray(foods) ? [...foods] : [];
    const s = q.trim().toLowerCase();

    const filtered = !s
      ? list
      : list.filter((f) => (f.name || "").toLowerCase().includes(s));

    filtered.sort((a, b) =>
      (a.name || "").localeCompare((b.name || ""), "pt-BR", { sensitivity: "base" })
    );

    return filtered;
  }, [foods, q]);

  function startEdit(food) {
    setEditingId(food.id);
    setForm({
      name: food.name || "",
      portion_g: food.portion_g ?? 100,
      carbs_g: food.carbs_g ?? 0,
      protein_g: food.protein_g ?? 0,
      fat_g: food.fat_g ?? 0,
    });
  }

  async function saveEdit() {
    if (!uid || !editingId) return;

    await updateFood(uid, editingId, {
      name: form.name.trim(),
      portion_g: Number(form.portion_g),
      carbs_g: Number(form.carbs_g),
      protein_g: Number(form.protein_g),
      fat_g: Number(form.fat_g),
    });

    setEditingId(null);
  }

  async function remove(foodId) {
    if (!uid) return;
    if (!window.confirm("Excluir este alimento?")) return;
    await deleteFood(uid, foodId);
  }

  return (
    <div className="nutri-card">
      <div className="nutri-row-between">
        <h3>Meus alimentos ({filteredSorted.length})</h3>

        <input
          className="nutri-input nutri-input-sm"
          placeholder="Pesquisar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* área com altura limitada (≈ 5 itens) e scroll */}
      <div className="nutri-food-scroll">
        {filteredSorted.map((f) => {
          const kcal = caloriesFromMacros({
            carbs_g: Number(f.carbs_g || 0),
            protein_g: Number(f.protein_g || 0),
            fat_g: Number(f.fat_g || 0),
          });

          const isEditing = editingId === f.id;

          return (
            <div key={f.id} className="nutri-list-item">
              {!isEditing ? (
                <>
                  <div>
                    <div className="nutri-item-title">{f.name}</div>
                    <div className="nutri-item-sub">
                      Porção base: <strong>{f.portion_g}g</strong> • {kcal.toFixed(0)} kcal
                    </div>
                  </div>

                  <div className="nutri-actions">
                    <button className="nutri-btn-outline" onClick={() => startEdit(f)}>
                      Editar
                    </button>
                    <button className="nutri-btn-danger" onClick={() => remove(f.id)}>
                      Excluir
                    </button>

                    
                    {/* {onPickFood && (
                      <button className="nutri-btn-outline" onClick={() => onPickFood(f)}>
                        Selecionar
                      </button>
                    )} */}
                  </div>
                </>
              ) : (
                <div className="nutri-edit">
                  <div className="nutri-grid-2">
                    <label className="nutri-label">
                      Nome
                      <input
                        className="nutri-input"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </label>

                    <label className="nutri-label">
                      Porção (g)
                      <input
                        className="nutri-input"
                        type="number"
                        min="1"
                        value={form.portion_g}
                        onChange={(e) => setForm((p) => ({ ...p, portion_g: e.target.value }))}
                      />
                    </label>

                    <label className="nutri-label">
                      Carbo (g)
                      <input
                        className="nutri-input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.carbs_g}
                        onChange={(e) => setForm((p) => ({ ...p, carbs_g: e.target.value }))}
                      />
                    </label>

                    <label className="nutri-label">
                      Proteína (g)
                      <input
                        className="nutri-input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.protein_g}
                        onChange={(e) => setForm((p) => ({ ...p, protein_g: e.target.value }))}
                      />
                    </label>

                    <label className="nutri-label">
                      Gordura (g)
                      <input
                        className="nutri-input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.fat_g}
                        onChange={(e) => setForm((p) => ({ ...p, fat_g: e.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="nutri-actions">
                    <button className="nutri-btn" onClick={saveEdit}>
                      Salvar
                    </button>
                    <button className="nutri-btn-outline" onClick={() => setEditingId(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSorted.length === 0 && (
          <div className="nutri-empty">Nenhum alimento encontrado.</div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { caloriesFromMacros } from "../../utils/nutrition";
import { deleteFood, updateFood } from "../../services/food";

export default function FoodList({ uid, foods, onPickFood }) {
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    portion_g: "",
    carbs_g: "",
    protein_g: "",
    fat_g: "",
  });
  const [errors, setErrors] = useState({});
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredSorted = useMemo(() => {
    const list = Array.isArray(foods) ? [...foods] : [];
    const s = q.trim().toLowerCase();

    const filtered = !s
      ? list
      : list.filter((f) => (f.name || "").toLowerCase().includes(s));

    filtered.sort((a, b) =>
      (a.name || "").localeCompare((b.name || ""), "pt-BR", {
        sensitivity: "base",
      })
    );

    return filtered;
  }, [foods, q]);

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

  function handleNameChange(value) {
    const clean = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÇç\s-]/g, "");
    setForm((prev) => ({
      ...prev,
      name: capitalizeWords(clean),
    }));

    setErrors((prev) => ({
      ...prev,
      name: "",
    }));
  }

  function handleNumberChange(field, value) {
    value = value.replace(/[^0-9.,]/g, "");

    const parts = value.split(/[.,]/);
    if (parts.length > 2) {
      value = parts[0] + "." + parts[1];
    }

    const numbersOnly = value.replace(/[.,]/g, "").slice(0, 6);

    if (value.includes(".") || value.includes(",")) {
      const [int, dec] = value.split(/[.,]/);
      value = numbersOnly.slice(0, int.length) + "." + (dec || "");
    } else {
      value = numbersOnly;
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function validateForm() {
    const newErrors = {};
    const cleanName = form.name.trim();

    if (!cleanName) {
      newErrors.name = "O nome é obrigatório.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿÇç\s-]+$/.test(cleanName)) {
      newErrors.name = "O nome só pode conter letras, acentos, ç e espaços.";
    }

    if (!String(form.portion_g).trim()) {
      newErrors.portion_g = "A porção é obrigatória.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(form.portion_g))) {
      newErrors.portion_g = "A porção deve conter apenas números (máx. 6 dígitos).";
    }

    if (!String(form.carbs_g).trim()) {
      newErrors.carbs_g = "O carboidrato é obrigatório.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(form.carbs_g))) {
      newErrors.carbs_g = "O carboidrato deve conter apenas números (máx. 6 dígitos).";
    }

    if (!String(form.protein_g).trim()) {
      newErrors.protein_g = "A proteína é obrigatória.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(form.protein_g))) {
      newErrors.protein_g = "A proteína deve conter apenas números (máx. 6 dígitos).";
    }

    if (!String(form.fat_g).trim()) {
      newErrors.fat_g = "A gordura é obrigatória.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(form.fat_g))) {
      newErrors.fat_g = "A gordura deve conter apenas números (máx. 6 dígitos).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function startEdit(food) {
    setEditingId(food.id);
    setErrors({});
    setForm({
      name: food.name || "",
      portion_g: food.portion_g != null ? String(food.portion_g) : "",
      carbs_g: food.carbs_g != null ? String(food.carbs_g) : "",
      protein_g: food.protein_g != null ? String(food.protein_g) : "",
      fat_g: food.fat_g != null ? String(food.fat_g) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setErrors({});
    setForm({
      name: "",
      portion_g: "",
      carbs_g: "",
      protein_g: "",
      fat_g: "",
    });
  }

  function toNumber(value) {
    return Number(String(value).replace(",", "."));
  }

  async function saveEdit() {
    if (!uid || !editingId) return;
    if (!validateForm()) return;

    await updateFood(uid, editingId, {
      name: form.name.trim(),
      portion_g: toNumber(form.portion_g),
      carbs_g:  toNumber(form.carbs_g),
      protein_g:  toNumber(form.protein_g),
      fat_g:  toNumber(form.fat_g),
    });

    cancelEdit();
  }

  async function confirmDelete() {
    if (!uid || !foodToDelete?.id) return;

    setDeleting(true);
    try {
      await deleteFood(uid, foodToDelete.id);
      setFoodToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
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
                        Porção base: <strong>{f.portion_g}g</strong> •{" "}
                        {kcal.toFixed(0)} kcal
                      </div>
                    </div>

                    <div className="nutri-actions">
                      <button
                        type="button"
                        className="nutri-btn-outline"
                        onClick={() => startEdit(f)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="nutri-btn-danger"
                        onClick={() => setFoodToDelete(f)}
                      >
                        Excluir
                      </button>

                      {/* {onPickFood && (
                        <button
                          type="button"
                          className="nutri-btn-outline"
                          onClick={() => onPickFood(f)}
                        >
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
                          type="text"
                          value={form.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="Ex: Banana"
                        />
                        {errors.name && (
                          <small className="nutri-error">{errors.name}</small>
                        )}
                      </label>

                      <label className="nutri-label">
                        Porção (g)
                        <input
                          className="nutri-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.portion_g}
                          onChange={(e) =>
                            handleNumberChange("portion_g", e.target.value)
                          }
                          placeholder="Ex: 100"
                        />
                        {errors.portion_g && (
                          <small className="nutri-error">{errors.portion_g}</small>
                        )}
                      </label>

                      <label className="nutri-label">
                        Carboidrato (g)
                        <input
                          className="nutri-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.carbs_g}
                          onChange={(e) =>
                            handleNumberChange("carbs_g", e.target.value)
                          }
                          placeholder="Ex: 25"
                        />
                        {errors.carbs_g && (
                          <small className="nutri-error">{errors.carbs_g}</small>
                        )}
                      </label>

                      <label className="nutri-label">
                        Proteína (g)
                        <input
                          className="nutri-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.protein_g}
                          onChange={(e) =>
                            handleNumberChange("protein_g", e.target.value)
                          }
                          placeholder="Ex: 10"
                        />
                        {errors.protein_g && (
                          <small className="nutri-error">{errors.protein_g}</small>
                        )}
                      </label>

                      <label className="nutri-label">
                        Gordura (g)
                        <input
                          className="nutri-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.fat_g}
                          onChange={(e) =>
                            handleNumberChange("fat_g", e.target.value)
                          }
                          placeholder="Ex: 5"
                        />
                        {errors.fat_g && (
                          <small className="nutri-error">{errors.fat_g}</small>
                        )}
                      </label>
                    </div>

                    <div className="nutri-actions">
                      <button
                        type="button"
                        className="nutri-btn"
                        onClick={saveEdit}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        className="nutri-btn-outline"
                        onClick={cancelEdit}
                      >
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

      {foodToDelete && (
        <div className="nutri-modal-backdrop" onClick={() => setFoodToDelete(null)}>
          <div
            className="nutri-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nutri-modal-icon">🗑️</div>

            <h3 className="nutri-modal-title">Excluir alimento?</h3>

            <p className="nutri-modal-text">
              Tem certeza que deseja excluir{" "}
              <strong>{foodToDelete.name}</strong>?
              <br />
              Essa ação não poderá ser desfeita.
            </p>

            <div className="nutri-modal-actions">
              <button
                type="button"
                className="nutri-btn-outline"
                onClick={() => setFoodToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="nutri-btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
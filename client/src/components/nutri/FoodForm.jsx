import { useMemo, useState } from "react";
import { addFood } from "../../services/food";
import { caloriesFromMacros } from "../../utils/nutrition";

export default function FoodForm({ uid }) {
  const [name, setName] = useState("");
  const [portion_g, setPortion] = useState(100);
  const [carbs_g, setCarbs] = useState(0);
  const [protein_g, setProtein] = useState(0);
  const [fat_g, setFat] = useState(0);
  const [saving, setSaving] = useState(false);

  const kcal = useMemo(() => caloriesFromMacros({
    carbs_g: Number(carbs_g),
    protein_g: Number(protein_g),
    fat_g: Number(fat_g),
  }), [carbs_g, protein_g, fat_g]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uid) return;
    if (!name.trim()) return;

    setSaving(true);
    try {
      await addFood(uid, {
        name: name.trim(),
        portion_g: Number(portion_g),
        carbs_g: Number(carbs_g),
        protein_g: Number(protein_g),
        fat_g: Number(fat_g),
      });

      setName("");
      setPortion(100);
      setCarbs(0);
      setProtein(0);
      setFat(0);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="nutri-card" onSubmit={handleSubmit}>
      <h3>Cadastrar alimento</h3>

      <label className="nutri-label">
        Nome
        <input className="nutri-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Banana" />
      </label>

      <div className="nutri-grid-2">
        <label className="nutri-label">
          Porção (g)
          <input className="nutri-input" type="number" min="1" value={portion_g} onChange={(e) => setPortion(e.target.value)} />
        </label>

        <label className="nutri-label">
          Carbo (g)
          <input className="nutri-input" type="number" min="0" step="0.1" value={carbs_g} onChange={(e) => setCarbs(e.target.value)} />
        </label>

        <label className="nutri-label">
          Proteína (g)
          <input className="nutri-input" type="number" min="0" step="0.1" value={protein_g} onChange={(e) => setProtein(e.target.value)} />
        </label>

        <label className="nutri-label">
          Gordura (g)
          <input className="nutri-input" type="number" min="0" step="0.1" value={fat_g} onChange={(e) => setFat(e.target.value)} />
        </label>
      </div>

      <div className="nutri-kcal">
        <strong>{kcal.toFixed(0)} kcal</strong>
        <span>para a porção cadastrada</span>
      </div>

      <button className="nutri-btn" disabled={saving}>
        {saving ? "Salvando..." : "Salvar alimento"}
      </button>
    </form>
  );
}

import { useMemo, useState } from "react";
import { addFood } from "../../services/food";
import { caloriesFromMacros } from "../../utils/nutrition";

export default function FoodForm({ uid }) {
  const [name, setName] = useState("");
  const [portion_g, setPortion] = useState("");
  const [carbs_g, setCarbs] = useState("");
  const [protein_g, setProtein] = useState("");
  const [fat_g, setFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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

  function handleNameChange(e) {
    let value = e.target.value;

   
    value = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÇç\s-]/g, "");

    setName(capitalizeWords(value));

    setErrors((prev) => ({
      ...prev,
      name: "",
    }));
  }

  function handleNumberChange(setter, field) {
    return (e) => {
      let value = e.target.value;

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

      setter(value);

      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    };
  }

  function validateForm() {
    const newErrors = {};
    const cleanName = name.trim();

    if (!cleanName) {
      newErrors.name = "O nome é obrigatório.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿÇç\s-]+$/.test(cleanName)) {
      newErrors.name = "O nome só pode conter letras, acentos, ç e espaços.";
    }

    if (!String(portion_g).trim()) {
      newErrors.portion_g = "A porção é obrigatória.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(portion_g))) {
      newErrors.portion_g = "A porção deve conter apenas números (máx. 6 dígitos).";
    }

    if (!String(carbs_g).trim()) {
      newErrors.carbs_g = "O carboidrato é obrigatório.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(carbs_g))) {
      newErrors.carbs_g = "O carboidrato deve conter apenas números (máx. 6 dígitos).";
    }

    if (!String(protein_g).trim()) {
      newErrors.protein_g = "A proteína é obrigatória.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(protein_g))) {
      newErrors.protein_g = "A proteína deve conter apenas números (máx. 6 dígitos).";
    }

    if (!String(fat_g).trim()) {
      newErrors.fat_g = "A gordura é obrigatória.";
    } else if (!/^\d{1,6}([.,]\d+)?$/.test(String(fat_g))) {
      newErrors.fat_g = "A gordura deve conter apenas números (máx. 6 dígitos).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  function toNumber(value) {
    return Number(String(value).replace(",", "."));
  }

  const kcal = useMemo(() => caloriesFromMacros({
    carbs_g: Number(carbs_g || 0),
    protein_g: Number(protein_g || 0),
    fat_g: Number(fat_g || 0),
  }), [carbs_g, protein_g, fat_g]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uid) return;

    if (!validateForm()) return;

    setSaving(true);
    try {
      await addFood(uid, {
        name: name.trim(),
        portion_g: toNumber(portion_g),
        carbs_g: toNumber(carbs_g),
        protein_g: toNumber(protein_g),
        fat_g: toNumber(fat_g),
      });

      setName("");
      setPortion("");
      setCarbs("");
      setProtein("");
      setFat("");
      setErrors({});
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="nutri-card" onSubmit={handleSubmit}>
      <h3>Cadastrar alimento</h3>

      <label className="nutri-label">
        Nome
        <input
          className="nutri-input"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Ex: Banana"
        />
        {errors.name && <small className="nutri-error">{errors.name}</small>}
      </label>

      <div className="nutri-grid-2">
        <label className="nutri-label">
          Porção (g)
          <input
            className="nutri-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={portion_g}
            onChange={handleNumberChange(setPortion, "portion_g")}
            placeholder="Ex: 100"
          />
          {errors.portion_g && <small className="nutri-error">{errors.portion_g}</small>}
        </label>

        <label className="nutri-label">
          Carboidrato (g)
          <input
            className="nutri-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={carbs_g}
            onChange={handleNumberChange(setCarbs, "carbs_g")}
            placeholder="Ex: 25"
          />
          {errors.carbs_g && <small className="nutri-error">{errors.carbs_g}</small>}
        </label>

        <label className="nutri-label">
          Proteína (g)
          <input
            className="nutri-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={protein_g}
            onChange={handleNumberChange(setProtein, "protein_g")}
            placeholder="Ex: 10"
          />
          {errors.protein_g && <small className="nutri-error">{errors.protein_g}</small>}
        </label>

        <label className="nutri-label">
          Gordura (g)
          <input
            className="nutri-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={fat_g}
            onChange={handleNumberChange(setFat, "fat_g")}
            placeholder="Ex: 5"
          />
          {errors.fat_g && <small className="nutri-error">{errors.fat_g}</small>}
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
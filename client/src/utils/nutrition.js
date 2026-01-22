export function caloriesFromMacros({ carbs_g = 0, protein_g = 0, fat_g = 0 }) {
  return carbs_g * 4 + protein_g * 4 + fat_g * 9;
}

export function kcalFromItemSnapshot(item) {
  const base = Number(item.portionBase_g || 0);
  const used = Number(item.portionUsed_g || 0);

  if (!base || base <= 0) return 0;

  const factor = used / base;

  const carbs = Number(item.carbsBase_g || 0) * factor;
  const protein = Number(item.proteinBase_g || 0) * factor;
  const fat = Number(item.fatBase_g || 0) * factor;

  return caloriesFromMacros({
    carbs_g: carbs,
    protein_g: protein,
    fat_g: fat,
  });
}

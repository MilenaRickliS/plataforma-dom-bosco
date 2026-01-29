import logo from "../../../../assets/logo2.png";
import { IoArrowUndoSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import "./style.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart } from "chart.js/auto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../../contexts/auth"; 

import FoodForm from "../../../../components/nutri/FoodForm";
import FoodList from "../../../../components/nutri/FoodList";
import MealModal from "../../../../components/nutri/MealModal";
import PlateTester from "../../../../components/nutri/PlateTester";


import { getWeekDays } from "../../../../utils/week";
import { kcalFromItemSnapshot } from "../../../../utils/nutrition";

import { listenFoods } from "../../../../services/food";
import {
  addMeal, deleteMeal, renameMeal,
  listenMeals, listenMealItems,
  addMealItem, updateMealItemPortion, deleteMealItem
} from "../../../../services/meals";
import { addDays } from "date-fns";


import { IoIosArrowBack } from "react-icons/io";

export default function CardapioNutricional() {
  const { user } = useContext(AuthContext); 
  const uid = user?.uid;

  const [weekBaseDate, setWeekBaseDate] = useState(() => new Date());
  const week = useMemo(() => getWeekDays(weekBaseDate), [weekBaseDate]);

  const [foods, setFoods] = useState([]);

  const [mealsByDay, setMealsByDay] = useState({});     
  const [itemsByMeal, setItemsByMeal] = useState({});   

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState({ dateId: null, mealId: null });

  function prevWeek() {
    setWeekBaseDate((d) => addDays(d, -7));
  }

  function nextWeek() {
    setWeekBaseDate((d) => addDays(d, 7));
  }

  function goToday() {
    setWeekBaseDate(new Date());
  }

  useEffect(() => {
    if (!uid) return;
    const unsub = listenFoods(uid, setFoods);
    return () => unsub();
  }, [uid]);

  
  useEffect(() => {
    if (!uid) return;

    const unsubs = week.map(({ dateId }) =>
      listenMeals(uid, dateId, (meals) => {
        setMealsByDay((prev) => ({ ...prev, [dateId]: meals }));
      })
    );

    return () => unsubs.forEach((fn) => fn && fn());
  }, [uid, week]);

  
  useEffect(() => {
    if (!uid) return;

    const unsubs = [];

    week.forEach(({ dateId }) => {
      const meals = mealsByDay[dateId] || [];
      meals.forEach((m) => {
        const key = `${dateId}|${m.id}`;

       
        if (itemsByMeal[key] !== undefined) return;

        const unsubItems = listenMealItems(uid, dateId, m.id, (items) => {
          setItemsByMeal((prev) => ({ ...prev, [key]: items }));
        });

        unsubs.push(unsubItems);
      });
    });

    return () => unsubs.forEach((fn) => fn && fn());
   
  }, [uid, mealsByDay, week]);

  async function handleAddMeal(dateId) {
    const name = prompt("Nome da refeição (ex: Café da manhã, Almoço)");
    if (!name?.trim()) return;
    await addMeal(uid, dateId, name.trim());
  }

  async function handleRenameMeal(dateId, meal) {
    const name = prompt("Novo nome da refeição:", meal.name || "");
    if (!name?.trim()) return;
    await renameMeal(uid, dateId, meal.id, name.trim());
  }

  async function handleDeleteMeal(dateId, meal) {
    if (!window.confirm(`Excluir a refeição "${meal.name}"?`)) return;
    await deleteMeal(uid, dateId, meal.id);
  }

  function openAddFoodModal(dateId, mealId) {
    setModalTarget({ dateId, mealId });
    setModalOpen(true);
  }

  async function handleAddFoodToMeal(food, portionUsed_g) {
    const { dateId, mealId } = modalTarget;
    if (!dateId || !mealId) return;

    await addMealItem(uid, dateId, mealId, {
      foodId: food.id,
      foodNameSnapshot: food.name,
      portionBase_g: Number(food.portion_g),
      carbsBase_g: Number(food.carbs_g),
      proteinBase_g: Number(food.protein_g),
      fatBase_g: Number(food.fat_g),
      portionUsed_g: Number(portionUsed_g),
    });
  }

  function mealTotalKcal(dateId, mealId) {
    const key = `${dateId}|${mealId}`;
    const items = itemsByMeal[key] || [];
    return items.reduce((sum, it) => sum + kcalFromItemSnapshot(it), 0);
  }

  function dayTotalKcal(dateId) {
    const meals = mealsByDay[dateId] || [];
    return meals.reduce((sum, m) => sum + mealTotalKcal(dateId, m.id), 0);
  }

  async function handleChangeItemPortion(dateId, mealId, item) {
    const g = prompt("Nova porção (g) para este item:", String(item.portionUsed_g ?? ""));
    if (!g) return;
    const n = Number(g);
    if (!n || n <= 0) return;
    await updateMealItemPortion(uid, dateId, mealId, item.id, n);
  }

  async function handleDeleteItem(dateId, mealId, item) {
    if (!window.confirm(`Remover "${item.foodNameSnapshot}" desta refeição?`)) return;
    await deleteMealItem(uid, dateId, mealId, item.id);
  }

  async function exportWeekPdf() {
    try {
      
      const getItems = (dateId, mealId) => itemsByMeal[`${dateId}|${mealId}`] || [];
      const mealKcal = (dateId, mealId) => getItems(dateId, mealId).reduce((s, it) => s + kcalFromItemSnapshot(it), 0);
      const dayKcal = (dateId) => (mealsByDay[dateId] || []).reduce((s, m) => s + mealKcal(dateId, m.id), 0);

      
      const days = week.map(d => ({
        ...d,
        totalKcal: dayKcal(d.dateId),
        meals: (mealsByDay[d.dateId] || []).map(m => ({
          ...m,
          totalKcal: mealKcal(d.dateId, m.id),
          items: getItems(d.dateId, m.id),
        })),
      }));

      const totalWeek = days.reduce((s, d) => s + d.totalKcal, 0);
      const avgDay = days.length ? totalWeek / days.length : 0;
      const maxDay = days.reduce((best, d) => (!best || d.totalKcal > best.totalKcal ? d : best), null);

    
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: days.map(d => `${d.label} (${d.short})`),
          datasets: [{
            label: "kcal por dia",
            data: days.map(d => Math.round(d.totalKcal)),
          }],
        },
        options: {
          responsive: false,
          plugins: {
            legend: { display: true },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });

      
      await new Promise(r => setTimeout(r, 60));
      const chartImg = canvas.toDataURL("image/png", 1.0);

      
      const doc = new jsPDF("p", "pt", "a4");
      const pageW = doc.internal.pageSize.getWidth();

      
      doc.setFontSize(18);
      doc.text("Relatório Nutricional - Semana", 40, 50);

      const weekStart = week[0]?.dateObj ? format(week[0].dateObj, "dd/MM/yyyy", { locale: ptBR }) : "";
      const weekEnd = week[6]?.dateObj ? format(week[6].dateObj, "dd/MM/yyyy", { locale: ptBR }) : "";
      doc.setFontSize(11);
      doc.text(`Período: ${weekStart} a ${weekEnd}`, 40, 72);

      doc.setFontSize(12);
      doc.text(`Total da semana: ${Math.round(totalWeek)} kcal`, 40, 96);
      doc.text(`Média por dia: ${Math.round(avgDay)} kcal`, 40, 114);
      if (maxDay) doc.text(`Maior dia: ${maxDay.label} (${maxDay.short}) - ${Math.round(maxDay.totalKcal)} kcal`, 40, 132);

      doc.setFontSize(13);
      doc.text("Gráfico: kcal por dia", 40, 165);
      doc.addImage(chartImg, "PNG", 40, 180, pageW - 80, 160);

      autoTable(doc, {
        startY: 360,
        head: [["Dia", "Data", "Total (kcal)", "Refeições"]],
        body: days.map(d => [
          d.label,
          d.short,
          Math.round(d.totalKcal),
          String(d.meals.length),
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [45, 64, 142] },
        margin: { left: 40, right: 40 },
      });

     
      let y = doc.lastAutoTable.finalY + 20;

      for (const d of days) {
        
        if (y > 720) { doc.addPage(); y = 50; }

        doc.setFontSize(14);
        doc.text(`${d.label} (${d.short}) - ${Math.round(d.totalKcal)} kcal`, 40, y);
        y += 12;

        if (d.meals.length === 0) {
          doc.setFontSize(11);
          doc.text("Sem refeições.", 40, y + 16);
          y += 28;
          continue;
        }

        for (const m of d.meals) {
          if (y > 700) { doc.addPage(); y = 50; }

          doc.setFontSize(12);
          doc.text(`• ${m.name} - ${Math.round(m.totalKcal)} kcal`, 50, y + 18);
          y += 24;

          const rows = (m.items || []).map(it => [
            it.foodNameSnapshot,
            `${it.portionUsed_g}g`,
            `${Math.round(kcalFromItemSnapshot(it))} kcal`,
          ]);

          if (rows.length === 0) {
            doc.setFontSize(10);
            doc.text("  (sem itens)", 60, y + 10);
            y += 22;
            continue;
          }

          autoTable(doc, {
            startY: y,
            head: [["Alimento", "Porção", "kcal"]],
            body: rows,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [220, 220, 220], textColor: 20 },
            margin: { left: 50, right: 40 },
            theme: "grid",
          });

          y = doc.lastAutoTable.finalY + 10;
        }

        y += 8;
      }

     
      const safePeriod = `${weekStart.replaceAll("/", "-")}_a_${weekEnd.replaceAll("/", "-")}`;
      doc.save(`relatorio_semana_${safePeriod}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF. Veja o console.");
    }
  }


  if (!uid) {
    return (
      <div style={{ padding: 20 }}>
        <div className="inicio-menug">
            <Link to="/inicio-refeicao2" className="voltar-adm"><IoIosArrowBack />Voltar</Link>
            <div className="titulo-menug">
                <img src={logo} alt="Logo" />
                <p>Analisador Nutricional</p>
            </div>
            
        </div>

        <div className="nutri-card">Faça login para usar o analisador.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <br />
      <div className="relatorios-header">
        <Link to="/inicio-refeicao2" className="voltar-btn">
          <IoIosArrowBack /> Voltar
        </Link>

        <div className="titulo-relatorios">
          <img src={logo} alt="Logo" />
          <h1>Analisador Nutricional</h1>
        </div>
      </div>

      <div className="nutri-layout">
        <div className="nutri-left">
          <FoodForm uid={uid} />
          <FoodList uid={uid} foods={foods} onPickFood={(food) => {
            
            console.log("selecionado", food);
          }} />

          <PlateTester foods={foods} />
        </div>

        <div className="nutri-right">
          <div className="nutri-week">
            {week.map((d) => {
              const meals = mealsByDay[d.dateId] || [];
              const totalDay = dayTotalKcal(d.dateId);

              return (
                <div key={d.dateId} className="nutri-day">
                  <div className="nutri-day-header">
                    <div>
                      <div className="nutri-day-title">{d.label}</div>
                      <div className="nutri-day-sub">{d.short}</div>
                    </div>

                    <button className="nutri-btn" onClick={() => handleAddMeal(d.dateId)}>
                      + Refeição
                    </button>
                  </div>

                  <div className="nutri-meals">
                    {meals.map((meal) => {
                      const key = `${d.dateId}|${meal.id}`;
                      const items = itemsByMeal[key] || [];
                      const totalMeal = mealTotalKcal(d.dateId, meal.id);

                      return (
                        <div key={meal.id} className="nutri-meal">
                          <div className="nutri-row-between">
                            <div className="nutri-meal-title">{meal.name}</div>
                            <div className="nutri-actions">
                              <button className="nutri-btn-outline" onClick={() => openAddFoodModal(d.dateId, meal.id)}>
                                + alimento
                              </button>
                              <button className="nutri-btn-outline" onClick={() => handleRenameMeal(d.dateId, meal)}>
                                Renomear
                              </button>
                              <button className="nutri-btn-danger" onClick={() => handleDeleteMeal(d.dateId, meal)}>
                                Excluir
                              </button>
                            </div>
                          </div>

                          <div className="nutri-items">
                            {items.map((it) => {
                              const kcal = kcalFromItemSnapshot(it);

                              return (
                                <div key={it.id} className="nutri-item">
                                  <div>
                                    <div className="nutri-item-title">{it.foodNameSnapshot}</div>
                                    <div className="nutri-item-sub">
                                      Porção: <strong>{it.portionUsed_g}g</strong>
                                    </div>
                                  </div>

                                  <div className="nutri-item-right">
                                    <strong>{kcal.toFixed(0)} kcal</strong>
                                    <div className="nutri-item-actions">
                                      <button className="nutri-btn-outline" onClick={() => handleChangeItemPortion(d.dateId, meal.id, it)}>
                                        Alterar porção
                                      </button>
                                      <button className="nutri-btn-danger" onClick={() => handleDeleteItem(d.dateId, meal.id, it)}>
                                        Remover
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {items.length === 0 && (
                              <div className="nutri-empty">Nenhum alimento nesta refeição.</div>
                            )}
                          </div>

                          <div className="nutri-total">
                            <span>Total da refeição</span>
                            <strong>{totalMeal.toFixed(0)} kcal</strong>
                          </div>
                        </div>
                      );
                    })}

                    {meals.length === 0 && (
                      <div className="nutri-empty">Crie uma refeição para este dia.</div>
                    )}
                  </div>

                  <div className="nutri-total-day">
                    <span>Total do dia</span>
                    <strong>{totalDay.toFixed(0)} kcal</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="nutri-week-nav">
            <button className="nutri-nav-btn" onClick={prevWeek} aria-label="Semana anterior">
              ◀ Semana anterior
            </button>

            <button className="nutri-nav-btn-outline" onClick={goToday}>
              Hoje
            </button>

            <button className="nutri-nav-btn-export" onClick={exportWeekPdf}>
              Exportar PDF
            </button>


            <button className="nutri-nav-btn" onClick={nextWeek} aria-label="Próxima semana">
              Próxima semana ▶
            </button>
          </div>

        </div>
      </div>

      <MealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        foods={foods}
        onAdd={handleAddFoodToMeal}
      />

      
    </div>
  );
}

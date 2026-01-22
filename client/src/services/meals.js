import { db } from "./firebaseConnection";
import {
  collection, doc, addDoc, serverTimestamp,
  onSnapshot, query, orderBy, setDoc,
  updateDoc, deleteDoc
} from "firebase/firestore";

const dayDoc = (uid, dateId) => doc(db, "users", uid, "days", dateId);
const mealsCol = (uid, dateId) => collection(db, "users", uid, "days", dateId, "meals");
const itemsCol = (uid, dateId, mealId) => collection(db, "users", uid, "days", dateId, "meals", mealId, "items");

export async function ensureDay(uid, dateId) {
  return setDoc(dayDoc(uid, dateId), { date: dateId, updatedAt: serverTimestamp() }, { merge: true });
}

export function listenMeals(uid, dateId, cb) {
  const q = query(mealsCol(uid, dateId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function listenMealItems(uid, dateId, mealId, cb) {
  const q = query(itemsCol(uid, dateId, mealId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function addMeal(uid, dateId, name) {
  await ensureDay(uid, dateId);
  return addDoc(mealsCol(uid, dateId), { name, createdAt: serverTimestamp() });
}

export async function renameMeal(uid, dateId, mealId, name) {
  return updateDoc(doc(db, "users", uid, "days", dateId, "meals", mealId), { name });
}

export async function deleteMeal(uid, dateId, mealId) {
  return deleteDoc(doc(db, "users", uid, "days", dateId, "meals", mealId));
}

export async function addMealItem(uid, dateId, mealId, payload) {
  await ensureDay(uid, dateId);
  return addDoc(itemsCol(uid, dateId, mealId), { ...payload, createdAt: serverTimestamp() });
}

export async function updateMealItemPortion(uid, dateId, mealId, itemId, portionUsed_g) {
  return updateDoc(doc(db, "users", uid, "days", dateId, "meals", mealId, "items", itemId), {
    portionUsed_g: Number(portionUsed_g),
  });
}

export async function deleteMealItem(uid, dateId, mealId, itemId) {
  return deleteDoc(doc(db, "users", uid, "days", dateId, "meals", mealId, "items", itemId));
}

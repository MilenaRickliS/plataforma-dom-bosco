import { db } from "./firebaseConnection";
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, updateDoc, deleteDoc
} from "firebase/firestore";

export function foodsRef(uid) {
  return collection(db, "users", uid, "foods");
}

export function listenFoods(uid, cb) {
  const q = query(foodsRef(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(items);
  });
}

export async function addFood(uid, data) {
  return addDoc(foodsRef(uid), { ...data, createdAt: serverTimestamp() });
}

export async function updateFood(uid, foodId, data) {
  return updateDoc(doc(db, "users", uid, "foods", foodId), data);
}

export async function deleteFood(uid, foodId) {
  return deleteDoc(doc(db, "users", uid, "foods", foodId));
}

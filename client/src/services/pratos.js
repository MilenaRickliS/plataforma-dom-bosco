import { db } from "./firebaseConnection";
import { doc, setDoc, getDoc } from "firebase/firestore";


export async function getPrato(nome) {
  const ref = doc(db, "pratos_nutricionais", nome.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}


export async function salvarPrato(nome, dados) {
  const ref = doc(db, "pratos_nutricionais", nome.toLowerCase());
  await setDoc(ref, {
    nome,
    calorias: Number(dados.calorias) || 0,
    proteina: Number(dados.proteina) || 0,
    carboidratos: Number(dados.carboidratos) || 0,
    gordura: Number(dados.gordura) || 0,
    dataAtualizacao: new Date().toISOString(),
  });
  console.log(`✅ Prato "${nome}" salvo/atualizado no Firestore`);
}

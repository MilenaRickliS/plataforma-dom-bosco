import { createContext, useState, useEffect } from "react";
import { auth } from "../services/firebaseConnection";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { db } from "../services/firebaseConnection";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  adicionarPontos,
  removerPontos,
  mostrarToastPontosAdicionar,
  mostrarToastPontosRemover,
  regrasPontuacao,
} from "../services/gamificacao";

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API =
    import.meta.env.VITE_API_URL ||
    "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          const userData = {
            uid: firebaseUser.uid,
            email: data.email,
            role: data.role,
            displayName: data.nome || firebaseUser.displayName || data.email,
            photoURL: data.foto || firebaseUser.photoURL || null,
          };

          setUser(userData);

          
          await verificarLoginDiario(userData.uid);
        } catch (err) {
          console.error("Erro no onAuthStateChanged:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

 
  async function verificarLoginDiario(uid) {
    const ref = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    const hoje = new Date();
    const hojeStr = hoje.toISOString().split("T")[0];
    const ultimaData = data.ultimoLogin || null;

    if (ultimaData !== hojeStr) {
      if (ultimaData) {
        const diffDias = Math.floor(
          (hoje - new Date(ultimaData)) / (1000 * 60 * 60 * 24)
        );
        if (diffDias >= 3) {
          await removerPontos(uid, Math.abs(regrasPontuacao.diasSemLogar));
          mostrarToastPontosRemover(
            regrasPontuacao.diasSemLogar,
            `Ficou ${diffDias} dias sem logar 😞`
          );
        }
      }

      await adicionarPontos(uid, regrasPontuacao.loginDiario);
      mostrarToastPontosAdicionar(
        regrasPontuacao.loginDiario,
        "Login diário realizado ✅"
      );

      await setDoc(ref, { ultimoLogin: hojeStr }, { merge: true });
    }
  }

 
  async function signInEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const userData = {
        uid: firebaseUser.uid,
        email: data.email,
        role: data.role,
        displayName: data.nome || firebaseUser.displayName || data.email,
        photoURL: data.foto || firebaseUser.photoURL || null,
      };

      setUser(userData);
      await verificarLoginDiario(userData.uid);
    } catch (err) {
      alert("Erro ao entrar: " + err.message);
      console.error(err);
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (err) {
      alert("Erro ao enviar e-mail: " + err.message);
      console.error(err);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  function getRota() {
    return user?.role || null;
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signInEmail,
        resetPassword,
        logout,
        getRota,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

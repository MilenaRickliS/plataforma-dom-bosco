import { createContext, useState, useEffect } from "react";
import { auth, provider } from "../services/firebaseConnection";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

//emails permitidos
  const rotas = {
    aluno: "aluno@gmail.com",
    professor: "professor@gmail.com",
    admin: "admin@gmail.com"
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signInGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (
        email !== rotas.aluno &&
        email !== rotas.professor &&
        email !== rotas.admin
      ) {
        await signOut(auth);
        alert("Email não autorizado!");
        return;
      }

      setUser(result.user);
    } catch (error) {
      console.error("Erro ao logar: ", error);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  function getRota() {
    if (!user) return null;
    if (user.email === rotas.aluno) return "aluno";
    if (user.email === rotas.professor) return "professor";
    if (user.email === rotas.admin) return "admin";
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signInGoogle,
        logout,
        getRota
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

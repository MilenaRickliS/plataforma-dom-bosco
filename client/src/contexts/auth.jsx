import { createContext, useState, useEffect } from "react";
import { auth, provider } from "../services/firebaseConnection";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          
          setUser({ email: data.email, role: data.role, displayName: firebaseUser.displayName });
        } catch (err) {
          console.error(err);
          setUser(null);
        }
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
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser({ email: data.email, role: data.role, displayName: firebaseUser.displayName });
    } catch (err) {
      alert(err.message);
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
        signInGoogle,
        logout,
        getRota
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

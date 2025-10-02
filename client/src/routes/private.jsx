import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth";

export default function Private({ children, rota }) {
  const { signed, loading, getRota } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  if (rota && getRota() !== rota) {
    return <Navigate to="/" />;
  }

  return children;
}

import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { signInGoogle, signed, getRota } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (signed) {
      const rota = getRota();
      if (rota === "aluno") navigate("/inicio-aluno");
      if (rota === "professor") navigate("/inicio-professor");
      if (rota === "admin") navigate("/menu-gestao");
    }
  }, [signed, getRota, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>
      <button onClick={signInGoogle}>
        Entrar com Google
      </button>
    </div>
  );
}

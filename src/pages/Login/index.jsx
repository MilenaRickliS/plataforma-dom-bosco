import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; 
import logo from '../../assets/logo2.png';
import './style.css';

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
    <div className="fundo-login">
      <div className="titulo-login">
        <img src={logo} alt="Logo" />
        <p>Instituto Assistencial Dom Bosco - Portal do Aluno</p>
      </div>
      <div className="bemvindo-login">
        <h1>Bem-vindo!</h1>
        <button className="google-btn" onClick={signInGoogle}>
          <FcGoogle className="google-icon" /> Entrar com Google
        </button>
      </div>
    </div>
  );
}

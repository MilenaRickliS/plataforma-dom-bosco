import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/auth";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; 
import { IoIosArrowBack } from "react-icons/io";
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
      if (rota === "admin") navigate("/inicio-adm");
    }
  }, [signed, getRota, navigate]);

  return (
    <div className="fundo-login">
      <div className="voltar-home-wrapper">
        <Link to="/" className="voltar-home"><IoIosArrowBack /> Voltar para Home</Link>
      </div>
      <div className="titulo-login">
        <img src={logo} alt="Logo" />
        <p>Instituto Assistencial Dom Bosco - Portal do Aluno</p>
      </div>
      <div className="bemvindo-login">
        <h1>Bem-vindo!</h1>
        <button className="google-btn" onClick={signInGoogle}>
          <FcGoogle className="google-icon" /> Entrar com Google
        </button>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => signInGoogle("aluno")}>Simular Aluno</button>
          <button onClick={() => signInGoogle("professor")}>Simular Professor</button>
          <button onClick={() => signInGoogle("admin")}>Simular Admin</button>
        </div>
      </div>
    </div>
  );
}

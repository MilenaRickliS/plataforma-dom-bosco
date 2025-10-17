import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";
import { useNavigate, Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5"; 
import logo from "../../assets/logo2.png";
import "./style.css";

export default function Login() {
  const { signInEmail, resetPassword, signed, getRota } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (signed) {
      const rota = getRota();
      if (rota === "aluno") navigate("/inicio-aluno");
      if (rota === "professor") navigate("/inicio-professor");
      if (rota === "admin") navigate("/inicio-adm");
    }
  }, [signed, getRota, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    await signInEmail(email, senha);
  }

  async function handleResetPassword() {
    if (!email) {
      alert("Digite seu e-mail para redefinir a senha.");
      return;
    }
    await resetPassword(email);
  }

  return (
    <div className="fundo-login">
      <div className="voltar-home-wrapper">
        <Link to="/" className="voltar-home">
          <IoIosArrowBack /> Voltar para Home
        </Link>
      </div>

      <div className="titulo-login">
        <img src={logo} alt="Logo" />
        <p>Instituto Assistencial Dom Bosco - Portal do Aluno</p>
      </div>

      <div className="bemvindo-login">
        <h1>Bem-vindo!</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

         
          <div className="senha-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="mostrar-senha-btn"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>

        <button onClick={handleResetPassword} className="esqueci-senha-btn">
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}

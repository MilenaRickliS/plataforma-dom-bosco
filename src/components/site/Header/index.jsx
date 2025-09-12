import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import './style.css';
import logo from '../../../assets/logo.png';

export default function Header() {
  const { signed, logout} = useContext(AuthContext);

  return (
    <nav>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
        </Link>
      </div>

      
      <div style={styles.menu}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
      </div>

      
      <div>
         {!signed ? (
          <Link to="/login" style={styles.button}>
            Login
          </Link>
        ) : (
          <button onClick={logout} style={styles.button}>
            Sair
          </button>
        )}
      </div>
    </nav>
  );
}



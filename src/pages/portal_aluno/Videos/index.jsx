import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import VideoEx from "../../../assets/site/celebracao.webp";
import { Link } from "react-router-dom";
import './style.css';

export default function Videos() {
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main>
            <MenuTopoAluno/>
          <Link to="/video-detalhes" className="container-video">
            <img src={VideoEx} alt="img-video"/>
            <p>Título</p>
          </Link>
        </main>
      </div>
    </div>
  );
}

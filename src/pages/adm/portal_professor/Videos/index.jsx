import MenuLateralProfessor from "../../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../../components/portais/MenuTopoProfessor";
import VideoEx from "../../../../assets/site/celebracao.webp";
import { Link } from "react-router-dom";
import './style.css';

export default function Videos() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
          <Link to="/detalhes-videos-professor" className="container-video">
            <img src={VideoEx} alt="img-video"/>
            <p>Título</p>
          </Link>
        </main>
      </div>
    </div>
  );
}

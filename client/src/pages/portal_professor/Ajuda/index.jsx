import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";

export default function Ajuda() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
          
        </main>
      </div>
    </div>
  );
}

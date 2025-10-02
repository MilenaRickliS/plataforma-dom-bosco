import MenuLateralProfessor from "../../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../../components/portais/MenuTopoProfessor";


export default function DetalhesVideo() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
          <h1>Vídeos Detalhes</h1>
        </main>
      </div>
    </div>
  );
}

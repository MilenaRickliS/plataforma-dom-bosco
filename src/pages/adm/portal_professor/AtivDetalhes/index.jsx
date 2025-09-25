import MenuLateralProfessor from "../../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../../components/portais/MenuTopoProfessor";

export default function AtivDetalhes() {
  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main>
            <MenuTopoProfessor/>
          <h1>Conteúdo do Professor</h1>
        </main>
      </div>
    </div>
  );
}

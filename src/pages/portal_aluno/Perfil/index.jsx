import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";

export default function Perfil() {
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main>
            <MenuTopoAluno/>
          
        </main>
      </div>
    </div>
  );
}

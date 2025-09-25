import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";

export default function Avisos() {
  return (
    <div className="layout">
      <MenuLateralAluno />  
      <div className="page2">
        <main>
            <MenuTopoAluno/>
          <h1>Conteúdo do Aluno</h1>
        </main>
      </div>
    </div>
  );
}

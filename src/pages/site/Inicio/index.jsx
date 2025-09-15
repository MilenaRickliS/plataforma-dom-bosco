import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";


export default function Inicio() {
  return (
    <div className="page">
      <Header />
      <main>
        <h1>Bem-vindo ao Sistema</h1>
        <p>Esta é a página inicial</p>
      </main>
      <Footer />
    </div>
  );
}

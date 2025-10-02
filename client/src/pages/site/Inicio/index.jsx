import Header from "../../../components/site/Header";
import Footer from "../../../components/site/Footer";
import "./style.css";

// adicionar fonte de acordo com o projeto - bruno

export default function Inicio() {
  return (
    <div className="page">
      <Header />
      <main className="inicio-main">
        <section className="inicio-hero">
          <div className="inicio-image-wrapper">
            <img
              className="inicio-image"
              src="/src/assets/site/transferir__1_-removebg-preview.png"
              alt="Jovem participando"
            />
          </div>

          <h1 className="inicio-title">
            <span className="line">Aqui o Jovem <span className="sonha">sonha</span>,</span>
            <span className="line">
              <span className="aprende">aprende</span>
              <span> e </span>
              <span className="conquista">conquista</span>!
            </span>
            <span className="line cta">Bora fazer parte?</span>
          </h1>
        </section>
      </main>
      <Footer />
    </div>
  );
}

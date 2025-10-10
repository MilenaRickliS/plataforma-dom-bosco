import Slider from "react-slick";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function PrevArrow(props) {
  const { className, onClick } = props;
  return (
    <FaCircleArrowLeft
      className={`${className} arrow-equipe arrow-equipe-left`}
      onClick={onClick}
    />
  );
}

function NextArrow(props) {
  const { className, onClick } = props;
  return (
    <FaCircleArrowRight
      className={`${className} arrow-equipe arrow-equipe-right`}
      onClick={onClick}
    />
  );
}

export default function CorpoDocenteSlider({ docentes }) {
  if (!docentes?.length) {
    return (
      <section className="equipe-section">
        <h2>Corpo Docente</h2>
        <p>Nenhum docente cadastrado para este curso.</p>
      </section>
    );
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="equipe-section">
      <h2>Corpo Docente</h2>
      <Slider {...settings}>
        {docentes.map((d) => (
          <div className="card-equipe" key={d.id}>
            <img src={d.foto} alt={d.nome} />
            <p className="nome">{d.nome}</p>
            <p className="cargo">{d.cargo}</p>
          </div>
        ))}
      </Slider>
    </section>
  );
}

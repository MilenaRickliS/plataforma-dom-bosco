import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/auth";
import { useParams, Link } from "react-router-dom";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import "./style.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { adicionarPontos, removerPontos, mostrarToastPontosAdicionar, mostrarToastPontosRemover, regrasPontuacao } from "../../../services/gamificacao";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function DetalhesVideo() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
 


  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await axios.get(`${API}/api/videos/${id}`);
        setVideo(data);
      } catch (error) {
        console.error("Erro ao buscar vídeo:", error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!video) return <p>Vídeo não encontrado.</p>;

  const isYouTube = video?.url?.includes("youtube.com") || video?.url?.includes("youtu.be");
  console.log("Vídeo carregado:", video);
  console.log("Tipo:", `"${video?.tipo}"`);
  
  const isAutor = user?.email && video?.usuario && user.email === video.usuario;


  const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
};


  return (
    <div className="layout">
      <ToastContainer position="bottom-right" theme="colored" />

      <MenuLateralProfessor />  
      <div className="page2">
        <main className="detalhes-video">
          <MenuTopoProfessor/>

          <h2 className="titulo-video-detalhes">{video.titulo}</h2><br />
          <span className="titulo-categoria">{video.categoria}</span>
          <br /> <br />

          <div className="player-container">
            
            {isAutor && (
              <div className="acoes-video">
                <Link to={`/professor/editar-video/${video.id}`} className="btn-editar">
                  <MdModeEditOutline /> Editar
                </Link>
                <button
                  className="btn-excluir"
                  onClick={async () => {
                    if (window.confirm("Tem certeza que deseja excluir este vídeo?")) {
                      try {
                        await axios.delete(`${API}/api/videos?id=${video.id}`);
                        toast.success("Vídeo excluído com sucesso!");
                        await removerPontos(user.uid, Math.abs(regrasPontuacao.postarVideo));
                        mostrarToastPontosRemover(regrasPontuacao.postarVideo, "Vídeo removido 😢 -10 pontos");

                        navigate("/professor/videos");

                      } catch {
                        toast.error("Erro ao excluir vídeo.");
                      }
                    }
                  }}
                >
                  <FaRegTrashAlt /> Excluir
                </button>
              </div>
            )}


          {video?.tipo === "upload" ? (
            
            <video
              src={video?.url}
              controls
              width="100%"
              height="400"
              style={{ borderRadius: "12px", backgroundColor: "#000" }}
              onTimeUpdate={(e) => {
                const vid = e.target;
                const progresso = (vid.currentTime / vid.duration) * 100;
                vid.dataset.progresso = progresso;
              }}
              onEnded={async (e) => {
                const vid = e.target;
                const progresso = parseFloat(vid.dataset.progresso || 0);

                if (progresso >= 80) {
                  const chaveAssistido = `${user.uid}-video-${video.id}`;
                  if (!localStorage.getItem(chaveAssistido)) {
                    await adicionarPontos(user.uid, regrasPontuacao.assistirVideo);
                    mostrarToastPontosAdicionar(
                      regrasPontuacao.assistirVideo,
                      "Parabéns! Você assistiu 100% do vídeo 🎥"
                    );
                    localStorage.setItem(chaveAssistido, "assistido");
                  }
                }
              }}
              onPause={async (e) => {
                const vid = e.target;
                const progresso = parseFloat(vid.dataset.progresso || 0);

                if (progresso < 80 && !vid.dataset.penalizado) {
                  vid.dataset.penalizado = true;
                  await removerPontos(user.uid, Math.abs(regrasPontuacao.sairVideo));
                  mostrarToastPontosRemover(
                    regrasPontuacao.sairVideo,
                    `Saiu antes de 100% (${Math.round(progresso)}%) 😞`
                  );
                }
              }}
            >

              Seu navegador não suporta vídeos.
            </video>
          ) : isYouTube ? (
            <iframe
              src={getEmbedUrl(video.url)}
              title={video?.titulo}
              allowFullScreen
              width="100%"
              height="400"
              style={{ borderRadius: "12px" }}
            ></iframe>

          ) : (
            <a
              href={video?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-externo"
            >
              Acessar vídeo externo
            </a>
            
          )}
        </div>
        <div className="descricao-video">
            <p className="titulo-descricao">Descrição</p>
            <p>{video.descricao}</p>
        </div>
          

          
        </main>
      </div>
    </div>
  );
}

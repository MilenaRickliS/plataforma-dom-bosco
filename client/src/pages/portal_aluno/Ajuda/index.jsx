import { useState, useEffect, useRef, useContext } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./style.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../../contexts/auth";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";

export default function Ajuda() {
  const { user } = useContext(AuthContext);
  const [ativo, setAtivo] = useState(null);
  const jaPremiou = useRef(false); 

  const perguntas = [
    {
      pergunta: "Onde encontro os vídeos dos professores?",
      resposta:
        "Vá em Vídeos Professores. Ao abrir um vídeo, você verá detalhes e poderá assistir na página do vídeo.",
    },
    {
      pergunta: "Esqueci minha senha. O que faço?",
      resposta:
        "Na tela de login, clique em “Esqueci minha senha” e siga o passo a passo. Se não receber e-mail, contate o suporte.",
    },
    {
      pergunta: "Onde vejo os meus pontos adquiridos com os flash cards?",
      resposta: "Na Dashboard, na área de estudo clique em 'Acessar' e você terá acesso a página dos flashcards, seus pontos estão no topo da página.",
    },
    {
      pergunta: "O que fazer se um material não abrir ou aparecer como indisponível?",
      resposta:
        "Tente atualizar a página ou limpar o cache. Se o problema persistir, entre em contato com o suporte.",
    },
    {
      pergunta: "Como visualizar minha agenda?",
      resposta: "No menu principal, vá em 'Agenda' para ver todas as atividades e prazos importantes.",
    },
    {
      pergunta: "Como posso acessar o Sigar?",
      resposta: "Acesse a 'Agenda' e no topo da página clique em 'Acesse o Sigar' ",
    },
  ];


  const togglePergunta = (index) => {
    setAtivo(ativo === index ? null : index);
  };

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />
          <h2 className="h2-ajuda">Precisa de Ajuda?</h2>
          <p className="subtitulo-ajuda">Perguntas Frequentes</p>

          <div className="perguntas-portal">
            {perguntas.map((item, index) => (
              <div
                key={index}
                className={`card-pergunta ${ativo === index ? "ativo" : ""}`}
                onClick={() => togglePergunta(index)}
              >
                <p className="texto-card">
                  {ativo === index ? item.resposta : item.pergunta}
                </p>
              </div>
            ))}
          </div>

          <p className="subtitulo-ajuda">Suporte</p>
          <div className="contato-suporte">
            <div>
              <p>
                <FaPhoneAlt /> (55) 99900-0000
              </p>
            </div>
            <div>
              <p>
                <MdEmail /> email-suporte@gmail.com
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect, useContext } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./style.css";
import {
  adicionarPontos,
  mostrarToastPontosAdicionar,
  regrasPontuacao,
} from "../../../services/gamificacao.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../../contexts/auth";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";

export default function Ajuda() {
  const { user } = useContext(AuthContext);
  const [ativo, setAtivo] = useState(null);

  const perguntas = [
    {
      pergunta: "Onde encontro meus materiais de estudo (apostilas, apresentações, PDFs)?",
      resposta:
        "Você pode acessar os materiais de estudo na aba 'Turmas' > selecione sua turma > 'Materiais'.",
    },
    {
      pergunta: "Como entro em contato com o professor/coordenador?",
      resposta:
        "Use a área de mensagens da turma ou o e-mail institucional do professor, disponível no perfil da disciplina.",
    },
    {
      pergunta: "Como vejo minhas notas e o boletim completo?",
      resposta: "Acesse o menu lateral e clique em 'Notas' para visualizar todas as avaliações e médias.",
    },
    {
      pergunta: "O que fazer se um material não abrir ou aparecer como indisponível?",
      resposta:
        "Tente atualizar a página ou limpar o cache. Se o problema persistir, entre em contato com o suporte.",
    },
    {
      pergunta: "Como visualizar o calendário acadêmico (provas, trabalhos, eventos)?",
      resposta: "No menu principal, vá em 'Agenda' para ver todas as atividades e prazos importantes.",
    },
    {
      pergunta: "Onde verifico minha situação de matrícula?",
      resposta: "Acesse a aba 'Perfil' e consulte as informações de matrícula e status de cada disciplina.",
    },
  ];

 
  useEffect(() => {
    async function premiarAjuda() {
      if (!user) return;

      const sessionFlag = `premiou-ajuda-${user.uid}`;
      if (sessionStorage.getItem(sessionFlag)) return;

      const chave = `${user.uid}-ajuda-aberta`;
      const ultimaAbertura = localStorage.getItem(chave);
      const hoje = new Date();
      const hojeStr = hoje.toISOString().split("T")[0];

      const diasDesdeUltima =
        ultimaAbertura ? (new Date(hojeStr) - new Date(ultimaAbertura)) / (1000 * 60 * 60 * 24) : Infinity;

      if (diasDesdeUltima >= 7) {
        try {
          await adicionarPontos(user.uid, regrasPontuacao.abriuAjuda, "Acessou a aba de Ajuda 🧭");
          mostrarToastPontosAdicionar(regrasPontuacao.abriuAjuda, "Acessou a aba de Ajuda 🧭");
          localStorage.setItem(chave, hojeStr);
          sessionStorage.setItem(sessionFlag, "true"); 
        } catch (err) {
          console.error("Erro ao adicionar pontos da ajuda:", err);
        }
        } else {
   
        import("react-toastify").then(({ toast }) => {
          toast.info("✅ Você já ganhou pontos essa semana por acessar a Ajuda!", {
            position: "bottom-right",
            theme: "colored",
            autoClose: 2500,
            style: {
              background: "linear-gradient(135deg, #0284c7, #38bdf8)",
              color: "#fff",
            },
            icon: "💬",
          });
        });
        }
    }

    premiarAjuda();
  }, [user]);


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
                <p className="texto-card">{ativo === index ? item.resposta : item.pergunta}</p>
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

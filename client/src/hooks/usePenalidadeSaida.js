import { useEffect } from "react";
import { toast } from "react-toastify";

export function usePenalidadeSaida(condicao, user, API, regra) {
  useEffect(() => {
    const penalizar = () => {
     
      if (!condicao && user) {
        
        const jaAssistiu = localStorage.getItem(`${user.uid}-video-assistido-hoje`);
        if (jaAssistiu) return;

        toast.error(`💀 -${Math.abs(regra)} pontos! Saiu antes do fim 😢`, {
          position: "bottom-right",
          theme: "colored",
        });

        navigator.sendBeacon(
          `${API}/api/gamificacao/remove`,
          JSON.stringify({
            userId: user.uid,
            valor: Math.abs(regra),
          })
        );
      }
    };

    window.addEventListener("beforeunload", penalizar);
    return () => {
      window.removeEventListener("beforeunload", penalizar);
    };
  }, [condicao, user, API, regra]);
}

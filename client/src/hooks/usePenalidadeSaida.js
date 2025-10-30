import { useEffect } from "react";
import { toast } from "react-toastify";

export function usePenalidadeSaida(condicao, user, API, regra, motivo = "Saiu antes de concluir") {
  useEffect(() => {
    const penalizar = () => {
      if (!condicao && user) {
        const jaPenalizado = localStorage.getItem(`${user.uid}-penalizado-hoje`);
        if (jaPenalizado) return;

        toast.error(`💀 -${Math.abs(regra)} pontos! ${motivo} 😢`, {
          position: "bottom-right",
          theme: "colored",
        });

        navigator.sendBeacon(
          `${API}/api/gamificacao/remove`,
          JSON.stringify({
            userId: user.uid,
            valor: Math.abs(regra),
            motivo,
          })
        );

        localStorage.setItem(`${user.uid}-penalizado-hoje`, "true");
      }
    };

    window.addEventListener("beforeunload", penalizar);
    return () => window.removeEventListener("beforeunload", penalizar);
  }, [condicao, user, API, regra, motivo]);
}

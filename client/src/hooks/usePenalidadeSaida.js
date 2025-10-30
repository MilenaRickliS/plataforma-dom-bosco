
import { useEffect } from "react";

export function usePenalidadeSaida(condicao, user, API, regra) {
  useEffect(() => {
    const penalizar = () => {
      if (!condicao && user) {
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
      penalizar(); 
    };
  }, [condicao, user]);
}

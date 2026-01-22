import { addDays, startOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function getWeekDays(baseDate = new Date()) {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 }); 
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(start, i);
    return {
      dateObj: d,
      dateId: format(d, "yyyy-MM-dd"),     
      label: format(d, "EEEE", { locale: ptBR }),
      short: format(d, "dd/MM"),
    };
  });
}

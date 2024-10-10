import { format } from "date-fns";

function formatDate(date: string | Date, formatText?: string) {
  let currentFormat = "dd/MM/yyyy";

  if (formatText) currentFormat = formatText;

  return format(new Date(date), currentFormat);
}

function formatDateToDatetimeLocal(isoDateStr: string) {
  if (!isoDateStr) return "";

  // Converte a string ISO para objeto Date
  const date = new Date(isoDateStr);

  // Formata para o formato compatível com datetime-local
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export { formatDateToDatetimeLocal, formatDate };
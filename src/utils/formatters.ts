import { format, isValid, parse } from "date-fns";

const formatCPF = (value: string) => {
  const onlyDigits = value.replace(/\D/g, "");

  if (onlyDigits.length <= 3) return onlyDigits;
  if (onlyDigits.length <= 6)
    return `${onlyDigits.slice(0, 3)}.${onlyDigits.slice(3)}`;
  if (onlyDigits.length <= 9)
    return `${onlyDigits.slice(0, 3)}.${onlyDigits.slice(
      3,
      6
    )}.${onlyDigits.slice(6)}`;
  return `${onlyDigits.slice(0, 3)}.${onlyDigits.slice(
    3,
    6
  )}.${onlyDigits.slice(6, 9)}-${onlyDigits.slice(9, 11)}`;
};

const formatCNPJ = (v: string) => {
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
  v = v.replace(/(\d{4})(\d)/, "$1-$2");
  return v.length > 18 ? v.slice(0, 18) : v;
};

const formatPhoneNumber = (value: string) => {
  const onlyDigits = value.replace(/\D/g, "");

  if (onlyDigits.length <= 2) return onlyDigits;
  if (onlyDigits.length <= 6)
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(2)}`;
  return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
    2,
    7
  )}-${onlyDigits.slice(7, 11)}`;
};

const formatDateOfBirth = (value: string) => {
  const onlyDigits = value.replace(/\D/g, "");

  if (onlyDigits.length <= 2) return onlyDigits; // Retorna o dia
  if (onlyDigits.length <= 4)
    return `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(2)}`; // Retorna dd/mm
  return `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(
    2,
    4
  )}/${onlyDigits.slice(4, 8)}`; // Retorna dd/mm/aaaa
};

function formatCep(text: string) {
  const cleaned = text.replace(/\D/g, "");

  const masked = cleaned.replace(/(\d{5})(\d)/, "$1-$2");

  return masked.substring(0, 9);
}

const formatDateRange = (startAt: string, endAt: string) => {
  const parseDate = (dateString: string) => {
    const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
    return isValid(parsedDate) ? parsedDate : null;
  };

  const startDate = parseDate(startAt);
  const endDate = parseDate(endAt);

  if (startDate && endDate) {
    const formattedStart = format(startDate, "dd/MM/yyyy");
    const formattedEnd = format(endDate, "dd/MM/yyyy");
    return `de ${formattedStart} até ${formattedEnd}`;
  } else if (startDate) {
    const formattedStart = format(startDate, "dd/MM/yyyy");
    return `a partir de ${formattedStart}`;
  } else if (endDate) {
    const formattedEnd = format(endDate, "dd/MM/yyyy");
    return `até ${formattedEnd}`;
  }
  return "";
};

export {
  formatCPF,
  formatCNPJ,
  formatPhoneNumber,
  formatCep,
  formatDateRange,
  formatDateOfBirth,
};

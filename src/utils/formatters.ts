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

function formatCep(text: string) {
  const cleaned = text.replace(/\D/g, "");

  const masked = cleaned.replace(/(\d{5})(\d)/, "$1-$2");

  return masked.substring(0, 9);
}

export { formatCPF, formatPhoneNumber, formatCep };

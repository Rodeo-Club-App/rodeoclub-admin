function formatStringToCents(value: string) {
  value = value.trim();
  if (!value.includes(".")) {
    value += ".00";
  }

  if (value.indexOf(".") === value.length - 2) {
    value += "0";
  }

  return parseInt(value.replace(".", ""), 10);
}

function formatCentsToString(cents: number) {
  const reais = cents / 100;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

function formatCentsToReal(cents: number) {
  const reais = cents / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

export { formatStringToCents, formatCentsToReal, formatCentsToString };

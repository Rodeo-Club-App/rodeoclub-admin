type OrderStatus = {
  [key: string]: string;
};

const statusList = [
  { key: "processing" },
  { key: "on-hold" },
  { key: "pending" },
  { key: "em-transporte" },
  { key: "em-separacao" },
  // { key: "canceled" },
];

const formattedStatus: OrderStatus = {
  processing: "Processando",
  "on-hold": "Em Espera",
  pending: "Pendente",
  completed: "Concluído",
  canceled: "Cancelado",
  "em-transporte": "Em transporte",
  "em-separacao": "Em separação",
};

export { formattedStatus, statusList };

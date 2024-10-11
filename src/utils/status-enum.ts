type OrderStatus = {
  [key: string]: string;
};

const statusList = [
  { key: "processing" },
  { key: "on-hold" },
  { key: "pending" },
  // { key: "completed" },
  // { key: "canceled" },
];

const formattedStatus: OrderStatus = {
  processing: "Processando",
  "on-hold": "Em Espera",
  pending: "Pendente",
  completed: "Concluído",
  canceled: "Cancelado",
};

export { formattedStatus, statusList };

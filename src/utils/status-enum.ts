type OrderStatus = {
  [key: string]: string;
}

const formattedStatus: OrderStatus = {
  processing: "Processando",
  "on-hold": "Em Espera",
  pending: "Pendente",
  completed: "Concluído",
  canceled: "Cancelado",
}

export { formattedStatus };
type StockStatus = {
  [key: string]: string;
};

const stockList = [
  { key: "instock" },
  { key: "outofstock" },
  { key: "onbackorder" },
];

const formattedStock: StockStatus = {
  instock: "Em estoque",
  outofstock: "Sem estoque",
  onbackorder: "Em espera",
};

export { formattedStock, stockList };

interface SalesIndicators {
  id: number;
  tenantId: string;
  totalSales: number;
  salesPercentage: number;
  totalClients: number;
  clientsPercentage: number;
  totalOrders: number;
  ordersPercentage: number;
  totalProducts: number;
  updatedAt: string;
}

interface Partner {
  name: string;
  id: number;
}

interface SalePartnerAnalytic {
  id: number;
  partnerId: number;
  tenantId: string;
  totalOrders: number;
  totalSale: number;
  updatedAt: string; // ISO 8601 date format
  partner: Partner;
}

interface User {
  name: string;
  id: string;
  partner: Partner | null;
}

interface SaleClientAnalytic {
  id: number;
  clientId: string;
  tenantId: string;
  totalOrders: number;
  totalSale: number;
  updatedAt: string; // ISO 8601 date format
  user: User;
}

interface Product {
  name: string;
  id: number;
}

interface SaleProductAnalytic {
  id: number;
  productId: number;
  tenantId: string;
  totalOrders: number;
  totalSale: number;
  updatedAt: string; // ISO 8601 date format
  product: Product;
}

interface SalesBalanceAnalytic {
  id: number;
  tenantId: string;
  month: number;
  year: number;
  monthName: string;
  totalOrders: number;
  totalSale: number;
  updatedAt: string; // ISO 8601 date format
}

export interface SalesAnalytics {
  salesIndicators: SalesIndicators;
  salePartnerAnalytic: SalePartnerAnalytic[];
  saleClientAnalytic: SaleClientAnalytic[];
  saleProductAnalytic: SaleProductAnalytic[];
  salesBalanceAnalytic: SalesBalanceAnalytic[];
}

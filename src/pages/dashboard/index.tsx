import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ChevronUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Header } from "@/components/header";
import { Title } from "@/components/title-page";
import { AppLayout } from "../_layout";
import { SkeletonDashboard } from "@/components/skeleton-dashboard";
import { useState } from "react";

const salesData = [
  { name: "Jan", total: 4500 },
  { name: "Feb", total: 3800 },
  { name: "Mar", total: 5200 },
  { name: "Apr", total: 4800 },
  { name: "May", total: 5700 },
  { name: "Jun", total: 6100 },
];

const partners = [
  { id: "#3210", customer: "Aurora Due", status: "Shipped", amount: 42.25 },
];

const topProducts = [
  { name: "Wireless Earbuds", sales: 1234, revenue: 61700 },
  { name: "Smart Watch", sales: 987, revenue: 98700 },
  { name: "Bluetooth Speaker", sales: 876, revenue: 43800 },
  { name: "Laptop Stand", sales: 765, revenue: 22950 },
  { name: "Phone Case", sales: 654, revenue: 13080 },
];

export function Dashboard() {
  const [isLoading] = useState(false);
  
  return (
    <>
      <div className="flex-col md:flex">
        <Header />
        {isLoading ? (
          <SkeletonDashboard />
        ) : (
          <AppLayout>
            <Title name="Dashboard" />
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor total vendas
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ChevronUp className="h-4 w-4" />
                      20.1%
                    </span>
                    em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qtd Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2,350</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ChevronUp className="h-4 w-4" />
                      180.1%
                    </span>
                    em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qtd total pedidos
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,234</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ChevronUp className="h-4 w-4" />
                      19%
                    </span>
                    em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qtd Produtos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ChevronUp className="h-4 w-4" />
                      201
                    </span>
                    desde o ultimo mês
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 mb-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top parceiros com mais vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parceiro</TableHead>
                        <TableHead>Qtd vendas</TableHead>
                        <TableHead className="text-right">
                          Valor Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>377</TableCell>
                          <TableCell className="text-right">
                            ${order.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top clientes com mais vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Qtd vendas</TableHead>
                        <TableHead className="text-right">
                          Valor Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.name}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell className="text-right">
                            ${product.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 mb-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Produtos mais vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd Vendas</TableHead>
                        <TableHead className="text-right">
                          Valor Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.name}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell className="text-right">
                            ${product.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Balanço de vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesData}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{ background: "#333", border: "none" }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#adfa1d"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </AppLayout>
        )}
      </div>
    </>
  );
}

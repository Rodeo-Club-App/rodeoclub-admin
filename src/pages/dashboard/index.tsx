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
  ChevronDown,
  ChevronUp,
  DollarSign,
  File,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Header } from "@/components/header";
import { Title } from "@/components/title-page";
import { AppLayout } from "../_layout";
import { SkeletonDashboard } from "@/components/skeleton-dashboard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { SalesAnalytics } from "@/dto/interfaces/sales-indicators";
import { formatCentsToReal } from "@/utils/money";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// import { AniversariantesSemana } from "./birthdate-list";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {label} {formatCentsToReal(payload[0].value)}
        </p>
      </div>
    );
  }

  return null;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["indicators"],
    queryFn: async () => {
      const response = await api.get<SalesAnalytics>(
        "/home/rodeoclub/indicators"
      );

      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <>
      <div className="flex-col md:flex">
        <Header />
        {isLoading || isRefetching || !data ? (
          <SkeletonDashboard />
        ) : (
          <AppLayout>
            <Title name="Dashboard" />
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Total Vendas
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCentsToReal(data.salesIndicators.totalSales)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span
                      className={`flex items-center mr-1 ${
                        data.salesIndicators.salesPercentage < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {data.salesIndicators.salesPercentage < 0 ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                      {Math.abs(data.salesIndicators.salesPercentage).toFixed(
                        1
                      )}
                      %
                    </span>
                    em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qtd. Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{data.salesIndicators.totalClients}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span
                      className={`flex items-center mr-1 ${
                        data.salesIndicators.clientsPercentage < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {data.salesIndicators.clientsPercentage < 0 ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                      {Math.abs(data.salesIndicators.clientsPercentage).toFixed(
                        1
                      )}
                      %
                    </span>
                    em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qtd. Total Pedidos
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.salesIndicators.totalOrders}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span
                      className={`flex items-center mr-1 ${
                        data.salesIndicators.ordersPercentage < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {data.salesIndicators.ordersPercentage < 0 ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                      {Math.abs(data.salesIndicators.ordersPercentage).toFixed(
                        1
                      )}
                      %
                    </span>
                    em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Qtd. Produtos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.salesIndicators.totalProducts}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:grid gap-6 mb-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="uppercase text-xl">
                    Top parceiros com mais vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parceiro</TableHead>
                          <TableHead className="text-center">
                            Qtd vendas
                          </TableHead>
                          <TableHead className="text-right">
                            Valor Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.salePartnerAnalytic.map((partner) => (
                          <TableRow key={partner.id}>
                            <TableCell className="min-w-40 pr-4">
                              {partner.partner.name}
                            </TableCell>
                            <TableCell className="min-w-28 text-center font-medium">
                              {partner.totalOrders}
                            </TableCell>
                            <TableCell className="text-right min-w-28">
                              {formatCentsToReal(partner.totalSale)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="mt-6 md:mt-0">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="uppercase text-xl">
                    Top clientes com mais vendas
                  </CardTitle>

                  <Button size="icon" onClick={() => navigate("/clients")}>
                    <File className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Parceiro</TableHead>
                          <TableHead className="text-center">
                            Qtd vendas
                          </TableHead>
                          <TableHead className="text-right">
                            Valor Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.saleClientAnalytic.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium min-w-48 pr-4">
                              {client.user.name}
                            </TableCell>
                            <TableCell className="font-medium min-w-36">
                              {client.user.partner?.name}
                            </TableCell>
                            <TableCell className="min-w-28 text-center font-medium">
                              {client.totalOrders}
                            </TableCell>
                            <TableCell className="text-right min-w-28">
                              {formatCentsToReal(client.totalSale)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="md:grid gap-6 mb-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="uppercase text-xl">
                    Top Produtos mais vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-center">
                            Qtd Vendas
                          </TableHead>
                          <TableHead className="text-right">
                            Valor Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.saleProductAnalytic.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium min-w-48 pr-4">
                              {product.product.name}
                            </TableCell>
                            <TableCell className="min-w-28 text-center font-medium">
                              {product.totalOrders}
                            </TableCell>
                            <TableCell className="min-w-28 text-right">
                              {formatCentsToReal(product.totalSale)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="mt-6 md:mt-0">
                <CardHeader>
                  <CardTitle className="uppercase text-xl">
                    Balanço de vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data.salesBalanceAnalytic}>
                      <XAxis
                        dataKey="monthName"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value, index) =>
                          `${value}/${data.salesBalanceAnalytic[index].year}`
                        }
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${formatCentsToReal(value)}`}
                      />
                      <Tooltip
                        contentStyle={{ background: "#333", border: "none" }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                        content={<CustomTooltip />}
                      />
                      <Bar
                        dataKey="totalSale"
                        fill="#adfa1d"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* <AniversariantesSemana /> */}
            </div>
          </AppLayout>
        )}
      </div>
    </>
  );
}

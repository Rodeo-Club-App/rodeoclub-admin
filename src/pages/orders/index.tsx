import { File, Loader, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

import { formattedStatus } from "@/utils/status-enum";
import { formatDate } from "@/utils/format-iso-date";
import OrderCard from "@/components/orderCard";
import { useState } from "react";

import { useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Pagination } from "@/components/pagination";
import { z } from "zod";
import { AppLayout } from "../_layout";

interface Customer {
  id: string;
  name: string;
  partner: string | null;
}

interface OrderList {
  id: string;
  externalId: string;
  createdAt: string;
  customer: Customer;
  total: string;
  status: "on-hold" | "completed" | "canceled" | "pending" | "processing";
}

interface OrderResponse {
  currentPage: number;
  count: number;
  pageCount: number;
  orders: OrderList[];
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  imageUrl: string;
  price: string;
}

interface OrderDetailsResponse {
  id: string;
  status: string;
  externalId: string;
  createdAt: string;
  total: string;
  shippingValue: string;
  subTotal: string;
  shipping: string;
  billing: string;
  items: OrderItem[];
}

const statusColors = {
  processing: "bg-yellow-500 text-white",
  "on-hold": "bg-gray-500 text-white",
  pending: "bg-orange-500 text-white",
  completed: "bg-green-500 text-white",
  canceled: "bg-red-500 text-white",
};

export function Orders() {
  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const pageCount = z.coerce
    .number()
    .parse(searchParams.get("pageCount") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const { data: orderList } = useQuery({
    queryKey: ["orders", search, startAt, endAt, pageCount, limit],
    queryFn: async () => {
      const response = await api.post<OrderResponse>(
        `/orders/rodeoclub/search`,
        {
          search: search,
          startAt: startAt
            ? format(parseISO(startAt), "yyyy-MM-dd")
            : undefined,
          endAt: endAt ? format(parseISO(endAt), "yyyy-MM-dd") : undefined,
        },
        {
          params: {
            page: pageCount,
            limit: limit,
          },
        }
      );

      return response.data;
    },
  });

  const from = parseDate(startAt);
  const to = parseDate(endAt);

  const handleRangeChange = (range: DateRange | undefined) => {
    if (range?.from)
      searchParams.set("startAt", format(range.from, "yyyy-MM-dd"));
    else searchParams.delete("startAt");

    if (range?.to) searchParams.set("endAt", format(range.to, "yyyy-MM-dd"));
    else searchParams.delete("endAt");

    setSearchParams(searchParams);
  };

  const [selectedOrder, setSelectedOrder] = useState<OrderList | null>(null);

  const handleRowClick = (order: OrderList) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setSearchParams((prev) => {
        prev.delete("ref");
        return prev;
      });
    } else {
      setSelectedOrder(order);
      setSearchParams((prev) => {
        prev.set("ref", order.id);
        return prev;
      });
    }
  };

  const { data: orderId, isLoading: isLoadingOrderDetails } = useQuery({
    queryKey: ["orderId", selectedOrder?.id],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const response = await api.get<OrderDetailsResponse>(
        `/orders/rodeoclub/user/${selectedOrder?.id}`
      );

      return response.data;
    },
  });

  function handlePaginate(pageIndex: number) {
    setSearchParams((prev) => {
      prev.set("pageCount", pageIndex.toString());

      return prev;
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <AppLayout>
        <main
          className={`grid flex-1 items-start gap-4 md:p-4 sm:px-6 sm:py-0 md:gap-8 ${
            selectedOrder ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-1"
          }`}
        >
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 w-full">
            <Tabs defaultValue="week">
              <div className="flex items-center">
                <div className="relative mr-2 md:mr-0 flex-1 md:grow-0">
                  <Search className="absolute left-2.5 bottom-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pelo número do pedido ou cliente..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    value={search}
                    onChange={(event) =>
                      setSearchParams((p) => {
                        p.set("search", event.target.value);

                        return p;
                      })
                    }
                  />
                </div>
                <div className="ml-auto flex">
                  <DatePickerWithRange
                    to={to}
                    from={from}
                    onChange={handleRangeChange}
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 gap-1 text-sm ml-2"
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Exportar</span>
                  </Button>
                </div>
              </div>

              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Pedidos</CardTitle>
                    <CardDescription>
                      Pedidos recentes da sua loja.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nº pedido</TableHead>
                          <TableHead className="sm:table-cell">
                            Cliente
                          </TableHead>

                          <TableHead className="sm:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Data
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Valor
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-right">
                            Parceiro
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderList?.orders.map((order) => (
                          <TableRow
                            key={order.id}
                            className={`cursor-pointer ${
                              selectedOrder?.id === order.id
                                ? "bg-gray-200"
                                : ""
                            }`}
                            onClick={() => handleRowClick(order)}
                          >
                            <TableCell className="font-medium">
                              #{order.externalId}
                            </TableCell>
                            <TableCell className="sm:table-cell">
                              <div className="font-medium">
                                {order?.customer?.name}
                              </div>
                            </TableCell>
                            <TableCell className="sm:table-cell">
                              <Badge
                                className={`text-xs ${
                                  statusColors[order.status] || ""
                                }`}
                              >
                                {formattedStatus[order.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {order.total}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-right">
                              {order.customer.partner}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <div className="flex w-fulljustify-end px-8 py-6">
                    {orderList && (
                      <Pagination
                        currentPage={orderList.currentPage}
                        totalCount={orderList.count}
                        perPage={limit}
                        onPageChange={handlePaginate}
                      />
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            {isLoadingOrderDetails ? (
              <div className="flex h-96 items-center justify-center">
                <Loader size={30} />
              </div>
            ) : (
              selectedOrder &&
              orderId && (
                <div>
                  <OrderCard
                    key={selectedOrder.id}
                    orderId={selectedOrder.externalId}
                    orderDate={formatDate(selectedOrder.createdAt)}
                    items={orderId.items}
                    subtotal={orderId.subTotal}
                    shippingAddress={orderId.shipping}
                    shippingValue={orderId.shippingValue}
                    total={orderId.total}
                    customer={{
                      name: selectedOrder?.customer.name || "",
                    }}
                    billingAddress={orderId.billing}
                  />
                </div>
              )
            )}
          </div>
        </main>
      </AppLayout>
    </div>
  );
}

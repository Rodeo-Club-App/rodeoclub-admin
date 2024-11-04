import { Loader } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

import OrderCard from "@/components/orderCard";
import { formatDate } from "@/utils/format-iso-date";
import { formattedStatus } from "@/utils/status-enum";

import { Pagination } from "@/components/pagination";
import { ListSkeletonTable } from "@/components/skeleton-rows";
import { format, parseISO } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import { AppLayout } from "../_layout";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataFilters } from "./data-filters";

export interface OrderReport {
  period: string | null;
  total: string;
  totalOrders: string;
  orders: OrderList[];
}

interface Customer {
  id: string;
  name: string;
  partner: string | null;
}

export interface OrderList {
  id: string;
  externalId: string;
  createdAt: string;
  customer: Customer;
  total: string;
  totalCents: number;
  status: "on-hold" | "completed" | "cancelled" | "pending" | "processing";
  items: ItemProduct[];
}

interface ItemProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderResponse {
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
  customer: Customer;
  paymentMethod: string;
  trackingCode: string | null;
  trackingUrl: string | null;
  billing: string;
  items: OrderItem[];
}

const statusColors = {
  processing: "bg-yellow-500 text-white",
  "on-hold": "bg-gray-500 text-white",
  pending: "bg-orange-500 text-white",
  "em-transporte": "bg-blue-500 text-white",
  completed: "bg-green-500 text-white",
  "em-separacao": "bg-orange-500 text-white",
  cancelled: "bg-red-500 text-white",
};

export function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const orderId = searchParams.get("orderId") || "";
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const status = searchParams.get("status") || "";
  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const partners = searchParams.get("partners");

  const [debouncedSearchQuery] = useDebounce(search, 500);

  const {
    data: orderList,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [
      "orders",
      debouncedSearchQuery,
      startAt,
      endAt,
      pageCount,
      limit,
      partners,
      status,
    ],
    queryFn: async () => {
      const response = await api.post<OrderResponse>(
        `/orders/rodeoclub/search`,
        {
          search: debouncedSearchQuery,
          partnerIds: partners?.split(",").map((id) => Number(id.trim())),
          ...(status !== "" && {
            status: status?.split(",").map((i) => i),
          }),
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
    refetchOnWindowFocus: false,
  });

  const handleRowClick = (order: OrderList) => {
    if (orderId === order.id) {
      setSearchParams((prev) => {
        prev.delete("orderId");
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.set("orderId", order.id);
        return prev;
      });
    }
  };

  const { data: orderData, isLoading: isLoadingOrderDetails } = useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const response = await api.get<OrderDetailsResponse>(
        `/orders/rodeoclub/user/${orderId}`
      );

      return response.data;
    },
  });

  function handlePaginate(pageIndex: number) {
    setSearchParams((prev) => {
      prev.delete("orderId");
      prev.set("page", pageIndex.toString());

      return prev;
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <AppLayout>
        <main
          className={`lg:grid flex-1 items-start gap-4 md:p-4 sm:px-6 sm:py-0 md:gap-8 ${
            orderId ? "xxl:grid-cols-[2fr_1fr]" : "xxl:grid-cols-1"
          }`}
        >
          <div className="lg:grid auto-rows-max items-start gap-4 md:gap-8 w-full">
            <Tabs defaultValue="week">
              <DataFilters />

              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Pedidos</CardTitle>
                    <CardDescription>
                      Pedidos recentes da sua loja.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading || isRefetching ? (
                      <ListSkeletonTable rows={limit} />
                    ) : (
                      <ScrollArea>
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
                              <TableHead className="md:table-cell">
                                Data
                              </TableHead>
                              <TableHead className="md:table-cell">
                                Valor
                              </TableHead>
                              <TableHead className="md:table-cell text-right">
                                Parceiro
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orderList?.orders.map((order) => (
                              <TableRow
                                key={order.id}
                                className={`cursor-pointer ${
                                  orderId === order.id ? "bg-gray-200" : ""
                                }`}
                                onClick={() => handleRowClick(order)}
                              >
                                <TableCell className="min-w-24 font-medium text-sm">
                                  #{order.externalId}
                                </TableCell>
                                <TableCell className="min-w-48">
                                  <div className="font-medium text-sm">
                                    {order?.customer?.name}
                                  </div>
                                </TableCell>
                                <TableCell className="min-w-28 font-medium ">
                                  <Badge
                                    className={`text-sm cursor-default pb-1 hover:bg-${
                                      statusColors[order.status]
                                    } ${statusColors[order.status] || ""} `}
                                  >
                                    {formattedStatus[order.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell className="min-w-32 font-medium ">
                                  {formatDate(order.createdAt)}
                                </TableCell>
                                <TableCell className="min-w-32 font-medium ">
                                  {order.total}
                                </TableCell>
                                <TableCell className="min-w-32 font-medium text-right">
                                  {order.customer.partner}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    )}
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
                <Loader className="animate-spin" size={30} />
              </div>
            ) : (
              orderId &&
              orderData && (
                <div>
                  <OrderCard
                    key={orderData.id}
                    orderId={orderData.externalId}
                    orderDate={formatDate(orderData.createdAt)}
                    items={orderData.items}
                    subtotal={orderData.subTotal}
                    shippingAddress={orderData.shipping}
                    shippingValue={orderData.shippingValue}
                    total={orderData.total}
                    customer={{
                      name: orderData.customer.name,
                    }}
                    payment={{
                      method: orderData.paymentMethod,
                    }}
                    billingAddress={orderData.billing}
                    trackingCode={orderData.trackingCode}
                    trackingUrl={orderData.trackingUrl}
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

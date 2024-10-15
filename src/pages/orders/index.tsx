import { File, ListFilter, Loader, Loader2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

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
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

import OrderCard from "@/components/orderCard";
import { formatDate } from "@/utils/format-iso-date";
import { formattedStatus, statusList } from "@/utils/status-enum";

import { listPartners } from "@/api/partners/list-partners";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Pagination } from "@/components/pagination";
import { ListSkeletonTable } from "@/components/skeleton-rows";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCentsToReal } from "@/utils/money";
import ReactPDF from "@react-pdf/renderer";
import { format, isValid, parse, parseISO } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import { AppLayout } from "../_layout";
import { PDFReport } from "./pdf-report";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface OrderReport {
  period: string | null;
  partner: string | null;
  total: string;
  orders: OrderList[];
}

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
  totalCents: number;
  status: "on-hold" | "completed" | "canceled" | "pending" | "processing";
  items: ItemProduct[];
}

interface ItemProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
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
  customer: Customer;
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
  const orderId = searchParams.get("orderId") || "";
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partnerId = searchParams.get("partnerId") || "";
  const status = searchParams.get("status") || "";
  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const [isExporting, setIsExporting] = useState(false);

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
      partnerId,
      status,
    ],
    queryFn: async () => {
      const response = await api.post<OrderResponse>(
        `/orders/rodeoclub/search`,
        {
          search: debouncedSearchQuery,
          partnerId: partnerId,
          status: status,
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

  const { data: partnersList, isLoading: isLoadingPartners } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
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

  const clearPartner = () => {
    setSearchParams((p) => {
      p.delete("partnerId");

      return p;
    });
  };

  const clearStatus = () => {
    setSearchParams((p) => {
      p.delete("status");

      return p;
    });
  };

  const onSelectPartner = (id: string) => {
    setSearchParams((prev) => {
      prev.set("partnerId", id);
      return prev;
    });
  };

  const onSelectStatus = (id: string) => {
    setSearchParams((prev) => {
      prev.set("status", id);
      return prev;
    });
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

  const formatDateRange = (startAt: string, endAt: string) => {
    const parseDate = (dateString: string) => {
      const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
      return isValid(parsedDate) ? parsedDate : null; // Retorna null se a data não for válida
    };

    const startDate = parseDate(startAt);
    const endDate = parseDate(endAt);

    if (startDate && endDate) {
      const formattedStart = format(startDate, "dd/MM/yyyy");
      const formattedEnd = format(endDate, "dd/MM/yyyy");
      return `de ${formattedStart} até ${formattedEnd}`;
    } else if (startDate) {
      const formattedStart = format(startDate, "dd/MM/yyyy");
      return `a partir de ${formattedStart}`;
    } else if (endDate) {
      const formattedEnd = format(endDate, "dd/MM/yyyy");
      return `até ${formattedEnd}`;
    }
    return "";
  };

  const handleExportReport = async (type: "pdf" | "excel") => {
    setIsExporting(true);

    const searchParams = {
      debouncedSearchQuery,
      startAt,
      endAt,
      partnerId,
      status,
    };

    const allOrders: OrderList[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await api.post<OrderResponse>(
          "/orders/rodeoclub/search",
          {
            search: searchParams.debouncedSearchQuery,
            partnerId: searchParams.partnerId,
            status: searchParams.status,
            includeProducts: true,
            startAt: searchParams.startAt
              ? format(parseISO(searchParams.startAt), "yyyy-MM-dd")
              : undefined,
            endAt: searchParams.endAt
              ? format(parseISO(searchParams.endAt), "yyyy-MM-dd")
              : undefined,
          },
          {
            params: {
              page: page,
              limit: limit,
            },
          }
        );

        const data = response.data;
        allOrders.push(...data.orders);

        hasMore = data.orders.length === limit;
        page += 1;
      } catch (err) {
        break;
      }
    }

    const amount = allOrders.reduce((total, order) => {
      return total + (order.totalCents || 0);
    }, 0);

    const data = {
      period: formatDateRange(startAt, endAt),
      partner: partnerId
        ? partnersList?.find((i) => i.id === Number(partnerId))?.name ?? ""
        : null,
      total: formatCentsToReal(amount),
      orders: allOrders,
    };

    if (type === "pdf") {
      const url = await renderUrl(data);

      window.open(url, "_blank");
    }

    if (type === "excel") {
      const rows = [];

      rows.push([
        "Nº Pedido",
        "Cliente",
        "Status",
        "Valor do Pedido",
        "Produto",
        "Valor Unitário",
        "Quantidade",
        "Parceiro",
        "Data",
      ]);

      data.orders.forEach((order) => {
        const orderRow = [
          order.externalId,
          order.customer.name,
          formattedStatus[order.status],
          formatCentsToReal(order.totalCents),
          "",
          "",
          "",
          order.customer.partner,
          formatDate(order.createdAt, "dd/MM/yyyy HH:mm"),
        ];

        rows.push(orderRow);

        order.items.forEach((item) => {
          const itemRow = [
            "",
            order.customer.name,
            "",
            "",
            item.name,
            formatCentsToReal(item.price),
            item.quantity,
            order.customer.partner,
            "",
          ];

          rows.push(itemRow);
        });
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelFilename = `relatorio_de_pedidos.xlsx`;

      XLSX.writeFile(workbook, excelFilename);
    }

    setIsExporting(false);
  };

  const renderUrl = async (data: OrderReport) => {
    const blob = await ReactPDF.pdf(<PDFReport data={data} />).toBlob(); // Passar os dados para o PDF
    const url = URL.createObjectURL(blob);
    return url;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <AppLayout>
        <main
          className={`md:grid flex-1 items-start gap-4 md:p-4 sm:px-6 sm:py-0 md:gap-8 ${
            orderId ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-1"
          }`}
        >
          <div className="md:grid auto-rows-max items-start gap-4 md:gap-8 w-full">
            <Tabs defaultValue="week">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="relative md:mr-2 md:grow-0 mb-1 md:mb-0 w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pelo número do pedido ou cliente..."
                    className="pl-8 pr-4 py-2 w-full md:w-auto lg:w-[336px] rounded-lg bg-background"
                    value={search}
                    onChange={(event) =>
                      setSearchParams((p) => {
                        p.set("search", event.target.value);
                        return p;
                      })
                    }
                  />
                </div>

                <div className="md:ml-auto flex flex-wrap sm:flex-row mt-2">
                  <DatePickerWithRange
                    to={to}
                    from={from}
                    onChange={handleRangeChange}
                  />

                  <div className="flex mr-1">
                    <Select
                      value={partnerId || ""}
                      onValueChange={(e) => onSelectPartner(e)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Parceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {!isLoadingPartners &&
                          partnersList?.map((partner) => (
                            <SelectItem
                              key={partner.id}
                              value={String(partner.id)}
                            >
                              {partner.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                      {partnerId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={clearPartner}
                          className="w-8 h-8 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </Select>
                  </div>

                  <div className="flex mr-1">
                    <Select
                      value={status || ""}
                      onValueChange={(e) => onSelectStatus(e)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusList?.map((status, index) => (
                          <SelectItem key={index} value={status.key}>
                            {formattedStatus[status.key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      {status && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={clearStatus}
                          className="w-8 h-8 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </Select>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 gap-1 text-sm"
                        disabled={isExporting}
                      >
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Exportar
                        </span>

                        {isExporting && (
                          <Loader2 className="animate-spin w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Exportar em</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleExportReport("pdf")}
                      >
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportReport("excel")}
                      >
                        Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    {isLoading || isRefetching ? (
                      <ListSkeletonTable rows={limit} />
                    ) : (
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
                                orderId === order.id ? "bg-gray-200" : ""
                              }`}
                              onClick={() => handleRowClick(order)}
                            >
                              <TableCell className="font-medium text-xs sm:text-sm">
                                #{order.externalId}
                              </TableCell>
                              <TableCell className="sm:table-cell">
                                <div className="font-medium text-xs sm:text-sm">
                                  {order?.customer?.name}
                                </div>
                              </TableCell>
                              <TableCell className="sm:table-cell">
                                <Badge
                                  className={`text-xs sm:text-sm ${
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
              // orderId &&
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
                    billingAddress={orderData.billing}
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

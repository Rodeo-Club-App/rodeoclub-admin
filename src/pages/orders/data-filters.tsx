import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { formatDate } from "@/utils/format-iso-date";
import { formatDateRange } from "@/utils/formatters";
import { formatCentsToReal } from "@/utils/money";
import { formattedStatus } from "@/utils/status-enum";
import ReactPDF from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import { File, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import * as XLSX from "xlsx";
import { z } from "zod";
import { OrderList, OrderResponse } from ".";
import { PDFReport } from "./pdf-report";

import { DataFilterPartners } from "./data-filter-partners";
import { DataFilterStatus } from "./data-filter-status";

export function DataFilters() {
  const [isExporting, setIsExporting] = useState(false);

  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partnerId = searchParams.get("partners") || "";
  const status = searchParams.get("status") || "";
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");
  const [debouncedSearchQuery] = useDebounce(search, 500);

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

  const clearDate = () => {
    setSearchParams((p) => {
      p.delete("startAt");
      p.delete("endAt");

      return p;
    });
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
            ...(searchParams.partnerId && {
              partnerIds: searchParams.partnerId
                .split(",")
                .map((id) => Number(id.trim())),
            }),

            ...(searchParams.status !== "" && {
              status: searchParams.status?.split(",").map((i) => i),
            }),
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
      //   partner: partnerId
      //     ? partnersList?.find((i) => i.id === Number(partnerId))?.name ?? ""
      //     : null,
      total: formatCentsToReal(amount),
      totalOrders: allOrders.length.toString(),
      orders: allOrders,
    };

    if (type === "pdf") {
      const rows = [];

      rows.push([
        "Nº Pedido",
        "Cliente",
        "Status",
        "Produto",
        "Valor Unitário",
        "Quantidade",
        "Valor do Pedido",
        "Data",
        "Parceiro",
      ]);

      data.orders.forEach((order) => {
        const orderRow = [
          order.externalId,
          order.customer.name,
          formattedStatus[order.status],
          "",
          formatCentsToReal(order.totalCents),
          "",
          "",
          formatDate(order.createdAt, "dd/MM/yyyy HH:mm"),
          order.customer.partner,
        ];

        rows.push(orderRow);

        order.items.forEach((item) => {
          const itemRow = [
            "",
            "",
            "",
            item.name,
            formatCentsToReal(item.price),
            item.quantity,
            "",
            "",
            "",
          ];

          rows.push(itemRow);
        });
      });

      const pdf = <PDFReport data={data} />;

      const blob = await ReactPDF.pdf(pdf).toBlob();
      const url = URL.createObjectURL(blob);
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
        "Quantidade",
        "Valor Unitário",
        "Valor Total",
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
          "",
          formatDate(order.createdAt, "dd/MM/yyyy HH:mm"),
          order.customer.partner,
        ];

        rows.push(orderRow);

        order.items.forEach((item) => {
          const itemRow = [
            "",
            "",
            "",
            "",
            item.name,
            formatCentsToReal(item.price),
            item.quantity,
            formatCentsToReal(item.price * item.quantity),
            order.customer.partner,
            formatDate(order.createdAt, "dd/MM/yyyy HH:mm"),
            "",
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
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
      <div className="relative md:mr-2 md:grow-0 w-full sm:w-auto">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar pelo número do pedido ou cliente..."
          className="pl-8 h-8 pr-4 py-2 w-full md:w-auto lg:w-[336px] rounded-lg bg-background"
          value={search}
          onChange={(event) =>
            setSearchParams((p) => {
              p.set("search", event.target.value);
              return p;
            })
          }
        />
      </div>

      <div className="md:ml-auto gap-2 flex flex-wrap sm:flex-row md:gap-0">
        <div className="flex items-center w-full xs:w-auto md:mr-1">
          <DatePickerWithRange
            to={to}
            from={from}
            onChange={handleRangeChange}
          />

          {(from || to) && (
            <Button
              size="icon"
              variant="ghost"
              onClick={clearDate}
              className="w-8 h-8 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* <div className="flex items-center sm:flex-initial sm:max-w-32 mr-1"> */}
        {/* </div> */}

        <div className="flex gap-2">
          <DataFilterPartners />
          <DataFilterStatus />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-sm"
              disabled={isExporting}
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">
                Exportar
              </span>

              {isExporting && <Loader2 className="animate-spin w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Exportar em</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExportReport("pdf")}
            >
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExportReport("excel")}
            >
              Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

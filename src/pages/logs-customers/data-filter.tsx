import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";

import { format, formatDate, parseISO } from "date-fns";

import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { listPartners } from "@/api/partners/list-partners";
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
import { formatDateRange } from "@/utils/formatters";
import ReactPDF from "@react-pdf/renderer";
import { File, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";
import { ILog, LogResponse } from ".";
import { DataFilterPartners } from "../orders/data-filter-partners";
import { PDFReport } from "./pdf-report";

export function DataFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: partnersList } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;
  const [isExporting, setIsExporting] = useState(false);

  const search = searchParams.get("search") || "";
  const [debouncedSearchQuery] = useDebounce(search, 500);
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partners = searchParams.get("partners") || "";

  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

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
      partners,
    };

    const allLogs: ILog[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await api.post<LogResponse>(
          "/logs/rodeoclub/",
          {
            search: searchParams.debouncedSearchQuery,
            ...(searchParams.partners !== "" && {
              partnerIds: searchParams.partners
                ?.split(",")
                .map((id) => Number(id.trim())),
            }),

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
        allLogs.push(...data.logs);

        hasMore = data.logs.length === limit;
        page += 1;
      } catch (err) {
        break;
      }
    }

    const data = {
      period: formatDateRange(startAt, endAt),
      partner: partners
        ? partners
            .split(",")
            .map((id) => partnersList?.find((i) => i.id === Number(id))?.name)
            .filter((name) => name)
            .join(", ")
        : null,

      total: allLogs.length.toString(),
      logs: allLogs,
    };

    if (type === "pdf") {
      const rows = [];

      rows.push(["Cliente", "Atividade", "Data", "Localização, Parceiro"]);

      data.logs.forEach((log) => {
        const orderRow = [
          log.customer.name,
          log.activity,
          formatDate(log.createdAt, "dd/MM/yyyy HH:mm"),
          log.city,
          log.customer.partner,
        ];

        rows.push(orderRow);
      });

      const pdf = <PDFReport data={data} />;

      const blob = await ReactPDF.pdf(pdf).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }

    if (type === "excel") {
      const rows = [];

      rows.push(["Cliente", "Atividade", "Data", "Localização", "Parceiro"]);

      data.logs.forEach((log) => {
        const orderRow = [
          log.customer.name,
          log.activity,
          formatDate(log.createdAt, "dd/MM/yyyy HH:mm"),
          log.city,
          log.customer.partner,
        ];

        rows.push(orderRow);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

      const excelFilename = `relatorio_de_acessos.xlsx`;

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
          placeholder="Buscar por nome..."
          className="pl-8 pr-4 h-8 py-2 w-full md:w-auto lg:w-[336px] rounded-lg bg-background"
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

        <DataFilterPartners />

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
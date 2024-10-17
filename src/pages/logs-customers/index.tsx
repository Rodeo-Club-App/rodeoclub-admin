import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
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

import { format, formatDate, isValid, parse, parseISO } from "date-fns";

import { Pagination } from "@/components/pagination";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { ListSkeletonTable } from "@/components/skeleton-rows";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { File, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listPartners } from "@/api/partners/list-partners";
import * as XLSX from "xlsx";
import { PDFReport } from "./pdf-report";
import ReactPDF from "@react-pdf/renderer";

export interface LogReport {
  period: string | null;
  partner: string | null;
  total: string;
  logs: ILog[];
}

interface Customer {
  id: string;
  name: string;
  partner: string | null;
}

interface ILog {
  id: number;
  activity: string;
  type: string;
  createdAt: string;
  city: string | null;
  customer: Customer;
}

interface LogResponse {
  currentPage: number;
  count: number;
  pageCount: number;
  logs: ILog[];
}

export function LogsCustomers() {
  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [debouncedSearchQuery] = useDebounce(search, 500);
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partnerId = searchParams.get("partnerId") || "";

  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: [
      "logs",
      pageCount,
      limit,
      debouncedSearchQuery,
      partnerId,
      startAt,
      endAt,
    ],
    queryFn: async () => {
      const response = await api.post<LogResponse>(
        `/logs/rodeoclub`,
        {
          ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
          ...(partnerId && { partnerId: partnerId }),
          ...(startAt && { startAt: format(parseISO(startAt), "yyyy-MM-dd") }),
          ...(endAt && { endAt: format(parseISO(endAt), "yyyy-MM-dd") }),
        },
        {
          params: {
            page: pageCount,
            limit,
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

  const clearPartner = () => {
    setSearchParams((p) => {
      p.delete("partnerId");

      return p;
    });
  };

  const onSelectPartner = (id: string) => {
    setSearchParams((prev) => {
      prev.set("partnerId", id);
      return prev;
    });
  };

  function handlePaginate(pageIndex: number) {
    setSearchParams((prev) => {
      prev.set("page", pageIndex.toString());

      return prev;
    });
  }

  const clearDate = () => {
    setSearchParams((p) => {
      p.delete("startAt");
      p.delete("endAt");

      return p;
    });
  };

  const formatDateRange = (startAt: string, endAt: string) => {
    const parseDate = (dateString: string) => {
      const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
      return isValid(parsedDate) ? parsedDate : null;
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
            partnerId: searchParams.partnerId,

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
      partner: partnerId
        ? partnersList?.find((i) => i.id === Number(partnerId))?.name ?? ""
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <AppLayout>
        <main
          className={
            "md:grid flex-1 items-start gap-4 lg:p-4 sm:px-6 sm:py-0 md:gap-8"
          }
        >
          <div className="md:grid auto-rows-max items-start gap-4 md:gap-8 w-full">
            <Tabs defaultValue="week">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="relative md:mr-2 md:grow-0 mb-1 md:mb-0 w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome..."
                    className="pl-8 pr-4 py-2 w-full  md:w-[336px] rounded-lg bg-background"
                    value={search}
                    onChange={(event) =>
                      setSearchParams((p) => {
                        p.set("search", event.target.value);
                        return p;
                      })
                    }
                  />
                </div>

                <div className="md:ml-auto flex flex-wrap sm:flex-row mt-2 mb-1 gap-2 sm:gap-0">
                  <div className="flex mr-1 items-center">
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
                              className="cursor-pointer"
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
                          className="w-8 h-8 hover:text-red-500 mx-2"
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
              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Acessos</CardTitle>
                    <CardDescription>
                      Administre os acessos dos seus clientes.
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
                              <TableHead className="">Cliente</TableHead>

                              <TableHead>Atividade</TableHead>
                              <TableHead className="">Data</TableHead>

                              <TableHead className="text-right">
                                Localização
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data?.logs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="text-sm font-medium  pr-4 max-w-56">
                                  {log.customer.name}
                                </TableCell>

                                <TableCell className="font-medium ">
                                  {log.activity}
                                </TableCell>

                                <TableCell className="text-sm font-medium ">
                                  {formatDate(
                                    new Date(log.createdAt),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </TableCell>
                                <TableCell className="font-medium text-right">
                                  {log.city || "Sem localização"}
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
                    {data && (
                      <Pagination
                        currentPage={data.currentPage}
                        totalCount={data.count}
                        perPage={limit}
                        onPageChange={handlePaginate}
                      />
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </AppLayout>
    </div>
  );
}

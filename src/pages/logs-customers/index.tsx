import { Header } from "@/components/header";
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
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "../_layout";

import { format, formatDate, parseISO } from "date-fns";

import { Pagination } from "@/components/pagination";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { ListSkeletonTable } from "@/components/skeleton-rows";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataFilters } from "./data-filter";

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

export interface ILog {
  id: number;
  activity: string;
  type: string;
  createdAt: string;
  city: string | null;
  customer: Customer;
}

export interface LogResponse {
  currentPage: number;
  count: number;
  pageCount: number;
  logs: ILog[];
}

export function LogsCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [debouncedSearchQuery] = useDebounce(search, 500);
  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partners = searchParams.get("partners") || "";

  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: [
      "logs",
      pageCount,
      limit,
      debouncedSearchQuery,
      partners,
      startAt,
      endAt,
    ],
    queryFn: async () => {
      const response = await api.post<LogResponse>(
        `/logs/rodeoclub`,
        {
          ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
          ...(partners !== "" && {
            partnerIds: partners?.split(",").map((id) => Number(id.trim())),
          }),
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

  function handlePaginate(pageIndex: number) {
    setSearchParams((prev) => {
      prev.set("page", pageIndex.toString());

      return prev;
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <AppLayout>
        <main
          className={
            "lg:grid flex-1 items-start gap-4 md:p-4 sm:px-6 sm:py-0 md:gap-8"
          }
        >
          <div className="lg:grid auto-rows-max items-start gap-4 md:gap-8 w-full">
            <Tabs defaultValue="week">
              <DataFilters />
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
                                <TableCell className="min-w-36 text-sm font-medium pr-4">
                                  {log.customer.name}
                                </TableCell>

                                <TableCell className="min-w-48 font-medium pr-4">
                                  {log.activity}
                                </TableCell>

                                <TableCell className="min-w-36 text-sm font-medium">
                                  {formatDate(
                                    new Date(log.createdAt),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </TableCell>
                                <TableCell className="min-w-48 font-medium text-right">
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

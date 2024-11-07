import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/components/pagination";
import { ListSkeletonTable } from "@/components/skeleton-rows";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSearchParams } from "react-router-dom";
import { DataFilters } from "./data-filter";
import { z } from "zod";
import { useDebounce } from "use-debounce";
import { format, parseISO } from "date-fns";
import { AppLayout } from "../_layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export interface ClientReport {
  period: string | null;
  partner: string | null;
  total: string;
  clients: ClientList[];
}

export interface ClientsResponse {
  count: number;
  currentPage: number;
  pageCount: number;
  data: ClientList[];
}

export interface ClientList {
  id: number;
  user: {
    name: string;
    email: string;
  };
  totalOrders: number;
  totalSpent: number;
  topBrands: TopBrand[];
  totalSpentsFormatted: string;
}

interface TopBrand {
  id: number;
  brand: string;
  quantity: number;
  totalSpent: number;
  totalSpentFormatted: string;
  imageUrl: string;
}

export function Clients() {
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
      "odersUsers",
      pageCount,
      limit,
      debouncedSearchQuery,
      partners,
      startAt,
      endAt,
    ],
    queryFn: async () => {
      const response = await api.post<ClientsResponse>(
        "/orders/rodeoclub/users",
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
    refetchOnWindowFocus: false,
  });

  const [expandAll, setExpandAll] = useState(false);

  function handleExpandAll() {
    setExpandAll(!expandAll);
  }

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
                  <CardHeader className="px-7 flex flex-row justify-between items-center">
                    <CardTitle>Clientes</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-sm w-28"
                      onClick={handleExpandAll}
                    >
                      <ChevronsUpDown className="h-3.5 w-3.5" />
                      <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">
                        {expandAll ? "Recolher" : "Expandir"}
                      </span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading || isRefetching ? (
                      <ListSkeletonTable rows={limit} />
                    ) : (
                      <ScrollArea>
                        <div className="w-full caption-bottom text-sm pt-3">
                          <div className="flex w-full  border-b border-gray-200 h-8 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                            <div className="font-medium w-full min-w-56 sm:px-4">
                              Cliente
                            </div>
                            <div className="w-full min-w-64 font-medium">
                              Parceiro
                            </div>
                            <div className="w-full min-w-32 font-medium text-center">
                              Qtd. compras
                            </div>
                            <div className="w-full min-w-56 font-medium text-right">
                              Total de compras
                            </div>
                            <div className="w-full max-w-14" />
                          </div>

                          {data?.data?.map((customer) => (
                            <Accordion
                              type="single"
                              collapsible
                              key={customer.id}
                              className="w-full"
                              value={
                                expandAll ? `item-${customer.id}` : undefined
                              }
                            >
                              <AccordionItem
                                value={`item-${customer.id}`}
                                className="w-full"
                              >
                                <AccordionTrigger key={customer.id}>
                                  <div className="flex h-10 w-full hover:cursor-pointer items-center">
                                    <div className="sm:p-4 w-full min-w-64 text-left">
                                      <div>{customer.user.name}</div>
                                      <div className="text-sm text-muted-foreground break-words">
                                        {customer.user.email}
                                      </div>
                                    </div>
                                    <div className="w-full font-medium text-left">
                                      Appsplix Developers
                                    </div>
                                    <div className=" w-full font-medium text-center">
                                      {customer.totalOrders}
                                    </div>
                                    <div className="w-full font-medium text-right">
                                      {customer.totalSpentsFormatted}
                                    </div>
                                    <div className="w-full max-w-12" />
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  {customer.topBrands.map((brand) => (
                                    <div className="flex h-10 w-full hover:cursor-pointer items-center">
                                      <div className="sm:p-4 w-full min-w-64 text-left">
                                        <img
                                          src={brand.imageUrl}
                                          alt={brand.brand}
                                          className="rounded-full"
                                          width={120}
                                        />
                                      </div>

                                      <div className="w-full  font-medium text-left ">
                                        {brand.brand}
                                      </div>

                                      <div className="w-full font-medium text-center">
                                        {brand.quantity}
                                      </div>

                                      <div className="w-full font-medium text-right">
                                        {brand.totalSpentFormatted}
                                      </div>
                                      <div className="w-full max-w-16" />
                                    </div>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ))}
                        </div>

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

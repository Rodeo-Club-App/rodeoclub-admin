import {
  File,
  Loader2,
  MoreHorizontal,
  Plus,
  PlusCircle,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

import { formatDate } from "@/utils/format-iso-date";

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

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import { AppLayout } from "../_layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ICustomer {
  id: number;
  name: string;
  email: string;
  cpf: string;
  partner: string;
  createdAt: string;
  invitedAt: string | null;
}

export const CustomersList: ICustomer[] = [
  {
    id: 1,
    name: "Guilherme Silva",
    email: "guilherme.silva@email.com",
    cpf: "123.456.789-00",
    partner: "Aurora Due",
    createdAt: "2024-10-11",
    invitedAt: null,
  },
  {
    id: 2,
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    cpf: "987.654.321-00",
    partner: "Aurora Due",
    createdAt: "2023-09-05",
    invitedAt: "2023-09-05",
  },
  {
    id: 3,
    name: "João Souza",
    email: "joao.souza@email.com",
    cpf: "111.222.333-44",
    partner: "Aurora Due",
    createdAt: "2022-08-22",
    invitedAt: null,
  },
];

export function Customers() {
  const navigate = useNavigate();

  const [data, setData] = useState<ICustomer[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setTimeout(() => {
        setData(CustomersList);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  }

  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partnerId = searchParams.get("partnerId") || "";

  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const [isExporting, setIsExporting] = useState(false);

  const [debouncedSearchQuery] = useDebounce(search, 500);

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
          className={
            "md:grid flex-1 items-start gap-4 md:p-4 sm:px-6 sm:py-0 md:gap-8"
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

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 gap-1 text-sm mr-1"
                    disabled={isExporting}
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only md:not-sr-only">Exportar</span>
                    {isExporting && (
                      <Loader2 className="animate-spin w-4 h-4" />
                    )}
                  </Button>

                  <Button onClick={() => navigate("/customers/new")}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Cadastrar
                    </span>
                  </Button>
                </div>
              </div>

              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/*  {isLoading || isRefetching ? (
                      <ListSkeletonTable rows={limit} />
                    ) : ( */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="sm:table-cell">CPF</TableHead>

                          <TableHead className="sm:table-cell">
                            Parceiro
                          </TableHead>
                          <TableHead className="w-64 md:table-cell">
                            Data (Registro no APP)
                          </TableHead>

                          <TableHead className="md:table-cell w-10 text-right">
                            <span className="sr-only">Ações</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              <div className="font-medium">{customer.name}</div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                {customer.email}
                              </div>
                            </TableCell>
                            <TableCell className="sm:table-cell">
                              <div className="font-medium text-xs sm:text-sm">
                                {customer.cpf}
                              </div>
                            </TableCell>

                            <TableCell className="hidden md:table-cell">
                              {customer.partner}
                            </TableCell>

                            <TableCell className="hidden md:table-cell">
                              {formatDate(customer.createdAt)}
                            </TableCell>

                            <TableCell className="md:table-cell text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      navigate(`/customers/${customer.id}`)
                                    }
                                  >
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer">
                                    Deletar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {/*        <div className="flex w-fulljustify-end px-8 py-6">
                    {orderList && (
                      <Pagination
                        currentPage={orderList.currentPage}
                        totalCount={orderList.count}
                        perPage={limit}
                        onPageChange={handlePaginate}
                      />
                    )}
                  </div> */}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </AppLayout>
    </div>
  );
}
import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  ArrowDownWideNarrow,
  File,
  Loader2,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
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

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useDebounce } from "use-debounce";
import { z } from "zod";
import { formatCentsToReal } from "@/utils/money";
import { formattedStock } from "@/utils/stock-enum";
import { ListSkeletonTable } from "@/components/skeleton-rows";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { listPartners } from "@/api/partners/list-partners";
import { format, formatDate, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { formatDateRange } from "@/utils/formatters";
import { PDFReport } from "./pdf-report";
import ReactPDF from "@react-pdf/renderer";
import * as XLSX from "xlsx";

export interface ProductReport {
  period: string;
  partner: string | null;
  total: string;
  products: IProduct[];
}

interface Image {
  imageUrl: string;
}

interface IProduct {
  id: number;
  name: string;
  externalId: string;
  stock: "instock" | "outofstock" | "onbackorder";
  category: {
    name: string;
  };
  price: string;
  priceCents: number;
  updatedAt: string;
  totalQuantitySold: number;
  totalSalesValue: number;
  images: Image[];
}

interface ProductsResponse {
  count: number;
  page: number;
  pageCount: number;
  data: IProduct[];
}

const stockColors = {
  instock: "bg-green-500 text-white",
  onbackorder: "bg-gray-500 text-white",
  outofstock: "bg-red-500 text-white",
};

export function Products() {
  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();
  const searchName = searchParams.get("searchName") || "";
  const [debouncedSearchQuery] = useDebounce(searchName, 500);

  const [isExporting, setIsExporting] = useState(false);

  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partnerId = searchParams.get("partnerId") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const orderType = searchParams.get("orderBy") || "totalSales";

  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const {
    data: products,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [
      "products",
      pageCount,
      limit,
      debouncedSearchQuery,
      partnerId,
      categoryId,
      startAt,
      endAt,
    ],
    queryFn: async () => {
      const response = await api.get<ProductsResponse>(
        `/products/rodeoclub/search`,
        {
          params: {
            page: pageCount,
            limit: limit,
            searchName: debouncedSearchQuery,
            onlyStock: false,
            ...(partnerId && { partnerId }),
            ...(categoryId && { categoryId }),
            ...(startAt && { startAt }),
            ...(endAt && { endAt }),
          },
        }
      );

      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  function handlePaginate(pageIndex: number) {
    setSearchParams((prev) => {
      prev.set("page", pageIndex.toString());

      return prev;
    });
  }

  const { data: partnersList, isLoading: isLoadingPartners } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  const { data: categories, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<{ id: number; name: string }[]>(
        "/category/rodeoclub"
      );

      return response.data;
    },
    staleTime: 15 * 60 * 1000,
  });

  const clearPartner = () => {
    setSearchParams((p) => {
      p.delete("partnerId");

      return p;
    });
  };

  const clearCategory = () => {
    setSearchParams((p) => {
      p.delete("categoryId");

      return p;
    });
  };

  const onSelectPartner = (id: string) => {
    setSearchParams((prev) => {
      prev.set("partnerId", id);
      return prev;
    });
  };

  const onSelectCategory = (id: string) => {
    setSearchParams((prev) => {
      prev.set("categoryId", id);
      return prev;
    });
  };

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

  const handleChangeOrderType = (
    type: "totalSales" | "totalOrders" | "name"
  ) => {
    setSearchParams((p) => {
      p.set("orderBy", type);

      return p;
    });
  };

  const sortedProducts = [...(products?.data || [])].sort((a, b) => {
    switch (orderType) {
      case "totalSales":
        return b.totalSalesValue - a.totalSalesValue;
      case "totalOrders":
        return b.totalQuantitySold - a.totalQuantitySold;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  async function handleExportReport(type: "pdf" | "excel") {
    setIsExporting(true);
    const data = {
      period: formatDateRange(startAt, endAt),
      partner: partnerId
        ? partnersList?.find((i) => i.id === Number(partnerId))?.name ?? ""
        : null,

      total: sortedProducts.length.toString(),
      products: sortedProducts,
    };

    if (type === "pdf") {
      const pdf = <PDFReport data={data} />;

      const blob = await ReactPDF.pdf(pdf).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }

    if (type === "excel") {
      const rows = [];

      rows.push([
        "Produto",
        "Categoria",
        "Valor Un.",
        "Qtd. vendas",
        "Total vendido",
      ]);

      data.products.forEach((product) => {
        const row = [
          product.name,
          product.category.name,
          formatCentsToReal(product.priceCents),
          product.totalQuantitySold,
          formatCentsToReal(product.totalSalesValue),
        ];

        rows.push(row);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

      const excelFilename = `relatorio_de_produtos.xlsx`;

      XLSX.writeFile(workbook, excelFilename);
    }

    setIsExporting(false);
  }

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
                    value={searchName}
                    onChange={(event) =>
                      setSearchParams((p) => {
                        p.set("searchName", event.target.value);
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

                  <div className="flex mr-1">
                    <Select
                      value={categoryId || ""}
                      onValueChange={(e) => onSelectCategory(e)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {!isLoadingCategory &&
                          categories?.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={String(category.id)}
                              className="cursor-pointer"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                      {categoryId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={clearCategory}
                          className="w-8 h-8 hover:text-red-500 mx-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </Select>
                  </div>

                  <div className="flex">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                          <ArrowDownWideNarrow className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Ordenar por
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={orderType === "totalOrders"}
                          onClick={() => handleChangeOrderType("totalOrders")}
                        >
                          Qtd. vendas
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={orderType === "totalSales"}
                          onClick={() => handleChangeOrderType("totalSales")}
                        >
                          Total vendido
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={orderType === "name"}
                          onClick={() => handleChangeOrderType("name")}
                        >
                          Nome
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="ml-1 flex">
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
              </div>
              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>Gerencie seus produtos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading || isRefetching ? (
                      <ListSkeletonTable rows={limit} />
                    ) : (
                      <ScrollArea>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead></TableHead>
                              <TableHead className="">Nome</TableHead>

                              <TableHead>ID</TableHead>
                              <TableHead className="">Valor UN.</TableHead>
                              <TableHead className="">Estoque</TableHead>
                              <TableHead className="">Qtd. vendas</TableHead>
                              <TableHead className="">Total vendido</TableHead>
                              <TableHead className="">Atualizado em</TableHead>

                              <TableHead className="w-10 text-right">
                                <span className="sr-only">Ações</span>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <img
                                    src={product.images[0].imageUrl}
                                    alt={product.name}
                                    className="min-w-24 min-h-24 max-w-24 h-24 object-contain rounded-sm"
                                  />
                                </TableCell>
                                <TableCell className="text-sm font-medium pr-4 max-w-56">
                                  {product.name}

                                  <p className="text-sm text-muted-foreground">
                                    {product.category.name}
                                  </p>
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {product.externalId}
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {formatCentsToReal(product.priceCents)}
                                </TableCell>

                                <TableCell className="">
                                  <Badge
                                    className={`text-xs font-medium pb-1 cursor-default hover:bg-${
                                      stockColors[product.stock]
                                    } ${stockColors[product.stock]} `}
                                  >
                                    {formattedStock[product.stock]}
                                  </Badge>
                                </TableCell>

                                <TableCell className="font-medium ">
                                  {product.totalQuantitySold}
                                </TableCell>

                                <TableCell className="font-medium ">
                                  {formatCentsToReal(product.totalSalesValue)}
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {formatDate(
                                    new Date(product.updatedAt),
                                    "dd/MM/yyyy"
                                  )}
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
                                        <span className="sr-only">
                                          Toggle menu
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Ações
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem className="cursor-pointer">
                                        Sincronizar produto
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
                    {products && (
                      <Pagination
                        currentPage={products.page}
                        totalCount={products.count}
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

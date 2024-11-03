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

import { ListSkeletonTable } from "@/components/skeleton-rows";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { api } from "@/services/api";
import { formatCentsToReal } from "@/utils/money";
import { formattedStock } from "@/utils/stock-enum";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { DataFilters } from "./data-filters";

export interface ProductReport {
  period: string;
  partner: string | null;
  total: string;
  products: IProduct[];
}

interface Image {
  imageUrl: string;
}

export interface IProduct {
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
  const [searchParams] = useSearchParams();
  const searchName = searchParams.get("searchName") || "";
  const [debouncedSearchQuery] = useDebounce(searchName, 500);

  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partners = searchParams.get("partners") || "";
  const categories = searchParams.get("categories") || "";
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
      partners,
      categories,
      startAt,
      endAt,
    ],
    queryFn: async () => {
      const response = await api.post<ProductsResponse>(
        `/products/rodeoclub/search`,
        {
          searchName: debouncedSearchQuery,
          ...(partners !== "" && {
            partnerIds: partners?.split(",").map((id) => Number(id.trim())),
          }),
          ...(categories !== "" && {
            categoriesId: categories?.split(",").map((id) => Number(id.trim())),
          }),

          // ...(categoryId && { categoryId }),
          ...(startAt && { startAt }),
          ...(endAt && { endAt }),
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

  // function handlePaginate(pageIndex: number) {
  //   setSearchParams((prev) => {
  //     prev.set("page", pageIndex.toString());

  //     return prev;
  //   });
  // }

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
              <DataFilters products={sortedProducts} />
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
                                    className="min-w-24 max-w-24 object-contain rounded-sm"
                                  />
                                </TableCell>
                                <TableCell className="text-sm font-medium pr-4 max-w-56">
                                  {product.name}

                                  <p className="min-w-36 text-sm text-muted-foreground">
                                    {product.category.name}
                                  </p>
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {product.externalId}
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {formatCentsToReal(product.priceCents)}
                                </TableCell>

                                <TableCell className="min-w-36">
                                  <Badge
                                    className={`text-sm font-medium pb-1 cursor-default hover:bg-${
                                      stockColors[product.stock]
                                    } ${stockColors[product.stock]} `}
                                  >
                                    {formattedStock[product.stock]}
                                  </Badge>
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {product.totalQuantitySold}
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {formatCentsToReal(product.totalSalesValue)}
                                </TableCell>

                                <TableCell className="min-w-32 text-sm font-medium">
                                  {formatDate(
                                    new Date(product.updatedAt),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </TableCell>

                                <TableCell className=" w-10 text-right">
                                  {/* <DropdownMenu>
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
                                  </DropdownMenu> */}
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
                    <span className="text-sm text-muted-foreground">
                      Total de {products?.count} item(s)
                    </span>
                    {/* {products && (
                      <Pagination
                      
                        currentPage={products.page}
                        totalCount={products.count}
                        perPage={limit}
                        onPageChange={handlePaginate}
                      />
                    )} */}
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

import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { MoreHorizontal, Search } from "lucide-react";
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

import { formatDate } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  images: Image[];
}

interface ProductsResponse {
  count: number;
  page: number;
  pageCount: number;
  data: IProduct[];
}

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchName = searchParams.get("searchName") || "";
  const [debouncedSearchQuery] = useDebounce(searchName, 500);

  const pageCount = z.coerce.number().parse(searchParams.get("page") ?? "1");
  const limit = z.coerce.number().parse(searchParams.get("limit") ?? "10");

  const {
    data: products,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["products", pageCount, limit, debouncedSearchQuery],
    queryFn: async () => {
      const response = await api.get<ProductsResponse>(`/products/rodeoclub`, {
        params: {
          page: pageCount,
          limit: limit,
          searchName: debouncedSearchQuery,
          onlyStock: false,
        },
      });

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
              </div>
              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>Gerencie seus produtos </CardDescription>
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
                              <TableHead className="">Valor</TableHead>
                              <TableHead className="">Estoque</TableHead>
                              <TableHead className="">Atualizado em</TableHead>

                              <TableHead className="w-10 text-right">
                                <span className="sr-only">Ações</span>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products?.data.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <img
                                    src={product.images[0].imageUrl}
                                    alt={product.name}
                                    className="min-w-24 min-h-24 max-w-24 h-24 object-contain rounded-sm"
                                  />
                                </TableCell>
                                <TableCell className="text-sm font-medium pr-4 min-w-40">
                                  {product.name}
                                </TableCell>

                                <TableCell className="text-sm font-medium">
                                  {product.externalId}
                                </TableCell>

                                <TableCell className="text-sm font-medium  p-4">
                                  {formatCentsToReal(product.priceCents)}
                                </TableCell>

                                <TableCell className="text-sm font-medium  p-4">
                                  {formattedStock[product.stock]}
                                </TableCell>

                                <TableCell className="text-sm font-medium  p-4">
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

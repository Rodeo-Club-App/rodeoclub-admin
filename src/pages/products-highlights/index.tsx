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
import { ChevronUp, CircleMinus, Loader2 } from "lucide-react";
import { AppLayout } from "../_layout";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { formattedStock } from "@/utils/stock-enum";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";

interface IProduct {
  id: number;
  name: string;
  stock: "instock" | "outofstock" | "onbackorder";
  category: {
    name: string;
  };
  position: number | null;

  price: string;
  updatedAt: string;
  imageUrl: string;
  isHighlighted: boolean;
}

const stockColors = {
  instock: "bg-green-500 text-white",
  onbackorder: "bg-gray-500 text-white",
  outofstock: "bg-red-500 text-white",
};

export function ProductsHighlights() {
  const { toast } = useToast();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const response = await api.get<IProduct[]>(
      `/home/rodeoclub/product-highlights`
    );

    setProducts(response.data);
  }

  const handleUpdateProduct = (action: "add" | "remove", product: IProduct) => {
    setProducts((prevProducts) => {
      if (action === "add") {
        // Primeiro, destacamos o produto e definimos a posição como 1
        const updatedProducts = prevProducts.map((p) => {
          if (p.id === product.id) {
            return { ...p, isHighlighted: true, position: 1 }; // Destaca o produto
          }
          return p;
        });

        // Agora, aumentamos a posição de todos os produtos destacados
        return updatedProducts
          .map((p) => {
            if (p.isHighlighted && p.id !== product.id) {
              return { ...p, position: (p.position || 0) + 1 }; // Aumenta a posição dos destacados
            }
            return p;
          })
          .sort((a, b) => {
            return (
              (a.position === null ? Infinity : a.position) -
              (b.position === null ? Infinity : b.position)
            );
          });
      } else if (action === "remove") {
        // Remove o destaque do produto e define a posição como null
        return prevProducts
          .map((p) => {
            if (p.id === product.id) {
              return { ...p, isHighlighted: false, position: null }; // Remove o destaque
            }
            return p;
          })
          .sort((a, b) => {
            return (
              (a.position === null ? Infinity : a.position) -
              (b.position === null ? Infinity : b.position)
            );
          });
      }

      return prevProducts; // Retorna os produtos inalterados se nenhuma ação válida for fornecida
    });
  };
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedProducts = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setProducts(updatedProducts);
  };

  async function handleSave() {
    try {
      setLoading(true);

      await api.put(
        "home/rodeoclub/product-highlights",
        products.map((i) => ({
          productId: i.id,
          position: i.position,
          isHighlighted: i.isHighlighted,
        }))
      );
      toast({ variant: "success", title: "Posições alteradas" });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({ variant: "destructive", title: "Falha ao atualizar posições" });
    }
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
              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7 flex sm:flex-row w-full justify-between items-center">
                    <div className="flex flex-col items-center sm:items-start mb-3 sm:mb-0 mr-5">
                      <CardTitle className="text-lg sm:text-2xl">
                        Produtos em destaque
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mb-0 text-center sm:text-left">
                        Gerencie os produtos em destaques, definindo ordenações
                        e escolhendo seus itens
                      </CardDescription>
                    </div>
                    <Button
                      disabled={loading}
                      onClick={handleSave}
                      variant="outline"
                    >
                      {loading && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      )}
                      Salvar alterações
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* {isLoading || isRefetching ? (
                      <ListSkeletonTable rows={10} />
                    ) : ( */}
                    <ScrollArea>
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead className="pl-5 sm:pl-0">Nome</TableHead>
                                    <TableHead className="">Estoque</TableHead>
                                    <TableHead className="w-10">
                                      <span className="">Destacado</span>
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {products?.map((product, index) => (
                                    <Draggable
                                      key={String(product.id)}
                                      draggableId={String(product.id)}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <TableRow
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <TableCell>
                                            <img
                                              src={product.imageUrl}
                                              alt={product.name}
                                              className="min-w-24 max-w-24 object-contain rounded-sm"
                                            />
                                          </TableCell>
                                          <TableCell className="pl-5 sm:pl-0 text-sm font-medium pr-4 min-w-56">
                                            {product.name}
                                            <p className="text-sm text-muted-foreground">
                                              {product.category.name}
                                            </p>
                                          </TableCell>
                                          <TableCell className="min-w-36">
                                            <Badge
                                              className={`text-xs font-medium pb-1 cursor-default hover:bg-${
                                                stockColors[product.stock]
                                              } ${stockColors[product.stock]}`}
                                            >
                                              {formattedStock[product.stock]}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="md:table-cell min-w-36">
                                            {product.isHighlighted ? (
                                              <Button
                                                size="sm"
                                                className="text-sm"
                                                variant="destructive"
                                                onClick={() =>
                                                  handleUpdateProduct(
                                                    "remove",
                                                    product
                                                  )
                                                }
                                              >
                                                <CircleMinus className="w-3.5 h-3.5 mr-1" />
                                                Remover destaque
                                              </Button>
                                            ) : (
                                              <Button
                                                size="sm"
                                                className="text-sm bg-blue-500 text-white"
                                                variant="outline"
                                                onClick={() =>
                                                  handleUpdateProduct(
                                                    "add",
                                                    product
                                                  )
                                                }
                                              >
                                                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                                                Destacar
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </Draggable>
                                  ))}
                                </TableBody>
                              </Table>
                              {provided.placeholder}{" "}
                              {/* Necessário para manter o espaço enquanto arrasta */}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    {/* )} */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </AppLayout>
    </div>
  );
}

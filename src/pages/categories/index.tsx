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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { AppLayout } from "../_layout";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import { SubCategoriesGroup } from "../products/data-filter-category";

interface ISubCategory {
  id: number;
  name: string;
  slug: string;

  position: number | null;
  imageUrl: string;
  isVisible: boolean;
}

export function Categories() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<ISubCategory[]>([]);
  const [groups, setGroups] = useState<SubCategoriesGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  async function fetchSubCategories() {
    const response = await api.get<ISubCategory[]>(`/sub-category/rodeoclub`);
    const responseGroups = await api.get<SubCategoriesGroup[]>(
      "/category/rodeoclub/groups"
    );

    setBrands(response.data);
    setGroups(responseGroups.data);
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(brands);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updateds = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setBrands(updateds);
  };

  const onDragEndGroup = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedGroups = [...groups];

    const groupIndex = updatedGroups.findIndex(
      (group) => group.id === Number(source.droppableId.split("-")[1])
    );

    const [movedSubCategory] = updatedGroups[groupIndex].subCategories.splice(
      source.index,
      1
    );

    updatedGroups[groupIndex].subCategories.splice(
      destination.index,
      0,
      movedSubCategory
    );

    updatedGroups[groupIndex].subCategories.forEach((subCategory, index) => {
      subCategory.positionGroup = index;
    });

    setGroups(updatedGroups);
  };

  async function handleSave() {
    try {
      setLoading(true);

      await api.put(
        "sub-category/rodeoclub/positions",
        brands.map((i) => ({
          subCategoryId: i.id,
          position: i.position,
          isVisible: i.isVisible,
        }))
      );
      toast({ variant: "success", title: "Posições alteradas" });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({ variant: "destructive", title: "Falha ao atualizar posições" });
    }
  }

  async function handleSaveGroups() {
    try {
      setLoading(true);

      await api.put(
        "category/rodeoclub/groups/positions",
        groups.flatMap((group) =>
          group.subCategories.map((subCategory) => ({
            subCategoryId: subCategory.id,
            positionGroup: subCategory.positionGroup,
          }))
        )
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
            <Tabs defaultValue="categories">
              <TabsList>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
                <TabsTrigger value="groups">Grupos</TabsTrigger>
              </TabsList>
              <TabsContent value="categories">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7 flex sm:flex-row w-full justify-between items-center">
                    <div className="flex flex-col items-center sm:items-start mb-3 sm:mb-0 mr-5">
                      <CardTitle className="text-lg sm:text-2xl">
                        Categorias
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mb-0 text-center sm:text-left">
                        Gerencie as categorias, definindo ordenações{" "}
                      </CardDescription>
                      <strong>
                        As alterações serão espelhadas na tela Home do
                        Aplicativo
                      </strong>
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
                                    <TableHead className="pl-5 sm:pl-0">
                                      Nome
                                    </TableHead>
                                    {/* <TableHead className="w-10">
                                      <span className="">Visível?</span>
                                    </TableHead> */}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {brands?.map((brand, index) => (
                                    <Draggable
                                      key={String(brand.id)}
                                      draggableId={String(brand.id)}
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
                                              src={brand.imageUrl}
                                              alt={brand.name}
                                              className="min-w-24 max-w-24 object-contain rounded-sm"
                                            />
                                          </TableCell>
                                          <TableCell className="pl-5 sm:pl-0 text-sm font-medium pr-4 min-w-56">
                                            {brand.name}
                                          </TableCell>

                                          {/* <TableCell className="md:table-cell min-w-36">
                                            <Button
                                              size="sm"
                                              className="text-sm"
                                              variant="ghost"
                                              onClick={() =>
                                                toggleVisible(brand)
                                              }
                                            >
                                              {brand.isVisible ? (
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                              ) : (
                                                <EyeOff className="w-3.5 h-3.5 mr-1" />
                                              )}
                                            </Button>
                                          </TableCell> */}
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

              <TabsContent value="groups">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7 flex sm:flex-row w-full justify-between items-center">
                    <div className="flex flex-col items-center sm:items-start mb-3 sm:mb-0 mr-5">
                      <CardTitle className="text-lg sm:text-2xl"></CardTitle>
                      <CardDescription className="mt-1 sm:mb-0 text-center sm:text-left">
                        Gerencie a ordem de exibição das marcas dentro da
                        categoria
                      </CardDescription>
                      <strong>
                        As alterações serão espelhadas na tela de Marcas do
                        aplicativo
                      </strong>
                    </div>
                    <Button
                      disabled={loading}
                      onClick={handleSaveGroups}
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
                      <DragDropContext onDragEnd={onDragEndGroup}>
                        {groups.map((group) => (
                          <Droppable
                            key={group.id}
                            droppableId={`droppable-${group.id}`}
                          >
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                <Card className="mb-10">
                                  <CardHeader>
                                    <CardTitle>{group.group}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead></TableHead>
                                          <TableHead className="pl-5 sm:pl-0">
                                            Nome
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {group.subCategories.map(
                                          (subCategory, index) => (
                                            <Draggable
                                              key={String(subCategory.id)}
                                              draggableId={`draggable-${subCategory.id}`}
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
                                                      src={subCategory.imageUrl}
                                                      alt={subCategory.name}
                                                      className="min-w-24 max-w-24 object-contain rounded-sm"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="pl-5 sm:pl-0 text-sm font-medium pr-4 min-w-56">
                                                    {subCategory.name}
                                                  </TableCell>
                                                </TableRow>
                                              )}
                                            </Draggable>
                                          )
                                        )}
                                      </TableBody>
                                    </Table>
                                    {provided.placeholder}{" "}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Droppable>
                        ))}
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

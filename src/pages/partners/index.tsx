import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "../_layout";

import { listPartners } from "@/api/partners/list-partners";
import { ListSkeletonTable } from "@/components/skeleton-rows";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { useRef } from "react";
import {
  PartnerFormModal,
  PartnerFormModalRef,
} from "@/components/modals/partner-form-modal";

export function Partners() {
  const partnerFormModalRef = useRef<PartnerFormModalRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchName = searchParams.get("searchName") || "";
  const [debouncedSearchQuery] = useDebounce(searchName, 500);

  const {
    data: partnersList,
    isLoading: isLoadingPartners,
    isRefetching,
  } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
  });

  const filteredPartners = partnersList?.filter((partner) =>
    partner.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  return (
    <>
      <PartnerFormModal ref={partnerFormModalRef} />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <AppLayout>
          <main
            className={
              "lg:grid flex-1 items-start gap-4 md:p-4 sm:px-6 sm:py-0 md:gap-8"
            }
          >
            <div className="lg:grid auto-rows-max items-start gap-4 md:gap-8 w-full">
              <Tabs defaultValue="tab_1">
                <div className="flex flex-col md:flex-row lg:items-center gap-2 md:gap-0 justify-between">
                  <div className="relative lg:mr-2 md:grow-0 w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome..."
                      className="pl-8 pr-4 py-2 w-full md:w-auto lg:w-[336px]  rounded-lg bg-background"
                      value={searchName}
                      onChange={(event) =>
                        setSearchParams((p) => {
                          p.set("searchName", event.target.value);
                          return p;
                        })
                      }
                    />
                  </div>

                  <Button
                    onClick={() => partnerFormModalRef.current?.openModal()}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </div>
                <TabsContent value="tab_1">
                  <Card x-chunk="dashboard-05-chunk-3">
                    <CardHeader className="px-7">
                      <CardTitle>Parceiros</CardTitle>
                      <CardDescription>
                        Gerencie seus parceiros.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPartners || isRefetching ? (
                        <ListSkeletonTable rows={10} />
                      ) : (
                        <ScrollArea>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="">Nome</TableHead>

                                <TableHead className="">CNPJ</TableHead>

                                <TableHead className="w-10 text-right">
                                  <span className="sr-only">Ações</span>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredPartners?.map((partner) => (
                                <TableRow
                                  className="hover:cursor-pointer"
                                  key={partner.id}
                                  onClick={() =>
                                    partnerFormModalRef.current?.openModal(
                                      partner.id
                                    )
                                  }
                                >
                                  <TableCell className="text-sm font-medium pr-4 max-w-56">
                                    {partner.name}
                                  </TableCell>

                                  <TableCell className="text-sm font-medium">
                                    {partner.cnpj}
                                  </TableCell>

                                  <TableCell className=" w-10 text-right">
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
                                          Editar
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
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </AppLayout>
      </div>
    </>
  );
}

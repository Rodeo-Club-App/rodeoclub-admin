import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListSkeletonTable } from "@/components/skeleton-rows";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import {
  SearchUsersModal,
  SearchUsersModalRef,
} from "@/components/modals/search-users-modal";
import { useToast } from "@/hooks/use-toast";
import {
  DeleteUserAdminModal,
  DeleteUserAdminModalRef,
} from "@/components/modals/delete-user-admin-modal";
import { useUserAuth } from "@/hooks/useUserAuth";

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
}

export function UserAdmin() {
  const { user } = useUserAuth();
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const queryClient = useQueryClient();
  const searchUsersModalRef = useRef<SearchUsersModalRef>(null);
  const deleteUserAdminModalRef = useRef<DeleteUserAdminModalRef>(null);
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["user-admin"],
    queryFn: async () => {
      const response = await api.get<Member[]>("/members/rodeoclub");

      return response.data;
    },
  });

  async function handleRemoveAdmin(id: string) {
    try {
      setIsRemoving(true);
      await api.delete(`/members/rodeoclub/${id}`);

      queryClient.refetchQueries({
        queryKey: ["user-admin"],
      });
      setIsRemoving(false);

      deleteUserAdminModalRef.current?.hide();
    } catch (error) {
      setIsRemoving(false);

      toast({
        title: "Erro",
        //@ts-ignore
        description: error.message,
        variant: "destructive",
      });
    }
  }
  return (
    <>
      <SearchUsersModal ref={searchUsersModalRef} />
      <DeleteUserAdminModal
        ref={deleteUserAdminModalRef}
        isLoading={isRemoving}
        onConfirm={handleRemoveAdmin}
      />
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
                <TabsContent value="week">
                  <Card x-chunk="dashboard-05-chunk-3">
                    <CardHeader className="px-7">
                      <div className="w-full flex items-center justify-between">
                        <CardTitle>Usuários administradores</CardTitle>
                        <Button
                          onClick={() =>
                            searchUsersModalRef.current?.openModal(
                              data?.map((i) => i.id)
                            )
                          }
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Adicionar
                          </span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading || isRefetching ? (
                        <ListSkeletonTable rows={10} />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>

                              <TableHead className="md:table-cell w-10 text-right">
                                <span className="sr-only">Ações</span>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data?.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell className="font-medium text-xs sm:text-sm">
                                  <div className="font-medium">
                                    {member.name}
                                  </div>
                                  <div className="hidden text-sm text-muted-foreground md:inline">
                                    {member.email}
                                  </div>
                                </TableCell>

                                <TableCell className="md:table-cell text-right">
                                  {user?.id !== member.userId && (
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        deleteUserAdminModalRef.current?.openModal(
                                          member.id
                                        )
                                      }
                                    >
                                      Remover
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
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

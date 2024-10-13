import { useImperativeHandle, forwardRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { CustomerResponse } from "@/pages/customers";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Loader, Search } from "lucide-react";
import { Input } from "../ui/input";
import { toast } from "@/hooks/use-toast";

interface SearchUsersModalProps {}

export interface SearchUsersModalRef {
  openModal: (excludeUserIds?: string[]) => void;
}

export const SearchUsersModal = forwardRef<
  SearchUsersModalRef,
  SearchUsersModalProps
>(({}, ref) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const search = searchParams.get("search") || "";

  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [debouncedSearchQuery] = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["users-search", debouncedSearchQuery],
    enabled: isOpen === true && search !== undefined,
    queryFn: async () => {
      const response = await api.post<CustomerResponse>(
        "/user/rodeoclub/search",
        {
          ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
          excludeIds: excludeIds,
        },
        {
          params: {
            page: 1,
            limit: 7,
          },
        }
      );

      return response.data;
    },
  });

  useImperativeHandle(ref, () => ({
    openModal: (excludeUserIds?: string[]) => {
      setExcludeIds(excludeUserIds ?? []);
      setIsOpen(true);
    },
  }));

  const closeModal = () => {
    setSelectedMember(null);

    setIsOpen(false);

    setSearchParams((p) => {
      p.delete("search");

      return p;
    });
  };

  const onSelectUser = (id: string, name: string) => {
    setSelectedMember({
      id,
      name,
    });
  };

  async function handleAddAdmin() {
    try {
      await api.post("/members/rodeoclub", {
        userId: selectedMember?.id,
      });

      queryClient.refetchQueries({
        queryKey: ["user-admin"],
      });

      setSelectedMember(null);

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        //@ts-ignore
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Adicionar um novo administrador</DialogTitle>
        <ScrollArea className="sm:max-w-2xl m-2">
          <div className="grid gap-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Procure por usuários..."
                value={search}
                onChange={(event) =>
                  setSearchParams((p) => {
                    p.set("search", event.target.value);
                    return p;
                  })
                }
                className="pl-8 w-[250px] ml-2"
              />
            </div>
            {isLoading ? (
              <div className="text-center flex items-center gap-2 justify-center">
                Pesquisando <Loader className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <ul className="max-h-[300px] overflow-auto">
                {!!search &&
                  data?.users.map((user) => (
                    <li
                      key={user.id}
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                      onClick={() => onSelectUser(user.id, user.name)}
                    >
                      {user.name}
                      <p className="text-muted-foreground">{user.email}</p>
                    </li>
                  ))}
              </ul>
            )}
            {!isLoading && data?.users.length === 0 && search && (
              <div className="text-center text-gray-500">
                Nenhum usuário encontrado
              </div>
            )}

            {selectedMember && <p>{selectedMember.name} selecionado</p>}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleAddAdmin}
            disabled={!selectedMember}
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

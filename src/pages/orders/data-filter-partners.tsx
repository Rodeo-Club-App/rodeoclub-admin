import { useQuery } from "@tanstack/react-query";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
  Command,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { listPartners } from "@/api/partners/list-partners";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlusCircleIcon } from "lucide-react";

export function DataFilterPartners() {
  const [searchParams, setSearchParams] = useSearchParams();

  const partners = searchParams.get("partners");

  const selectedPartners = new Set(partners?.split(","));

  const { data: partnersList } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  function clearPartners() {
    setSearchParams((prev) => {
      prev.delete("partners");

      return prev;
    });
  }

  function handleFilterPartner(partnerId: number) {
    setSearchParams((prev) => {
      if (!partners?.includes(String(partnerId))) {
        let newPartners = partners || "";
        searchParams.set(
          "partners",
          (newPartners += (newPartners?.length > 0 ? "," : "") + partnerId)
        );
      } else {
        setSearchParams((prev) => {
          const newIds = removePartnerId(partners, String(partnerId));

          if (newIds === "") {
            prev.delete("partners");
          } else {
            prev.set("partners", newIds);
          }

          return prev;
        });
      }

      return prev;
    });
  }

  function removePartnerId(current: string, partnerId: string) {
    let ids = current.split(",");
    const index = ids.indexOf(partnerId.toString());

    if (index !== -1) {
      ids.splice(index, 1);
    }

    const newPartners = ids.join(",");

    return newPartners;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Parceiro
          {selectedPartners?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedPartners.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedPartners.size > 1 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedPartners.size} selecionados
                  </Badge>
                ) : (
                  partnersList
                    ?.filter((option) =>
                      selectedPartners.has(String(option.id))
                    )
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.id}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.name}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Parceiro" />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {partnersList?.map((option) => {
                const isSelected = selectedPartners.has(String(option.id));
                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => {
                      handleFilterPartner(option.id);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>

                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedPartners.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearPartners}
                    className="justify-center text-center"
                  >
                    Limpar
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

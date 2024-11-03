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
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlusCircleIcon } from "lucide-react";
import { formattedStatus, statusList } from "@/utils/status-enum";

export function DataFilterStatus() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status");

  const selectedStatus = new Set(status?.split(","));

  function clearStatus() {
    setSearchParams((prev) => {
      prev.delete("status");

      return prev;
    });
  }

  function handleFilterStatus(statusKey: string) {
    setSearchParams((prev) => {
      if (!status?.includes(String(statusKey))) {
        let newStatus = status || "";
        searchParams.set(
          "status",
          (newStatus += (newStatus?.length > 0 ? "," : "") + statusKey)
        );
      } else {
        setSearchParams((prev) => {
          const newIds = removeStatusKey(status, statusKey);

          if (newIds === "") {
            prev.delete("status");
          } else {
            prev.set("status", newIds);
          }

          return prev;
        });
      }

      return prev;
    });
  }

  function removeStatusKey(current: string, statusKey: string) {
    let ids = current.split(",");
    const index = ids.indexOf(statusKey.toString());

    if (index !== -1) {
      ids.splice(index, 1);
    }

    const newStatus = ids.join(",");

    return newStatus;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Status
          {selectedStatus?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedStatus.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedStatus.size > 1 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedStatus.size} selecionados
                  </Badge>
                ) : (
                  statusList
                    ?.filter((option) => selectedStatus.has(String(option.key)))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.key}
                        className="rounded-sm px-1 font-normal"
                      >
                        {formattedStatus[option.key]}
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
          <CommandInput placeholder="Status" />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {statusList?.map((option) => {
                const isSelected = selectedStatus.has(String(option.key));
                return (
                  <CommandItem
                    key={option.key}
                    onSelect={() => {
                      handleFilterStatus(option.key);
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

                    <span>{formattedStatus[option.key]}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedStatus.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearStatus}
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

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
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlusCircleIcon } from "lucide-react";
import { api } from "@/services/api";

export interface SubCategoriesGroup {
  id: number;
  group: string;
  position: number;
  subCategories: {
    id: number;
    name: string;
    imageUrl: string;
    positionGroup: number;
  }[];
}

export function DataFilterCategory() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = searchParams.get("categories");

  const selectedCategories = new Set(categories?.split(","));

  const { data: categoriesList } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<SubCategoriesGroup[]>(
        "/category/rodeoclub/groups"
      );

      return response.data;
    },
    staleTime: 15 * 60 * 1000,
  });

  function clearCategories() {
    setSearchParams((prev) => {
      prev.delete("categories");

      return prev;
    });
  }

  function handleFilterCategory(categoryId: number) {
    setSearchParams((prev) => {
      if (!categories?.includes(String(categoryId))) {
        let newCategories = categories || "";
        searchParams.set(
          "categories",
          (newCategories += (newCategories?.length > 0 ? "," : "") + categoryId)
        );
      } else {
        setSearchParams((prev) => {
          const newIds = removeCategoryId(categories, String(categoryId));

          if (newIds === "") {
            prev.delete("categories");
          } else {
            prev.set("categories", newIds);
          }

          return prev;
        });
      }

      return prev;
    });
  }

  function removeCategoryId(current: string, categoryId: string) {
    let ids = current.split(",");
    const index = ids.indexOf(categoryId.toString());

    if (index !== -1) {
      ids.splice(index, 1);
    }

    const newCategories = ids.join(",");

    return newCategories;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Marcas
          {selectedCategories?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedCategories.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedCategories.size > 1 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedCategories.size} selecionados
                  </Badge>
                ) : (
                  categoriesList
                    ?.flatMap((option) => option.subCategories)
                    ?.filter((option) =>
                      selectedCategories.has(String(option.id))
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
          <CommandInput placeholder="Marca" />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {/* {categoriesList?.map((option) => {
                const isSelected = selectedCategories.has(String(option.id));
                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => {
                      handleFilterCategory(option.id);
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

                    <span>{option.group}</span>
                  </CommandItem>
                );
              })} */}

              {categoriesList?.map((option) => (
                <div key={option.id} className="mb-2">
                  <span className="font-bold text-sm">{option.group}</span>
                  {option.subCategories.map((sub) => {
                    const isSelected = selectedCategories.has(String(sub.id));
                    return (
                      <CommandItem
                        key={sub.id}
                        onSelect={() => {
                          handleFilterCategory(sub.id); // Seleciona apenas a subcategoria
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
                        <span>{sub.name}</span>
                      </CommandItem>
                    );
                  })}
                </div>
              ))}
            </CommandGroup>
            {selectedCategories.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearCategories}
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

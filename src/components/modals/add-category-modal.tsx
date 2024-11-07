import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useState } from "react";
import { Loader2, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubCategoriesGroup } from "@/pages/products/data-filter-category";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
// interface UpdatePasswordModalProps {}

export interface UpdatePasswordModalRef {
  openModal: () => void;
}

const addCategorySchema = z.object({
  categoryId: z
    .string({
      required_error: "Insira um ID .",
    })
    .min(1, { message: "Insira um ID ." }),

  groupId: z.string().optional(),
});

interface CategoryFound {
  category: { name: string; id: number };
  existInDb: boolean;
}

type AddCategoryFormScehma = z.infer<typeof addCategorySchema>;

export function AddCategoryModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<CategoryFound | null>(null);
  const [loading, setLoading] = useState(false);

  const editModal = searchParams.get("newCategory");

  const open = editModal && editModal === "true" ? true : false;
  const { toast } = useToast();
  const form = useForm<AddCategoryFormScehma>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      categoryId: "",
    },
  });

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

  const closeModal = () => {
    form.reset({
      categoryId: "",
    });
    setSearchParams((p) => {
      p.delete("newCategory");

      return p;
    });
  };

  async function onSubmit(values: AddCategoryFormScehma) {
    const { categoryId } = values;
    try {
      const response = await api.get<CategoryFound>(
        `/sub-category/rodeoclub/${categoryId}`
      );

      setCategory(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        //@ts-ignore
        description: error.message,
      });
    }
  }

  async function handleSyncCategory() {
    setLoading(true);
    try {
      await api.patch(`/sub-category/rodeoclub/${category?.category.id}`, {
        groupId: form.getValues("groupId"),
      });

      toast({
        variant: "success",
        title: "Categoria adicionada com sucesso",
      });

      closeModal();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        //@ts-ignore
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar nova categoria</DialogTitle>
          <DialogDescription>
            Insira um ID válido do WooCommerce de uma categoria para poder
            adicionar
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="sm:grid sm:grid-cols-4 items-center gap-4">
                  <Label>ID</Label>
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {category && (
                <p>
                  Categoria encontrada:{" "}
                  <strong>{category?.category.name}</strong>
                  <FormField
                    control={form.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um grupo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesList?.map((group) => (
                              <SelectItem value={String(group.id)}>
                                {group.group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {category.existInDb && (
                    <p>
                      <strong className="font-bold text-red-500">
                        Esse ID de categoria já existe
                      </strong>
                    </p>
                  )}
                </p>
              )}
              <DialogFooter className="mt-3">
                {!form.watch("categoryId") ||
                !category ||
                category?.existInDb ? (
                  <Button disabled={form.formState.isSubmitting} type="submit">
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    )}
                    Pesquisar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={handleSyncCategory}
                    className="bg-green-500 hover:bg-green-700"
                  >
                    <RefreshCwIcon
                      className={cn(
                        "w-4 h-4 mr-2",
                        loading ? "animate-spin" : "animate-none"
                      )}
                    />
                    Adicionar
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

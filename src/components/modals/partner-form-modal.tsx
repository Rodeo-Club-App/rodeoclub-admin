import { forwardRef, useImperativeHandle, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { formatCNPJ } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import { IPartner } from "@/api/partners/list-partners";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";

const partnerSchema = z.object({
  name: z
    .string({
      required_error: "Insira o nome.",
    })
    .min(1, { message: "Insira o nome." }),
  cnpj: z.string().optional(),
});

type PartnerSchema = z.infer<typeof partnerSchema>;

interface PartnerFormModalProps {
  id?: string;
}

export interface PartnerFormModalRef {
  openModal: (id?: number) => void;
}

export const PartnerFormModal = forwardRef<
  PartnerFormModalRef,
  PartnerFormModalProps
>(({}, ref) => {
  const queryClient = useQueryClient();
  const [id, setId] = useState<number | null>(null);
  const { toast } = useToast();
  const form = useForm<PartnerSchema>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      cnpj: "",
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: (id?: number) => {
      if (id) setId(id);
      setIsOpen(true);
    },
  }));

  const { isLoading } = useQuery({
    queryKey: ["partner", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await api.get<IPartner>(`/partners/rodeoclub/${id}`);

      form.setValue("name", response.data.name);
      form.setValue("cnpj", response.data.cnpj ?? "");

      return response.data;
    },
  });

  const closeModal = () => {
    form.reset({
      name: "",
      cnpj: "",
    });
    setIsOpen(false);
  };

  async function onSubmit(values: PartnerSchema) {
    console.log(values);
    const { cnpj, name } = values;

    try {
      if (id) {
        await api.put(`/partners/rodeoclub/${id}`, {
          name,
          cnpj,
        });

        queryClient.invalidateQueries({
          queryKey: ["partner", id],
        });
      } else {
        await api.post("/partners/rodeoclub", {
          name,
          cnpj,
        });
      }

      toast({
        title: "Cadastro atualizado",
        variant: "success",
      });

      queryClient.refetchQueries({
        queryKey: ["partners"],
      });

      closeModal();
    } catch (error) {
      toast({
        title: "Falha ao realizar a gestão de parceiros",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{id ? "Editar" : "Cadastrar"}</DialogTitle>
          <DialogDescription>
            Preencha os campos do formulário para{" "}
            {id ? "editar parceiro" : "cadastrar um novo parceiro"}
          </DialogDescription>
        </DialogHeader>
        {!isLoading && (
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="sm:grid sm:grid-cols-4 items-center gap-4">
                    <Label>Nome do parceiro</Label>
                    <FormField
                      control={form.control}
                      name="name"
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
                  <div className="sm:grid sm:grid-cols-4 items-center gap-4">
                    <Label>CNPJ</Label>
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input
                              placeholder=""
                              {...field}
                              onChange={(e) => {
                                const formattedValue = formatCNPJ(
                                  e.target.value
                                );
                                field.onChange(formattedValue);
                              }}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={form.formState.isSubmitting} type="submit">
                    {form.formState.isLoading && (
                      <Loader className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

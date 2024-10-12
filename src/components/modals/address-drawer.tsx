import { forwardRef, useImperativeHandle, useState } from "react";

import { ScrollArea } from "../ui/scroll-area";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { formatCep, formatPhoneNumber } from "@/utils/formatters";
import { Switch } from "../ui/switch";

interface CepResponse {
  zipCode: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const addressSchema = z.object({
  id: z.string().optional().default(""),
  firstName: z
    .string({
      required_error: "Insira o nome.",
    })
    .min(1, { message: "Insira o nome." }),
  lastName: z
    .string({
      required_error: "Insira o sobrenome.",
    })
    .min(1, { message: "Insira o sobrenome." }),

  street: z
    .string({
      required_error: "Insira o nome da rua.",
    })
    .min(1, { message: "Insira o nome da rua." }),
  number: z
    .string({
      required_error: "Insira o número.",
    })
    .min(1, { message: "Insira o número." }),
  complement: z.string().optional().default(""),
  neighborhood: z
    .string({
      required_error: "Insira o nome do bairro.",
    })
    .min(1, { message: "Insira o nome do bairro." }),
  phone: z
    .string({ required_error: "Insira o telefone." })
    .refine((val) => val.replace(/\D/g, "").length >= 10, {
      message: "O telefone deve ter pelo menos 10 dígitos.",
    })
    .transform((val) => val.replace(/\D/g, "")),
  city: z
    .string({
      required_error: "Insira o nome da cidade.",
    })
    .min(1, { message: "Insira o nome da cidade." }),

  state: z
    .string({
      required_error: "Insira o nome do estado.",
    })
    .min(1, { message: "Insira o nome do estado." }),
  zipCode: z
    .string({
      required_error: "Insira o CEP.",
    })
    .min(8, { message: "O CEP informado é inválido." })
    .transform((val) => val.replace(/\D/g, "")),
  isDefault: z.boolean().optional().default(true),
});

type AddressSchema = z.infer<typeof addressSchema>;

interface AddressDrawerProps {
  id?: string;
  onAction: (address: ADDRESS_DTO, currentPosition?: number) => void;
}

export interface AddressDrawerRef {
  openModal: (
    action: string,
    address?: ADDRESS_DTO,
    currentPosition?: number,
    suggestValues?: {
      firstName?: string;
      phone?: string;
    }
  ) => void;
}

export const AddressDrawer = forwardRef<AddressDrawerRef, AddressDrawerProps>(
  ({ onAction }, ref) => {
    const { toast } = useToast();
    const form = useForm<AddressSchema>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        complement: "",
      },
    });
    const [currentPosition, setCurrentPosition] = useState<number | undefined>(
      undefined
    );

    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openModal: (
        action: string,
        address?: ADDRESS_DTO,
        currentPosition?: number,
        suggestValues?: {
          firstName?: string;
          phone?: string;
        }
      ) => {
        if (action === "edit") {
          setCurrentPosition(currentPosition);
          form.reset({
            ...address,
            zipCode: formatCep(address?.zipCode ?? ""),
            phone: formatPhoneNumber(address?.phone ?? ""),
            complement: address?.complement ?? "",
          });
        }
        if (suggestValues && suggestValues.firstName) {
          form.setValue("firstName", suggestValues.firstName);
        }

        if (suggestValues && suggestValues.phone) {
          form.setValue("phone", suggestValues.phone);
        }
        setIsOpen(true);
      },
    }));

    const closeModal = () => {
      form.reset({
        firstName: "",
        lastName: "",
        phone: "",
        zipCode: "",
        street: "",
        complement: "",
        neighborhood: "",
        number: "",
        city: "",
        state: "",
        id: "",
      });
      setCurrentPosition(undefined);
      setIsOpen(false);
    };

    const handleFindCep = () => {
      findAndPopulateCep.mutate();
    };

    const findAndPopulateCep = useMutation({
      mutationFn: async () => {
        const cep = form.getValues("zipCode");
        if (cep.length === 9) {
          const response = await api.post<CepResponse>("/cep/find", {
            cep,
          });

          return response.data;
        }
      },

      onSuccess: (data) => {
        if (!data) return;
        form.setValue("city", data.city);
        form.setValue("street", data.street);
        form.setValue("neighborhood", data.neighborhood);
        form.setValue("state", data.state);

        return;
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      },
    });

    function onSubmit(values: AddressSchema) {
      console.log(values);
      onAction(values, currentPosition);
      closeModal();
    }

    return (
      <Drawer direction="right" open={isOpen} onOpenChange={closeModal}>
        <DrawerContent
          aria-describedby="address"
          className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none"
        >
          <ScrollArea>
            <DrawerHeader>
              <DrawerTitle>Endereço</DrawerTitle>
            </DrawerHeader>

            <Form {...form}>
              <form
                className="grid items-start gap-4 p-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            {...field}
                            onChange={(e) => {
                              const formattedValue = formatPhoneNumber(
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

                <div className="grid gap-2">
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              {...field}
                              onChange={(e) => {
                                const formattedValue = formatCep(
                                  e.target.value
                                );

                                field.onChange(formattedValue);
                                if (formattedValue.length === 9) {
                                  handleFindCep();
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          {findAndPopulateCep.isPending && (
                            <Loader className="absolute right-2 top-1/2  animate-spin w-4 h-4" />
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Endereço Principal
                          </FormLabel>
                          <FormDescription>
                            Define esse endereço como padrão para entregas
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit">Salvar endereço</Button>
              </form>
            </Form>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }
);

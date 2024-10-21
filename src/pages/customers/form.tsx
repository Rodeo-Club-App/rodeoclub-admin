import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../_layout";

import { Title } from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileEdit, Loader, Plus, TrashIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { listPartners } from "@/api/partners/list-partners";
import {
  AddressDrawer,
  AddressDrawerRef,
} from "@/components/modals/address-drawer";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { api } from "@/services/api";
import { formatCPF, formatPhoneNumber } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentNumber: string;
  partner: null | {
    id: number;
    name: string;
  };
  invitedAt: Date | null;
  registerMobileAt: Date | null;
  createdAt: string;
  address: ADDRESS_DTO[];
}

const userSchema = z.object({
  name: z
    .string({
      required_error: "Insira o nome.",
    })
    .min(1, { message: "Insira o nome." }),
  email: z
    .string({
      required_error: "Insira o nome.",
    })
    .email("Padrão incorreto")
    .min(1, { message: "Insira o nome." }),
  documentNumber: z
    .string({
      required_error: "Insira o CPF.",
    })
    .min(1, { message: "Insira o CPF." })
    .transform((val) => val.replace(/\D/g, "")),

  sendNotification: z.boolean().default(false),
  partnerId: z.string().optional(),
  phone: z.string().optional(),
  address: z
    .array(
      z.object({
        id: z.string().optional(),
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
        complement: z.string().optional().nullable(),
        neighborhood: z
          .string({
            required_error: "Insira o nome do bairro.",
          })
          .min(1, { message: "Insira o nome do bairro." }),
        phone: z
          .string({ required_error: "Insira o telefone." })
          .refine((val) => val.replace(/\D/g, "").length >= 10, {
            message: "O telefone deve ter pelo menos 10 dígitos.",
          }),
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
          .min(8, { message: "O CEP informado é inválido." }),
        isDefault: z.boolean().optional().default(true),
      })
    )
    .optional(),
  excludeAddress: z.array(z.string()).optional(),
});

type UserSchema = z.infer<typeof userSchema>;

export function CustomerForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
  });

  const addressListArray = useFieldArray({
    control: form.control,
    name: "address",
    keyName: "key",
  });

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  const viewAddressModal = useRef<AddressDrawerRef>(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    enabled: !!id && id !== "new",
    queryFn: async () => {
      const response = await api.get<CustomerResponse>(
        `user/rodeoclub/profile/${id}`
      );

      const { name, email, partner, phone, documentNumber, address } =
        response.data;

      form.reset({
        name,
        email,
        phone,
        partnerId: String(partner?.id) ?? "",
        documentNumber: formatCPF(documentNumber),
        address,
      });

      return response.data;
    },
  });

  const { data: partnersList } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  const handleSalveAddress = (
    address: ADDRESS_DTO,
    currentPosition?: number
  ) => {
    if (currentPosition !== undefined) {
      return addressListArray.update(currentPosition, address);
    } else {
      addressListArray.append(address);
    }
  };

  const handleRemoveAddress = (position: number, address: ADDRESS_DTO) => {
    if (address.id) {
      let currentExcludeList = form.getValues("excludeAddress") || [];
      currentExcludeList.push(address.id);
      form.setValue("excludeAddress", currentExcludeList);
      addressListArray.remove(position);
    } else {
      addressListArray.remove(position);
    }
  };

  async function onSubmit(values: UserSchema) {
    const {
      name,
      email,
      documentNumber,
      phone,
      partnerId,
      address,
      sendNotification,
      excludeAddress,
    } = values;

    try {
      if (id && id !== "new") {
        await api.put(`/user/rodeoclub/${id}`, {
          email,
          phone,
          name,
          partnerId,
          documentNumber,
          address,
          sendNotification,
          excludeAddress,
        });
        toast({
          title: "Sucesso",
          variant: "success",
          description: "Cliente atualizado",
        });
        navigate("/customers");
      } else {
        await api.post("/user/rodeoclub", {
          email,
          phone,
          name,
          partnerId,
          documentNumber,
          address,
          sendNotification,
        });
        toast({
          title: "Sucesso",
          variant: "success",
          description: "Cliente cadastrado com sucesso! 🎉",
        });
        navigate("/customers");
      }
    } catch (error) {
      toast({
        title: "Erro",
        //@ts-ignore
        description: error.message,
      });
    }
  }

  return (
    <>
      <AddressDrawer ref={viewAddressModal} onAction={handleSalveAddress} />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <AppLayout>
          <Title
            showBackButton
            name={id && id !== "new" ? "Editar Cliente" : "Cadastrar Cliente"}
          >
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button
                className="w-full md:w-auto"
                disabled={isLoading || form.formState.isSubmitting}
                onClick={handleSubmit}
              >
                {id && id !== "new" ? "Atualizar cliente" : "Salvar cliente"}

                {(isLoading || form.formState.isSubmitting) && (
                  <Loader className="w-4 h-4 animate-spin ml-2" />
                )}
              </Button>
            </div>
          </Title>

          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <Form {...form}>
              <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                  <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card x-chunk="dashboard-07-chunk-0">
                      <CardHeader>
                        <CardTitle>Dados do Cliente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6">
                          <div className="grid gap-3">
                            <FormField
                              control={form.control}
                              name="name"
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
                          <div className="grid gap-3">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>E-mail</FormLabel>
                                  <FormControl>
                                    <Input placeholder="" {...field} />
                                  </FormControl>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name="documentNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CPF</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder=""
                                        {...field}
                                        onChange={(e) => {
                                          const formattedValue = formatCPF(
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

                            <div className="col-span-2">
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
                                          const formattedValue =
                                            formatPhoneNumber(e.target.value);
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
                        </div>
                      </CardContent>
                    </Card>
                    {!customer?.invitedAt && (
                      <FormField
                        control={form.control}
                        name="sendNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Convite
                              </FormLabel>
                              <FormDescription>
                                Enviar e-mail de convite
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
                    )}
                  </div>
                  <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Card x-chunk="dashboard-07-chunk-3">
                      <CardHeader>
                        <CardTitle>Parceiro</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="partnerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parceiro</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um parceiro" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {partnersList?.map((partner) => (
                                      <SelectItem value={String(partner.id)}>
                                        {partner.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-07-chunk-2">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Endereços</CardTitle>
                        <Button
                          size="icon"
                          className="w-8 h-8"
                          type="button"
                          onClick={() =>
                            viewAddressModal.current?.openModal(
                              "create",
                              undefined,
                              undefined,
                              {
                                firstName: form
                                  .getValues("name")
                                  ?.split(" ")[0],
                                phone: form.getValues("phone"),
                              }
                            )
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {addressListArray.fields.map((address, index) => (
                            <div className=" flex w-full  items-center justify-between">
                              <div>
                                <p>{address.street}</p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  type="button"
                                  onClick={() =>
                                    viewAddressModal.current?.openModal(
                                      "edit",
                                      address,
                                      index
                                    )
                                  }
                                >
                                  <FileEdit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  className="bg-red-400 hover:bg-red-700"
                                  type="button"
                                  onClick={() =>
                                    handleRemoveAddress(index, address)
                                  }
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </AppLayout>
      </div>
    </>
  );
}

import { Header } from "@/components/header";
import { Title } from "@/components/title-page";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "../_layout";
import { Edit, Loader, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MediaProps,
  ViewMediaModal,
  ViewMediaModalRef,
} from "@/components/modals/view-media-modal";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { ProductResponse } from "../home-banners/form";
import { api } from "@/services/api";
import { listPartners } from "@/api/partners/list-partners";

import Select from "react-select";
import makeAnimated from "react-select/animated";

import { CustomerResponse } from "../customers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PreviewDrawerModal,
  PreviewDrawerRef,
} from "@/components/preview-card";

const notificationSchema = z.object({
  title: z.string({ required_error: "O título é obrigatório" }),
  description: z.string({ required_error: "A descrição é obrigatória" }),
  alternativeDescription: z.string().optional(),
  type: z.enum(["alert", "promotion"]).default("alert"),
  sendToAllUsers: z.boolean().default(true),
  partnerIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
});

type NotificationSchema = z.infer<typeof notificationSchema>;

export function PromotionNotification() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaProps | null>(null);
  const viewMediaModal = useRef<ViewMediaModalRef>(null);
  const previewDrawerModal = useRef<PreviewDrawerRef>(null);

  const animatedComponents = makeAnimated();

  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName] = useDebounce(searchName, 500);
  const [reference, setReference] = useState("");
  const [referenceLabel, setReferenceLabel] = useState("");

  const handleMediaSelect = (media: MediaProps | null) => {
    setSelectedMedia(media);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [debouncedSearchQuery] = useDebounce(search, 500);

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["users-search", debouncedSearchQuery],
    enabled: !!search,
    queryFn: async () => {
      const response = await api.post<CustomerResponse>(
        "/user/rodeoclub/search",
        {
          ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
          // excludeIds: excludeIds,
        },
        {
          params: {
            page: 1,
            limit: 10,
          },
        }
      );

      return response.data;
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", debouncedSearchName],
    enabled: debouncedSearchName.length > 2,
    queryFn: async () => {
      const response = await api.get<ProductResponse>(`/products/rodeoclub`, {
        params: {
          page: 1,
          limit: 10,
          searchName: debouncedSearchName,
        },
      });

      return response.data;
    },
  });

  const { data: partnersList } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  const form = useForm<NotificationSchema>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      sendToAllUsers: true,
      type: "alert",
      alternativeDescription: "",
      userIds: [],
      partnerIds: [],
    },
  });

  console.log(form.formState.errors);

  async function handleSubmit() {
    await form.handleSubmit(onSubmit)();
  }

  async function onSubmit(values: NotificationSchema) {
    const {
      title,
      description,
      userIds,
      partnerIds,
      type,
      alternativeDescription,
    } = values;
    try {
      const response = await api.post<{
        message: string;
        count: number;
      }>("/notifications/rodeoclub", {
        title,
        description,
        alternativeDescription,
        mediaId: selectedMedia?.id,
        users: userIds,
        type,
        ...(reference && { reference: Number(reference) }),
        partnerIds: partnerIds?.map((i) => Number(i)),
      });
      toast({
        title: "Sucesso",
        description: `${response.data.count} notificações enviadas com sucesso`,
        variant: "success",
      });
      navigate("/");
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
    <>
      <ViewMediaModal
        ref={viewMediaModal}
        onImageSelected={handleMediaSelect}
      />
      <PreviewDrawerModal
        ref={previewDrawerModal}
        title={form.watch("title") ?? ""}
        description={form.watch("description") ?? ""}
        selectedMedia={selectedMedia}
        alternativeDescription={form.watch("alternativeDescription") ?? ""}
      />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <AppLayout>
          <Title name={"Criar Notificação"}>
            <div className="gap-2 md:ml-auto md:flex">
              <Button
                className="w-full sm:w-auto bg-white text-stone-800 border-stone-800 border hover:bg-slate-50"
                onClick={() =>
                  previewDrawerModal.current?.openPreviewModal({
                    title: form.watch("title"),
                    description: form.watch("description"),
                    selectedMedia: selectedMedia,
                    alternativeDescription:
                      form.watch("alternativeDescription") ?? "",
                  })
                }
              >
                Preview
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={form.formState.isSubmitting}
                onClick={handleSubmit}
              >
                {form.formState.isSubmitting && (
                  <Loader className="w-4 h-4 animate-spin ml-2" />
                )}
                Enviar notificação
              </Button>
            </div>
          </Title>

          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
              <div
                className={`grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8`}
              >
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                  <Card x-chunk="dashboard-07-chunk-0">
                    <CardContent>
                      <div className="flex flex-col sm:flex-row w-full pt-6">
                        <div className="flex flex-col items-center w-full md:w-[300px]">
                          {selectedMedia ? (
                            <img
                              src={selectedMedia.url}
                              alt="Imagem selecionada"
                              width={300}
                              height={100}
                              className="rounded-md"
                            />
                          ) : (
                            <img
                              src="https://placehold.co/1024x1280"
                              alt="Imagem placeholder"
                              width={300}
                              height={100}
                              className="rounded-md"
                            />
                          )}

                          <Button
                            type="button"
                            className="mt-4 w-full md:w-auto"
                            onClick={() => viewMediaModal.current?.openModal()}
                          >
                            Adicionar imagem
                          </Button>
                        </div>

                        <div className="sm:ml-4 w-full mt-4 sm:mt-0">
                          <div className="grid gap-3">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assunto da Notificação</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Digite o assunto..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-5 grid gap-3">
                            <FormField
                              control={form.control}
                              name="alternativeDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sub descrição</FormLabel>
                                  <FormControl>
                                    <Input placeholder="" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-5 grid gap-3">
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Descrição da Notificação
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      className="resize-none"
                                      placeholder="Digite a descrição..."
                                      {...field}
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

                  <Card x-chunk="dashboard-07-chunk-1">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="flex flex-col  p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Tipo de Notificação
                            </FormLabel>
                            <FormDescription>
                              Selecione o tipo de notificação que deseja enviar.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="alert" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Avisos gerais / alertas
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="promotion" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Promoção de Produtos
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>

                  <Card x-chunk="dashboard-07-chunk-1">
                    <FormField
                      control={form.control}
                      name="sendToAllUsers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enviar Notificação
                            </FormLabel>
                            <FormDescription>
                              Selecione se deseja enviar a notificação para{" "}
                              <strong>
                                {field.value
                                  ? "todos os clientes"
                                  : "clientes selecionados"}
                              </strong>
                              .
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === true}
                              onCheckedChange={() =>
                                field.onChange(!field.value)
                              }
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                </div>

                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                  {form.watch("type") === "promotion" && (
                    <Card x-chunk="dashboard-07-chunk-3">
                      <CardHeader>
                        <CardTitle>Produto</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          {referenceLabel ? (
                            <div className="flex flex-row gap-2 items-center">
                              <p>{referenceLabel}</p>
                              <Button
                                size="icon"
                                onClick={() => {
                                  setReference("");
                                  setReferenceLabel("");
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Command>
                              <CommandInput
                                placeholder="Digite o nome do produto"
                                className="rounded-md"
                                onValueChange={(value) => setSearchName(value)}
                              />
                              <CommandList>
                                {isLoadingProducts ? (
                                  <CommandEmpty>Carregando...</CommandEmpty>
                                ) : (products?.data ?? []).length > 0 ? (
                                  <CommandGroup>
                                    {products?.data.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        onSelect={() => {
                                          setReference(String(product.id));
                                          setReferenceLabel(product.name);
                                        }}
                                      >
                                        {product.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                ) : (
                                  <CommandEmpty>
                                    Nenhum produto encontrado.
                                  </CommandEmpty>
                                )}
                              </CommandList>
                            </Command>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {form.watch("sendToAllUsers") === false && (
                    <Card x-chunk="dashboard-07-chunk-3">
                      <CardHeader>
                        <CardTitle>Parceiro</CardTitle>
                        <CardDescription>
                          Quando um ou mais parceiros forem selecionados,
                          notificações serão enviadas aos clientes vinculados a
                          esses parceiros.{" "}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="partnerIds"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  isMulti
                                  closeMenuOnSelect={false}
                                  components={animatedComponents}
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderRadius: "12px",
                                      borderColor: "#dfdfdf",
                                      boxShadow: "none",
                                      fontSize: "14px ",
                                      lineHeight: "1.25rem",
                                      "&:hover": {
                                        borderColor: "#000000",
                                        borderWidth: "2px",
                                      },
                                    }),
                                  }}
                                  placeholder="Selecione um ou mais parceiros..."
                                  options={
                                    partnersList?.map((partner) => ({
                                      value: String(partner.id),
                                      label: partner.name,
                                    })) || []
                                  }
                                  onChange={(selectedOptions: any) => {
                                    const selectedValues = selectedOptions.map(
                                      (option: any) => option.value
                                    );
                                    field.onChange(selectedValues);
                                  }}
                                  value={(Array.isArray(field.value)
                                    ? field.value
                                    : []
                                  ).map((value) => ({
                                    value: value,
                                    label:
                                      partnersList?.find(
                                        (partner) =>
                                          String(partner.id) === value
                                      )?.name || "",
                                  }))}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {form.watch("sendToAllUsers") === false && (
                    <Card x-chunk="dashboard-07-chunk-3">
                      <CardHeader>
                        <CardTitle>Clientes</CardTitle>
                        <CardDescription>
                          Quando um ou mais clientes forem selecionados,
                          notificações serão enviadas apenas a esses clientes.
                        </CardDescription>{" "}
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="userIds"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  isMulti
                                  closeMenuOnSelect={false}
                                  components={animatedComponents}
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderRadius: "12px",
                                      borderColor: "#dfdfdf",
                                      boxShadow: "none",
                                      fontSize: "14px",
                                      lineHeight: "1.25rem",
                                      "&:hover": {
                                        borderColor: "#000000",
                                        borderWidth: "2px",
                                      },
                                    }),
                                  }}
                                  isLoading={isLoading || isRefetching}
                                  loadingMessage={() => (
                                    <Loader className="animate-spin w-4 h-4" />
                                  )}
                                  noOptionsMessage={() => (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <SearchX className="w-4 h-4" />
                                      Nada encontrado
                                    </div>
                                  )}
                                  placeholder="Pesquise um ou mais clientes..."
                                  onInputChange={(e) => {
                                    setSearchParams((p) => {
                                      p.set("search", e);

                                      return p;
                                    });
                                  }}
                                  options={
                                    data?.users.map((user) => ({
                                      value: String(user.id),
                                      label: user.name,
                                    })) || []
                                  }
                                  onChange={(selectedOptions: any) => {
                                    const selectedValues = selectedOptions.map(
                                      (option: any) => option.value
                                    );
                                    field.onChange(selectedValues);
                                  }}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </AppLayout>
      </div>
    </>
  );
}

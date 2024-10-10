import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { Title } from "@/components/title-page";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

import { useToast } from "@/hooks/use-toast";
import { Edit, Loader } from "lucide-react";
import { useDebounce } from "use-debounce";

interface Media {
  id: number;
  url: string;
  type: "image" | "video";
}

interface BannerData {
  id: number;
  tenantId: string;
  mediaId: number;
  position: number;
  description: string | null;
  action: "product" | "view" | "category_product" | "external_link";
  reference: string | null;
  referenceLabel: string | null;
  media: Media;
}

interface IProduct {
  id: number;
  name: string;
  category?: { name: string } | null;
  price: string;
  priceCents: number;
  images: { imageUrl: string }[];
  description: string | null;
}

interface ProductResponse {
  count: number;
  page: number;
  pageCount: number;
  data: IProduct[];
}

interface SubCategoryResponse {
  id: number;
  name: string;
}

interface Media {
  url: string;
}

export function BannersForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const viewMediaModal = useRef<ViewMediaModalRef>(null);
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName] = useDebounce(searchName, 500);
  const [selectedMedia, setSelectedMedia] = useState<MediaProps | null>(null);
  const [reference, setReference] = useState("");
  const [referenceLabel, setReferenceLabel] = useState("");

  const handleMediaSelect = (media: MediaProps | null) => {
    setSelectedMedia(media);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["banner", id],
    enabled: !!id && id !== "new",
    queryFn: async () => {
      const response = await api.get<BannerData>(`/home/rodeoclub/${id}/home`);
      const data = response.data;
      setReference(data.reference ?? "");
      setReferenceLabel(data.referenceLabel ?? "");
      setSelectedAction(data.action);
      setSelectedMedia(data.media);
      return data;
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", debouncedSearchName],
    enabled: selectedAction === "product" && debouncedSearchName.length > 2,
    queryFn: async () => {
      const response = await api.get<ProductResponse>(`/products/rodeoclub`, {
        params: {
          page: 1,
          limit: 10,
          searchName: debouncedSearchName,
        },
      });

      console.log(response.data);
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["category_product", debouncedSearchName],
    enabled: selectedAction === "category_product",
    queryFn: async () => {
      const response = await api.get<SubCategoryResponse[]>(
        `/sub-category/rodeoclub`
      );

      return response.data;
    },
  });

  const onSubmit = async () => {
    try {
      if (id && id !== "new") {
        await api.put(`/home/rodeoclub/${id}`, {
          mediaId: selectedMedia?.id,
          destination: "home",
          action: selectedAction,
          reference,
        });
        toast({
          title: "Sucesso",
          variant: "success",
          description: "Banner atualizado com sucesso! 🎉",
        });

        navigate("/home-banners");
      } else {
        await api.post(`/home/rodeoclub/${id}`, {
          mediaId: selectedMedia?.id,
          destination: "home",
          action: selectedAction,
          reference,
        });
        toast({
          title: "Sucesso",
          description: "Banner atualizado",
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["banners"],
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o banner. 😢",
      });
    }
  };

  return (
    <>
      <ViewMediaModal
        ref={viewMediaModal}
        onImageSelected={handleMediaSelect}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        <AppLayout>
          <Title
            name={id && id !== "new" ? "Editar Banner" : "Cadastrar Banner"}
          />

          <Card className="w-full">
            <CardContent className="pt-6 flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center w-full md:w-[300px]">
                {selectedMedia ? (
                  <img
                    src={selectedMedia.url}
                    width={300}
                    height={100}
                    className="rounded-md"
                  />
                ) : (
                  <img
                    src="https://placehold.co/1024x1280"
                    width={300}
                    height={100}
                    className="rounded-md"
                  />
                )}

                <Button
                  className="mt-4 w-full md:w-auto"
                  onClick={() => viewMediaModal.current?.openModal("1")}
                >
                  {id && id !== "new" ? "Alterar imagem" : "Adicionar imagem"}
                </Button>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <Label htmlFor="action">Ação</Label>
                  <Select
                    value={selectedAction}
                    onValueChange={setSelectedAction}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Ação</SelectLabel>

                        <SelectItem value="view">Visualização</SelectItem>
                        <SelectItem value="product">Produto</SelectItem>
                        <SelectItem value="category_product">
                          Categoria do produto
                        </SelectItem>
                        <SelectItem value="external_link">
                          Link externo
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAction === "product" && (
                  <div>
                    <Label htmlFor="product">Produto</Label>

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
                )}

                {selectedAction === "category_product" && (
                  <div>
                    <Select
                      value={reference}
                      onValueChange={(e) => {
                        setReference(String(e));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedAction === "external_link" && (
                  <div>
                    <Label htmlFor="link">Link externo</Label>
                    <Input
                      id="link"
                      placeholder="Insira o URL do link"
                      className="rounded-md"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                className="w-full md:w-auto"
                disabled={isLoading}
                onClick={onSubmit}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-4" />
                ) : id && id !== "new" ? (
                  "Atualizar banner"
                ) : (
                  "Cadastrar banner"
                )}
              </Button>
            </CardFooter>
          </Card>
        </AppLayout>
      </div>
    </>
  );
}

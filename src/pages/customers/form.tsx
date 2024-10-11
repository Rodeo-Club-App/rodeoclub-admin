import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { CustomersList, ICustomer } from ".";
import { Title } from "@/components/title-page";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { listPartners } from "@/api/partners/list-partners";
import {
  AddressDrawer,
  AddressDrawerRef,
} from "@/components/modals/address-drawer";
import { useRef } from "react";

export function CustomerForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const [searchParams, setSearchParams] = useSearchParams();

  const viewAddressModal = useRef<AddressDrawerRef>(null);

  const partnerId = searchParams.get("partnerId") || "";

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    enabled: !!id && id !== "new",
    queryFn: async () => {
      return new Promise<ICustomer | undefined>((resolve) => {
        setTimeout(() => {
          const foundCustomer = CustomersList.find(
            (customer) => customer.id === Number(id)
          );
          resolve(foundCustomer);
        }, 500);
      });
    },
  });

  const { data: partnersList, isLoading: isLoadingPartners } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  const isInvited = customer?.invitedAt !== null;

  const onSubmit = async () => {
    try {
      if (id && id !== "new") {
        await new Promise<ICustomer | undefined>((resolve) => {
          setTimeout(() => {
            const foundCustomer = CustomersList.find(
              (customer) => customer.id === Number(id)
            );
            resolve(foundCustomer);
          }, 500);
        });
        toast({
          title: "Sucesso",
          variant: "success",
          description: "Cliente atualizado com sucesso! 🎉",
        });
        navigate("/customers");
      } else {
        toast({
          title: "Sucesso",
          description: "Cliente cadastrado com sucesso! 🎉",
        });
        navigate("/customers");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o Cliente. 😢",
      });
    }
  };

  const onSelectPartner = (id: string) => {
    setSearchParams((prev) => {
      prev.set("partnerId", id);
      return prev;
    });
  };

  return (
    <>
      <AddressDrawer ref={viewAddressModal} />
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
                disabled={isLoading}
                onClick={onSubmit}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-4" />
                ) : id && id !== "new" ? (
                  "Atualizar cliente"
                ) : (
                  "Salvar cliente"
                )}
              </Button>
            </div>
          </Title>

          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader>
                    <CardTitle>Dados do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          defaultValue={customer?.name}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="description">E-mail</Label>
                        <Input
                          id="email"
                          type="text"
                          className="w-full"
                          defaultValue={customer?.email}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="description">CPF</Label>
                        <Input
                          id="cpf"
                          type="text"
                          className="w-full"
                          defaultValue={customer?.cpf}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {!isInvited && (
                  <Card x-chunk="dashboard-07-chunk-1">
                    <CardHeader>
                      <CardTitle>Convite</CardTitle>
                      <div className="w-full space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <div className="text-base">
                                Enviar e-mail de convite ao cliente
                              </div>
                            </div>
                            <div>
                              <Switch defaultChecked={false} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-3">
                  <CardHeader>
                    <CardTitle>Parceiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <Label htmlFor="status">Selecione o parceiro</Label>
                      <Select
                        value={partnerId || ""}
                        onValueChange={(e) => onSelectPartner(e)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Parceiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {!isLoadingPartners &&
                            partnersList?.map((partner) => (
                              <SelectItem
                                key={partner.id}
                                value={String(partner.id)}
                                className="cursor-pointer"
                              >
                                {partner.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <Card x-chunk="dashboard-07-chunk-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Endereço</CardTitle>
                    <Button
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => viewAddressModal.current?.openModal()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <Label htmlFor="category">Selecione o endereço</Label>
                      <Select>
                        <SelectTrigger
                          id="category"
                          aria-label="Select category"
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="electronics">
                            Electronics
                          </SelectItem>
                          <SelectItem value="accessories">
                            Accessories
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </AppLayout>
      </div>
    </>
  );
}

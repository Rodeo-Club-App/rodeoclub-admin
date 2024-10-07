import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AppLayout } from "../_layout";
import { Header } from "@/components/header";
import { api } from "@/services/api";
import { actionLabel } from "@/utils/actions-label";

import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { Title } from "@/components/title-page";
import { useMutation } from "@tanstack/react-query";

// Types
export type Banner = {
  id: number;
  position: number;
  imageUrl: string;
  action: "view" | "product" | "category_product" | "external_link";
  reference: string;
  referenceLabel: string;
};

interface HomeBannersResponse {
  banners: Banner[];
}

export function HomeBanners() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetchHome();
  }, []);

  async function fetchHome() {
    try {
      const response = await api.get<HomeBannersResponse>(
        "/home/rodeoclub/mobile"
      );

      setBanners(response.data.banners);
    } catch (error) {}
  }

  const updateBannerPositions = async (
    updatedBanners: { id: number; position: number }[]
  ) => {
    const response = await api.patch(
      "/home/rodeoclub/update-position/home",
      updatedBanners
    );

    return response.data;
  };

  const mutationPosition = useMutation({
    mutationFn: updateBannerPositions,
    onSuccess: () => {},
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedBanners = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setBanners(updatedBanners);

    mutationPosition.mutateAsync(
      updatedBanners.map((i) => ({
        id: i.id,
        position: i.position,
      }))
    );
  };

  return (
    <div className="flex-col md:flex">
      <Header />
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="flex flex-row w-full justify-between">
            <Title name="Gestão de Banners (Home aplicativo)" />
            <Button onClick={() => navigate("/banners-form/new")}>
              Adicionar <Plus className="w-4 h-4 ml-4" />{" "}
            </Button>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mutationPosition.isPending
                  ? "Atualizando posições"
                  : "Banners"}
                {mutationPosition.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-wrap gap-2"
                    >
                      {banners.map((banner, index) => (
                        <Draggable
                          key={String(banner.id)}
                          draggableId={String(banner.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white flex-col md:flex-row w-full p-2 rounded shadow flex items-center space-x-2 hover:cursor-move"
                            >
                              <span className="font-bold">
                                {banner.position}.
                              </span>
                              <img
                                src={banner.imageUrl}
                                width={200}
                                height={100}
                                className="rounded"
                              />

                              <div className="flex items-center md:items-start flex-col">
                                <div>Ação: {actionLabel[banner.action]}</div>

                                <div>
                                  Referência:{" "}
                                  {banner.action === "external_link"
                                    ? banner.reference
                                    : banner.referenceLabel}
                                </div>
                                <div className="mt-5">
                                  <Button
                                    onClick={() =>
                                      navigate(`/banners-form/${banner.id}`)
                                    }
                                  >
                                    Editar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  );
}

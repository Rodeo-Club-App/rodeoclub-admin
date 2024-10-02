import React, { useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppLayout } from "../_layout";
import { Header } from "@/components/header";
import { api } from "@/services/api";
import { actionLabel } from "@/utils/actions-label";
import {
  BannersBrawerRef,
  BannersDrawer,
} from "@/components/modals/banners-drawer";
import { useSearchParams } from "react-router-dom";

// Types
type Banner = {
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
  const [, setSearchParams] = useSearchParams();
  const [banners, setBanners] = useState<Banner[]>([]);

  const bannersDrawerRef = useRef<BannersBrawerRef>(null);

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
  };

  function handleEditBanner(id: number) {
    setSearchParams((prev) => {
      prev.set("edit", String(id));
      prev.set("destination", "home");

      return prev;
    });
    bannersDrawerRef.current?.openModal();
  }

  return (
    <div className="flex-col md:flex">
      <Header />
      <AppLayout>
        <BannersDrawer ref={bannersDrawerRef} />
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">
            Gestão de Banners (Home aplicativo)
          </h1>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Banners</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
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
                              className="bg-white p-2 rounded shadow flex items-center space-x-2 hover:cursor-move"
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

                              <div className="flex flex-col">
                                <div>Ação: {actionLabel[banner.action]}</div>

                                <div>Item: {banner.reference}</div>
                                <div>
                                  <Button
                                    onClick={() => handleEditBanner(banner.id)}
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

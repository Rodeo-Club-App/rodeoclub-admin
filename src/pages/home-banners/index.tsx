import React, { useEffect, useState } from "react";
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

// Types
type Banner = {
  id: string;
  position: number;
  imageUrl: string;
};

interface HomeBannersResponse {
  banners: {
    id: string;
    imageUrl: string;
    position: number;
  }[];
}

export function HomeBanners() {
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

  // Function to handle the drag-and-drop logic
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Reorder the array based on drag result
    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order based on new array position
    const updatedBanners = items.map((item, index) => ({
      ...item,
      position: index + 1, // Update the order after reordering
    }));

    setBanners(updatedBanners);
  };

  return (
    <div className="flex-col md:flex">
      <Header />
      <AppLayout>
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

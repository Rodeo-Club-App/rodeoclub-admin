import { forwardRef, useImperativeHandle, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Button } from "./ui/button";
import { ChevronLeft, X } from "lucide-react";

import mockup from "@/assets/mockup3.png";
import mockup2 from "@/assets/mockup2.png";
import icon from "@/assets/icon.png";
import { MediaProps } from "./modals/view-media-modal";

type PreviewDrawerProps = {
  title: string;
  description: string;
  alternativeDescription: string;
  selectedMedia: MediaProps | null;
};

export interface PreviewDrawerRef {
  openPreviewModal: (data: PreviewDrawerProps) => void;
}

export const PreviewDrawerModal = forwardRef<
  PreviewDrawerRef,
  PreviewDrawerProps
>((_props, ref) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [isOpen, setIsOpen] = useState(false);

  const [previewData, setPreviewData] = useState<PreviewDrawerProps | null>(
    null
  );

  useImperativeHandle(ref, () => ({
    openPreviewModal: (data) => {
      setPreviewData(data);
      setIsOpen(true);
    },
  }));

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={closeModal}>
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
        <ScrollArea>
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle className="uppercase">
              Pré-visualização da Notificação
            </DrawerTitle>
            <Button variant="ghost" size="icon" onClick={closeModal}>
              <X className="w-4 h-4" />
            </Button>
          </DrawerHeader>

          <div className="flex flex-col items-center">
            <div className="relative w-[400px] h-[760px]">
              <img
                src={mockup}
                alt="mockup"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0  flex flex-col items-center justify-center p-4">
                <div className="w-[280px] flex flex-row items-center h-20 shadow-sm shadow-black bg-zinc-900 p-1 rounded-lg text-center">
                  <img
                    src={icon}
                    className="rounded-sm bg-white object-cover ml-1"
                    width={50}
                    height={50}
                  />

                  <div className="flex flex-col flex-1 mx-2">
                    <div className="flex justify-between w-full">
                      <p className="text-white text-[15px] font-medium">
                        {previewData?.title}
                      </p>
                      <p className="text-zinc-300 text-[13px]">agora</p>
                    </div>

                    <p className="text-zinc-300 text-[13px] text-left">
                      {previewData?.alternativeDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-[400px] h-[760px]">
              <img
                src={mockup2}
                alt="mockup"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 flex flex-col items-center top-32 p-4 overflow-hidden">
                <ScrollArea className="h-[500px]">
                  <div className="w-[295px]">
                    <div className="flex items-center mt-1 mb-2">
                      <div>
                        <ChevronLeft />
                      </div>
                      <p className="uppercase w-[250px] text-[16px] text-center font-bold">
                        Detalhes da notificação
                      </p>
                    </div>

                    {previewData?.selectedMedia ? (
                      <img
                        src={previewData?.selectedMedia.url}
                        alt="Imagem selecionada"
                      />
                    ) : (
                      <img src="https://placehold.co/1024x1280" alt="" />
                    )}
                    <p className="text-xs mt-1">
                      Notificação: <strong>{previewData?.title}</strong>{" "}
                    </p>
                    <p className="mt-2 text-xs">
                      Data: <strong>{formattedDate}</strong>{" "}
                    </p>
                    <p className="mt-2 text-xs">{previewData?.description}</p>

                    <div className="flex justify-center mt-4 rounded-[6px] bg-amber-400 h-10 items-center">
                      <p className="uppercase text-xs font-bold">
                        Visualizar o produto
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
});

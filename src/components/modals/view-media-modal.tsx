import { useImperativeHandle, forwardRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

export interface MediaProps {
  id: number;
  url: string;
  type: "image" | "video";
}

interface ViewMediaModalProps {
  id?: string;
  onImageSelected: (image: MediaProps | null) => void;
}

export interface ViewMediaModalRef {
  openModal: (id: string) => void;
}

export const ViewMediaModal = forwardRef<
  ViewMediaModalRef,
  ViewMediaModalProps
>(({ onImageSelected }, ref) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const { data: mediaList } = useQuery({
    queryKey: ["medias"],
    queryFn: async () => {
      const response = await api.get<MediaProps[]>("medias/rodeoclub");
      return response.data;
    },
  });

  useImperativeHandle(ref, () => ({
    openModal: (id: string) => {
      setIsOpen(true);
    },
  }));

  const closeModal = () => {
    queryClient.refetchQueries({
      queryKey: ["medias"],
    });
    setIsOpen(false);
  };

  const handleImageClick = (id: number) => {
    setSelectedImageId(id === selectedImageId ? null : id);
  };

  const handleConfirm = () => {
    if (selectedImageId) {
      const selectedImage = mediaList?.find(
        (media) => media.id === selectedImageId
      );
      onImageSelected(selectedImage || null);
    }
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Selecione a imagem</DialogTitle>
        <ScrollArea className="h-96 sm:max-w-2xl m-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaList?.map((media) => (
              <div
                key={media.id}
                className={`relative cursor-pointer border-2 transition-colors duration-200 ${
                  media.id === selectedImageId
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => handleImageClick(media.id)}
              >
                <img
                  src={media.url}
                  alt={`Mídia ID: ${media.id}`}
                  className="w-full h-32 object-contain rounded"
                />
                {media.id === selectedImageId && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded"></div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedImageId}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

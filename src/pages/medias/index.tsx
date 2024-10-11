import { Header } from "@/components/header";
import { AppLayout } from "../_layout";
import { Title } from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRef } from "react";
import {
  UploadMediaModal,
  UploadMediaModalRef,
} from "@/components/modals/upload-media-modal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface MediaProps {
  id: number;
  url: string;
  type: "image" | "video";
}

export function Medias() {
  const uploadMediaModal = useRef<UploadMediaModalRef>(null);

  const { data: mediaList } = useQuery({
    queryKey: ["medias"],
    queryFn: async () => {
      const response = await api.get<MediaProps[]>("medias/rodeoclub");

      return response.data;
    },
  });
  return (
    <>
      <UploadMediaModal ref={uploadMediaModal} />

      <div className="flex-col md:flex">
        <Header />
        <AppLayout>
          <div className="flex flex-row w-full justify-between">
            <Title name="Mídias" />
            <Button onClick={() => uploadMediaModal.current?.openModal()}>
              Adicionar <Plus className="w-4 h-4 ml-4" />{" "}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {mediaList?.map((media) => (
              <img
                key={media.id}
                src={media.url}
                alt=""
                className=" h-32 object-cover rounded"
              />
            ))}
          </div>
        </AppLayout>
      </div>
    </>
  );
}

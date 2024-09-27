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

export function Medias() {
  const uploadMediaModal = useRef<UploadMediaModalRef>(null);
  return (
    <>
      <UploadMediaModal ref={uploadMediaModal} />

      <div className="flex-col md:flex">
        <Header />
        <AppLayout>
          <div className="flex flex-row w-full justify-between">
            <Title name="Mídias" />
            <Button onClick={() => uploadMediaModal.current?.openModal("1")}>
              Adicionar <Plus className="w-4 h-4 ml-4" />{" "}
            </Button>
          </div>
        </AppLayout>
      </div>
    </>
  );
}

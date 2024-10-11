import { forwardRef, useImperativeHandle, useState } from "react";
// import { api } from "@/services/api";
import { ScrollArea } from "../ui/scroll-area";

import { useSearchParams } from "react-router-dom";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";

interface BannersDrawerProps {
  id?: string;
}

export interface BannersBrawerRef {
  openModal: () => void;
}

export const BannersDrawer = forwardRef<BannersBrawerRef, BannersDrawerProps>(
  ({}, ref) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // const destination = searchParams.get("destination");
    const edit = searchParams.get("edit");

    // const queryClient = useQueryClient();

    // const { toast } = useToast();

    // const [files, setFiles] = useState<File[]>([]);

    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openModal: () => {
        setIsOpen(true);
      },
    }));

    const closeModal = () => {
      setSearchParams((prev) => {
        prev.delete("edit");
        prev.delete("destination");

        return prev;
      });
      //   queryClient.refetchQueries({
      //     queryKey: ["medias"],
      //   });
      setIsOpen(false);
    };

    return (
      <Drawer direction="right" open={isOpen} onOpenChange={closeModal}>
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
          <ScrollArea>
            <DrawerHeader>
              <DrawerTitle>Banner {edit}</DrawerTitle>
            </DrawerHeader>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }
);

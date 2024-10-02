import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
// import { api } from "@/services/api";
import { api } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Link2, Upload } from "lucide-react";
import { CircularProgressbar } from "react-circular-progressbar";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

import axios from "axios";
import { filesize } from "filesize";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { useSearchParams } from "react-router-dom";

interface BannersDrawerProps {
  id?: string;
}

export interface BannersBrawerRef {
  openModal: () => void;
}

export const BannersDrawer = forwardRef<BannersBrawerRef, BannersDrawerProps>(
  ({}, ref) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const destination = searchParams.get("destination");
    const edit = searchParams.get("edit");

    const queryClient = useQueryClient();

    const { toast } = useToast();

    const [files, setFiles] = useState<File[]>([]);

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

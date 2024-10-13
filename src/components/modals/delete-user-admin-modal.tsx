import { Loader } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";

interface DeleteUserAdminModalProps {
  onConfirm: (id: string) => void;
  isLoading: boolean;
}

export interface DeleteUserAdminModalRef {
  openModal: (id: string) => void;
  hide: () => void;
}

export const DeleteUserAdminModal = forwardRef<
  DeleteUserAdminModalRef,
  DeleteUserAdminModalProps
>(({ onConfirm, isLoading }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const [idRemove, setIdRemove] = useState("");

  useImperativeHandle(ref, () => ({
    openModal: (id: string) => {
      setIdRemove(id);
      setIsOpen(true);
    },
    hide: () => {
      setIdRemove("");
      setIsOpen(false);
    },
  }));

  const closeModal = () => {
    setIdRemove("");

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="">
        <DialogTitle>Remover administrador</DialogTitle>
        <DialogDescription>
          Confirma a remoção desse administrador? Após confirmado não terá mais
          acesso ao portal Administrador.
        </DialogDescription>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onConfirm(idRemove)}
            disabled={isLoading}
          >
            Confirmar
            {isLoading && <Loader className="animate-spin w-4 h-4 ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

import { forwardRef, useImperativeHandle, useState } from "react";

import { ScrollArea } from "../ui/scroll-area";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { useSearchParams } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface AddressDrawerProps {
  id?: string;
}

export interface AddressDrawerRef {
  openModal: () => void;
}

export const AddressDrawer = forwardRef<AddressDrawerRef, AddressDrawerProps>(
  ({}, ref) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const edit = searchParams.get("edit");

    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openModal: () => {
        setIsOpen(true);
      },
    }));

    const closeModal = () => {
      setSearchParams((prev) => {
        prev.delete("edit");

        return prev;
      });

      setIsOpen(false);
    };

    return (
      <Drawer direction="right" open={isOpen} onOpenChange={closeModal}>
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
          <ScrollArea>
            <DrawerHeader>
              <DrawerTitle>Endereço {edit}</DrawerTitle>
            </DrawerHeader>

            <form className="grid items-start gap-4 p-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  type="text"
                  id="address"
                  placeholder="Rua, Avenida, etc."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">Número</Label>
                <Input type="text" id="number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input type="text" id="complement" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input type="text" id="neighborhood" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input type="text" id="city" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input type="text" id="state" required />
              </div>

              <Button type="submit">Salvar endereço</Button>
            </form>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }
);

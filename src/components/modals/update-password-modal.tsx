import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
// interface UpdatePasswordModalProps {}

export interface UpdatePasswordModalRef {
  openModal: () => void;
}

const updatePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: "Insira a senha atual.",
    })
    .min(1, { message: "Insira a senha atual" }),
  newPassword: z
    .string({
      required_error: "Insira a nova senha.",
    })
    .min(1, { message: "Insira a nova senha" }),
});

type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordModal() {
  const [searchParams, setSearchParams] = useSearchParams();

  const editModal = searchParams.get("editPassword");

  const open = editModal && editModal === "true" ? true : false;
  const { toast } = useToast();
  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: "",
      currentPassword: "",
    },
  });

  // const [isOpen, setIsOpen] = useState(false);

  // useImperativeHandle(ref, () => ({
  //   openModal: () => {
  //     setIsOpen(true);
  //   },
  // }));

  const closeModal = () => {
    form.reset({
      newPassword: "",
      currentPassword: "",
    });
    setSearchParams((p) => {
      p.delete("editPassword");

      return p;
    });
    // setIsOpen(false);
  };

  async function onSubmit(values: UpdatePasswordSchema) {
    const { newPassword, currentPassword } = values;
    try {
      await api.patch("/user/rodeoclub/update-password", {
        currentPassword,
        newPassword,
      });

      toast({
        variant: "success",
        title: "Sucesso",
        description: "Senha alterada",
      });
      closeModal();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        //@ts-ignore
        description: error.message,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar senha</DialogTitle>
          <DialogDescription>
            Preencha todos os campos para trocar sua senha. Lembre-se que é a
            mesma para acessar o aplicativo.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Senha atual</Label>
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Nova senha</Label>
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

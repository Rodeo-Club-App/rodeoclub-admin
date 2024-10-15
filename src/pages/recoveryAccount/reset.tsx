import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import logoTop from "@/assets/pvt-sigla.png";
import logoBottom from "@/assets/logo-pvt-top.png";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserAuth } from "@/hooks/useUserAuth";

const redefinePasswordScehma = z.object({
  password: z.string().min(1, "Senha obrigatória"),
  confirmPassword: z.string().min(1, "Confirmação de senha obrigatória"),
});

type RedefinePasswordForm = z.infer<typeof redefinePasswordScehma>;

export default function RedefinePassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useUserAuth();

  const location = useLocation();
  const email = location.state?.email || "";
  const token = location.state?.token || "";

  const form = useForm<RedefinePasswordForm>({
    resolver: zodResolver(redefinePasswordScehma),
  });

  async function onSubmit(data: RedefinePasswordForm) {
    const { password, confirmPassword } = data;
    try {
      await api.post("/forgot-password/rodeoclub/reset", {
        email: email,
        token: token,
        password,
        confirmPassword,
      });

      await signIn({
        email: email,
        password: password,
      });

      toast({ title: "Sua senha foi redefinida", variant: "success" });
      navigate("/");
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen px-4 md:px-0">
      <div className="hidden lg:flex lg:flex-col lg:min-h-full">
        <div className="flex-1 bg-[--custom-dark] flex items-end justify-center">
          <img src={logoTop} alt="Logo Top" className="w-3/4 max-w-xs mb-2" />
        </div>
        <div className="flex-1 bg-[--custom-primary] flex items-start justify-center">
          <img
            src={logoBottom}
            alt="Logo Bottom"
            className="w-3/4 max-w-[350px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold"> Redefinição de senha</h1>
            <p className="text-balance text-muted-foreground">
              Insira a nova senha para sua conta.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                {...form.register("password")}
                disabled={form.formState.isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmação de senha</Label>
              <Input
                id="confirmPassword"
                type="confirmPassword"
                placeholder=""
                {...form.register("confirmPassword")}
                disabled={form.formState.isSubmitting}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded bg-[--custom-dark]"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {form.formState.isSubmitting && (
                <Loader className="w-4 h-4 animate-spin mr-4" />
              )}
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

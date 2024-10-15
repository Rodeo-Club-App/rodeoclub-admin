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
import { useNavigate } from "react-router-dom";

const recoveryAccountSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .transform((email) => email.toLowerCase().trim()),
});

type RecoveryAccount = z.infer<typeof recoveryAccountSchema>;

export default function RecoveryAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<RecoveryAccount>({
    resolver: zodResolver(recoveryAccountSchema),
  });

  async function onSubmit(data: RecoveryAccount) {
    try {
      await api.post("/forgot-password/rodeoclub", {
        email: data.email,
      });
      navigate("TokenVerification", { state: { email: data.email } });
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
            <h1 className="text-3xl font-bold">Recuperação de senha</h1>
            <p className="text-balance text-muted-foreground">
              Entre com seu e-mail para recuperar sua senha.
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...form.register("email")}
                  disabled={form.formState.isSubmitting}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded bg-[--custom-dark]"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader className="w-4 h-4 animate-spin mr-4" />
                )}
                Prosseguir
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

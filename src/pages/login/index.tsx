import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoTop from "@/assets/pvt-sigla.png";
import logoBottom from "@/assets/logo-pvt-top.png";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("O formato do e-mail é inválido"),
  password: z.string().min(1, "A senha é obrigatória").trim(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useUserAuth();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginForm) {
    const { email, password } = values;

    try {
      await signIn({ email, password });
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
            <h1 className="text-3xl font-bold">Autenticação</h1>
            <p className="text-balance text-muted-foreground">
              Entre com seu e-mail para acessar sua conta.
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
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  disabled={form.formState.isSubmitting}
                  required
                />
                <div className="flex items-center">
                  <Link
                    to="/recoveryAccount"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded bg-[--custom-dark]"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader className="w-4 h-4 animate-spin mr-4" />
                )}
                Entrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import logoTop from "@/assets/pvt-sigla.png";
import logoBottom from "@/assets/logo-pvt-top.png";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { OTPInput, SlotProps } from "input-otp";

import { cn } from "@/lib/utils";

const tokenVerificationSchema = z.object({
  token: z.string(),
});

type RecoveryAccount = z.infer<typeof tokenVerificationSchema>;

export default function TokenVerification() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const location = useLocation();
  const email = location.state?.email || "";

  const form = useForm<RecoveryAccount>({
    resolver: zodResolver(tokenVerificationSchema),
  });

  async function onSubmit(data: RecoveryAccount) {
    console.log(data);
    try {
      await api.post("/forgot-password/rodeoclub/valide-token", {
        email: email,
        token: data.token,
      });

      navigate("reset", { state: { email: email, token: data.token } });
    } catch (error: any) {
      console.log(error);
      toast({ title: error.message, variant: "destructive" });
    }
  }

  function onChange(otp: string) {
    form.setValue("token", otp);
  }

  function FakeCaret() {
    return (
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
        <div className="w-px h-8 bg-black" />
      </div>
    );
  }

  function Slot(props: SlotProps) {
    return (
      <div
        className={cn(
          "relative w-10 h-14 text-[2rem]",
          "flex items-center justify-center",
          "transition-all duration-300",
          "border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md",
          "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20",
          "outline outline-0 outline-accent-foreground/20",
          { "outline-4 outline-accent-foreground": props.isActive }
        )}
      >
        {props.char !== null && <div>{props.char}</div>}
        {props.hasFakeCaret && <FakeCaret />}
      </div>
    );
  }

  function FakeDash() {
    return (
      <div className="flex w-10 justify-center items-center">
        <div className="w-3 h-1 rounded-full bg-border " />
      </div>
    );
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
            <h1 className="text-3xl font-bold"> Token de recuperação</h1>
            <p className="text-balance text-muted-foreground">
              Insira o token enviado para o seu e-mail.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex justify-center">
              <OTPInput
                onChange={onChange}
                maxLength={4}
                containerClassName="group flex items-center has-[:disabled]:opacity-30"
                render={({ slots }) => (
                  <>
                    <div className="flex">
                      {slots.slice(0, 2).map((slot, idx) => (
                        <Slot key={idx} {...slot} />
                      ))}
                    </div>

                    <FakeDash />

                    <div className="flex">
                      {slots.slice(2).map((slot, idx) => (
                        <Slot key={idx} {...slot} />
                      ))}
                    </div>
                  </>
                )}
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
              Verificar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

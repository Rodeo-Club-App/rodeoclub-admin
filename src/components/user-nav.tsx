import { useUserAuth } from "@/hooks/useUserAuth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { useSearchParams } from "react-router-dom";

export function UserNav() {
  const { user } = useUserAuth();
  const [_, setSearchParams] = useSearchParams();

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt={user?.name} />
            <AvatarFallback>{user?.name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <div className="my-2 border-b" />
        <Button
          onClick={() =>
            setSearchParams((p) => {
              p.set("editPassword", "true");
              return p;
            })
          }
          className="w-full bg-amber-400 hover:bg-amber-400 hover:opacity-80 text-black"
        >
          Alterar senha
        </Button>
        <div className="my-2 border-b" />
        <Button variant="outline" className="w-full text-left">
          Sair
        </Button>
      </PopoverContent>
    </Popover>
  );
}

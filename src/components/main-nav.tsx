import { cn } from "@/lib/utils";
import { Home, Rocket, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        to="/"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/" && "text-amber-400"
        )}
      >
        Dashboard
      </Link>
      <Link
        to="/customers"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/customers" && "text-amber-400"
        )}
      >
        Clientes
      </Link>
      <Link
        to="/orders"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/orders" && "text-amber-400"
        )}
      >
        Pedidos
      </Link>

      <Link
        to="/divulgacao"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/divulgacao" && "text-amber-400"
        )}
      >
        Divulgação
      </Link>

      <Link
        to="/midias"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/midias" && "text-amber-400"
        )}
      >
        Midias
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-24">
          <Button
            variant="ghost"
            className="hover:bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Configurações
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Aplicativo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/banners?destination=home")}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Banners Home</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/banners?destination=releases")}
            >
              <Rocket className="mr-2 h-4 w-4" />
              <span>Banners Lançamentos</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard shortcuts</span>
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/user-admin")}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Administradores</span>
            </DropdownMenuItem>
            {/* <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Invite users</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="cursor-pointer">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>More...</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub> */}
            {/* <DropdownMenuItem className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>New Team</span>
              <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Github className="mr-2 h-4 w-4" />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Cloud className="mr-2 h-4 w-4" />
            <span>API</span>
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

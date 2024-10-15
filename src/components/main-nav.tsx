import { cn } from "@/lib/utils";
import { Home, Megaphone, Rocket, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
        to="/products"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/products" && "text-amber-400"
        )}
      >
        Produtos
      </Link>

      <Link
        to="/midias"
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          location.pathname === "/midias" && "text-amber-400"
        )}
      >
        Mídias
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
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/banners?destination=releases")}
            >
              <Rocket className="mr-2 h-4 w-4" />
              <span>Banners Lançamentos</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              <span>Divulgações</span>
            </DropdownMenuItem>
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
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

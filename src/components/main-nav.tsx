import { cn } from "@/lib/utils";
import {
  CloudDownload,
  Eye,
  GitBranch,
  Home,
  Megaphone,
  Package,
  RefreshCcwDot,
  Rocket,
  ShoppingCart,
  Star,
  TabletSmartphone,
  Users,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  function handleImportProduts() {
    toast({
      title: "Script executado",
      description:
        "A importação de novos produtos está em execução em segundo plano, avisaremos você quando a importação finalizar",
      variant: "success",
    });

    api.post("/products/rodeoclub/import").then((r) => {
      toast({
        title: "Tarefa finalizada!",
        description: r.data.message,
        variant: "success",
      });
    });
  }
  function handleUpdateProducts() {
    toast({
      title: "Script executado",
      description:
        "A atualização de produtos está em execução em segundo plano",
      variant: "success",
    });

    api.post("/products/rodeoclub/update-products-list").then(() => {
      toast({
        title: "Tarefa finalizada!",
        description:
          "O script de produtos foi concluído e as novas informações já está atualizadas!",
        variant: "success",
      });
    });
  }
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-16">
          <Button
            variant="ghost"
            className="hover:bg-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Relatórios
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40">
          <DropdownMenuLabel>Relatórios</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/orders")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Pedidos</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/products")}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Produtos</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/logs")}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>Acessos</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
          <DropdownMenuLabel className="flex items-center gap-2">
            Aplicativo <TabletSmartphone className="w-4 h-4" />
          </DropdownMenuLabel>
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
              onClick={() => navigate("/products-highlights")}
            >
              <Star className="mr-2 h-4 w-4" />
              <span>Produtos em destaque</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
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
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="flex items-center gap-2">
            Automações <GitBranch className="w-4 h-4" />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleImportProduts}
            >
              <CloudDownload className="mr-2 h-4 w-4" />
              <span>Importar novos produtos</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleUpdateProducts}
            >
              <RefreshCcwDot className="mr-2 h-4 w-4" />
              <span>Atualizar produtos</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

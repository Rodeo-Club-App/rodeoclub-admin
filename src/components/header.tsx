import logo from "@/assets/logo-pvt-top.png";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  ChartBar,
  ClipboardList,
  CloudDownload,
  Eye,
  GitBranch,
  Home,
  Megaphone,
  Menu,
  RefreshCcwDot,
  Rocket,
  ShoppingCart,
  Star,
  TabletSmartphone,
  User,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { UpdatePasswordModal } from "./modals/update-password-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { ScrollArea } from "./ui/scroll-area";

export function Header() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editPassword = searchParams.get("editPassword") as "true" | "false";

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
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <ScrollArea className="h-full">
                <nav className="grid gap-5 text-lg font-medium mt-5">
                  <Link
                    to="/"
                    className="flex items-center gap-4 text-base font-medium  text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>

                  <Link
                    to="/customers"
                    className="flex items-center gap-4 text-base font-medium  text-muted-foreground hover:text-foreground"
                  >
                    <User className="h-5 w-5" />
                    Clientes
                  </Link>

                  <Link
                    to="/midias"
                    className="flex items-center gap-4 text-sm font-medium  text-muted-foreground hover:text-foreground"
                  >
                    <ChartBar className="h-5 w-5" />
                    Mídias
                  </Link>

                  <div className="flex items-center  mt-5">
                    <Label className="text-base font-medium mr-1">
                      Relatórios
                    </Label>
                    <ClipboardList className="w-4 h-4" />
                  </div>

                  <Link
                    to="/orders"
                    className="flex items-center gap-4 text-base font-medium  text-muted-foreground hover:text-foreground"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Pedidos
                  </Link>

                  <Link
                    to="/products"
                    className="flex items-center gap-4 text-base font-medium  text-muted-foreground hover:text-foreground"
                  >
                    <Box className="h-5 w-5" />
                    Produtos
                  </Link>

                  <Link
                    to="/logs"
                    className="flex items-center gap-4 text-base font-medium  text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-5 w-5" />
                    Acessos
                  </Link>

                  <div className="flex items-center  mt-5">
                    <Label className="text-base font-medium mr-1">
                      Aplicativo
                    </Label>
                    <TabletSmartphone className="w-4 h-4" />
                  </div>

                  <div className="">
                    <Button
                      className="flex text-base mb-1 p-0 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate("/banners?destination=home")}
                    >
                      <Home className="h-5 w-5" />
                      Banners Home
                    </Button>
                    <Button
                      className="flex p-0 text-base mb-1 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate("/banners?destination=releases")}
                    >
                      <Rocket className="h-5 w-5" />
                      <span className="flex flex-wrap text-left whitespace-normal">
                        Banners Lançamentos
                      </span>
                    </Button>
                    <Button
                      className="flex p-0 text-base mb-1 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate("/products-highlights")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Produtos em destaque
                    </Button>
                    <Button className="flex p-0 text-base mb-1 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground">
                      <Megaphone className="h-5 w-5" />
                      Divulgações
                    </Button>

                    <Button
                      className="flex p-0 text-base mb-1 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate("/user-admin")}
                    >
                      <Users className="h-5 w-5" />
                      Administradores
                    </Button>
                  </div>

                  <div className="flex items-center">
                    <Label className="text-base font-medium mr-1">
                      Automações
                    </Label>
                    <GitBranch className="w-4 h-4" />
                  </div>

                  <div className="">
                    <Button
                      className="flex items-center justify-start text-base mb-1 p-0 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                      onClick={handleImportProduts}
                    >
                      <CloudDownload className="h-4 w-4" />
                      <span className="flex flex-wrap text-left whitespace-normal">
                        Importar novos produtos
                      </span>
                    </Button>
                    <Button
                      className="flex p-0 text-base mb-1 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                      onClick={handleUpdateProducts}
                    >
                      <RefreshCcwDot className="h-4 w-4" />
                      Atualizar produtos
                    </Button>
                  </div>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <img src={logo} className="w-[150px] ml-auto md:ml-0" alt="" />

          <MainNav className="mx-6 hidden md:flex" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      {editPassword !== "false" && editPassword && <UpdatePasswordModal />}
    </>
  );
}

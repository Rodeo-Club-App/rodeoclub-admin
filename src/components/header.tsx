import logo from "@/assets/logo-pvt-top.png";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  ChartBar,
  ClipboardList,
  Home,
  Megaphone,
  Menu,
  Rocket,
  User,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export function Header() {
  const navigate = useNavigate();

  return (
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
            <nav className="grid gap-6 text-lg font-medium mt-5">
              <Link
                to="/"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>

              <Link
                to="/customers"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <User className="h-5 w-5" />
                Clientes
              </Link>

              <Link
                to="/orders"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <ClipboardList className="h-5 w-5" />
                Pedidos
              </Link>

              <Link
                to="/products"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Box className="h-5 w-5" />
                Produtos
              </Link>

              <Link
                to="/midias"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <ChartBar className="h-5 w-5" />
                Mídias
              </Link>

              <Label className="pl-3 mt-5 text-lg font-medium">
                Configurações
              </Label>

              <div className="pl-3">
                <Button
                  className="flex text-base mb-2 p-0 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/banners?destination=home")}
                >
                  <Home className="h-5 w-5" />
                  Banners Home
                </Button>
                <Button
                  className="flex p-0 text-base mb-2 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/banners?destination=releases")}
                >
                  <Rocket className="h-5 w-5" />
                  Banners Lançamentos
                </Button>
                <Button
                  className="flex p-0 text-base mb-2 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/")}
                >
                  <Megaphone className="h-5 w-5" />
                  Divulgações
                </Button>

                <Button
                  className="flex p-0 text-base mb-2 bg-transparent hover:bg-transparent gap-4 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/user-admin")}
                >
                  <Users className="h-5 w-5" />
                  Administradores
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <img src={logo} className="w-[150px] ml-auto md:ml-0" alt="" />

        <MainNav className="mx-6 hidden md:flex" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
}

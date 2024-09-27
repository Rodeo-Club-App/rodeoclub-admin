import logo from "@/assets/logo-pvt-top.png";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <img src={logo} className="w-[150px]" alt="" />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
}

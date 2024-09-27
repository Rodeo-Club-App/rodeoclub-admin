import { UserAuthContext } from "@/context/userAuthContext";
import { useContext } from "react";

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  return context;
}

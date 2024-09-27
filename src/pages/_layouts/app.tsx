// import { isAxiosError } from 'axios'
// import { useAuth } from "@/hooks/auth";
import { useEffect, useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "@/hooks/useUserAuth";

export function AppLayout() {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return navigate("/login", { replace: true });
    }
  }, [navigate, user]);

  if (!user) return null;

  return <Outlet />;
}

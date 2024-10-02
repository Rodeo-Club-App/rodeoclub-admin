// import { isAxiosError } from 'axios'
// import { useAuth } from "@/hooks/auth";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "@/hooks/useUserAuth";
import { setNavigator } from "@/utils/navigationHelper";

export function AppLayout() {
  const { user, isFetchingDataInStorage } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  useEffect(() => {
    if (isFetchingDataInStorage) return;

    if (!user?.email) {
      return navigate("/login", { replace: true });
    }
  }, [navigate, user, isFetchingDataInStorage]);

  if (!user?.email) return null;

  return <Outlet />;
}

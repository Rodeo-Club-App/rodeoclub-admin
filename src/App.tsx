import "react-circular-progressbar/dist/styles.css";

import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Login } from "./pages/login";
import { RouterProvider, useNavigate } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserAuthContextProvider } from "@/context/userAuthContext";
import { setNavigator } from "@/utils/navigationHelper";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserAuthContextProvider>
        <Toaster />
        <RouterProvider router={router} />
      </UserAuthContextProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState } from "react";
import { Button } from "./components/ui/button";
import { Login } from "./pages/login";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/toaster";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { UserAuthContextProvider } from "@/context/userAuthContext";

const queryClient = new QueryClient();
function App() {
  const [count, setCount] = useState(0);

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

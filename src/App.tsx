import "react-circular-progressbar/dist/styles.css";

import { UserAuthContextProvider } from "@/context/userAuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { router } from "./routes";

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

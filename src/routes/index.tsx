import { createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "@/pages/_layouts/auth";
import { AppLayout } from "@/pages/_layouts/app";
import { NotFound } from "@/pages/404";
import { Dashboard } from "@/pages/dashboard";
// import { Videos } from "@/pages/videos";
import { Login } from "@/pages/login";
import { Medias } from "@/pages/medias";
import { HomeBanners } from "@/pages/home-banners";
import { BannersForm } from "@/pages/home-banners/form";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/midias",
        element: <Medias />,
      },
      {
        path: "/home-banners",
        element: <HomeBanners />,
      },
      {
        path: "/banners-form/:id",
        element: <BannersForm />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

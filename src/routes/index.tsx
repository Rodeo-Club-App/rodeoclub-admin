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
import { Orders } from "@/pages/orders";
import { Customers } from "@/pages/customers";
import { CustomerForm } from "@/pages/customers/form";
import { UserAdmin } from "@/pages/user-admin";
import { Products } from "@/pages/products";
import RecoveryAccount from "@/pages/recoveryAccount/recoveryAccountResquest";
import TokenVerification from "@/pages/recoveryAccount/tokenVerification";
import RedefinePassword from "@/pages/recoveryAccount/reset";
import { LogsCustomers } from "@/pages/logs-customers";
import { PromotionNotification } from "@/pages/product-promotion-notification";
import { ProductsHighlights } from "@/pages/products-highlights";
import { Categories } from "@/pages/categories";
import { Partners } from "@/pages/partners";

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
        path: "/banners",
        element: <HomeBanners />,
      },
      {
        path: "/banners-form/:id",
        element: <BannersForm />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/customers/:id",
        element: <CustomerForm />,
      },
      {
        path: "/user-admin",
        element: <UserAdmin />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/logs",
        element: <LogsCustomers />,
      },
      {
        path: "/promotion-notification",
        element: <PromotionNotification />,
      },
      {
        path: "/products-highlights",
        element: <ProductsHighlights />,
      },
      {
        path: "/categories",
        element: <Categories />,
      },
      {
        path: "/partners",
        element: <Partners />,
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
      {
        path: "/recoveryAccount",
        element: <RecoveryAccount />,
      },
      {
        path: "/recoveryAccount/TokenVerification",
        element: <TokenVerification />,
      },
      {
        path: "/recoveryAccount/TokenVerification/reset",
        element: <RedefinePassword />,
      },
    ],
  },
]);

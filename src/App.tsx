import { createBrowserRouter, RouterProvider } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute, PublicRoute } from "@/components/auth/AuthRoute";
import { ReportsPage } from "./pages/ReportsPage";
import { CustomerListPage } from "@/pages/CustomerListPage";
import { CustomerDetailsPage } from "@/pages/CustomerDetailsPage";
import { CustomerCreatePage } from "@/pages/CustomerCreatePage";
import { OrderPlacementPage } from "@/pages/OrderPlacementPage";
import { OrderCreatePage } from "@/pages/OrderCreatePage";
import { PreOrderPlacementPage } from "@/pages/PreOrderPlacementPage";
import { PreOrderCreatePage } from "@/pages/PreOrderCreatePage";

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "order-placement",
            element: <OrderPlacementPage />,
          },
          {
            path: "order-placement/:xcus",
            element: <OrderCreatePage />,
          },
          {
            path: "customer-list",
            element: <CustomerListPage />,
          },
          {
            path: "customer-list/new",
            element: <CustomerCreatePage />,
          },
          {
            path: "customer-list/:xcus",
            element: <CustomerDetailsPage />,
          },
          {
            path: "knowledge",
            element: <NotFoundPage />,
          },
          {
            path: "pre-orders",
            element: <PreOrderPlacementPage />,
          },
          {
            path: "pre-orders/:xcus",
            element: <PreOrderCreatePage />,
          },
          {
            path: "collections",
            element: <NotFoundPage />,
          },
          {
            path: "sales-return",
            element: <NotFoundPage />,
          },
          {
            path: "achievement",
            element: <NotFoundPage />,
          },
          {
            path: "reports",
            children: [
              { index: true, element: <ReportsPage /> },
              { path: "sales-report", element: <NotFoundPage /> },
              { path: "collection-report", element: <NotFoundPage /> },
              { path: "return-report", element: <NotFoundPage /> },
              { path: "pre-order-report", element: <NotFoundPage /> },
            ],
          },
          {
            path: "settings",
            element: <NotFoundPage />,
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

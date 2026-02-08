import { createBrowserRouter, RouterProvider } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute, PublicRoute } from "@/components/auth/AuthRoute";
import { ReportsPage } from "./pages/ReportsPage";
import { CustomerListPage } from "@/pages/CustomerListPage";

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
            element: <NotFoundPage />,
          },
          {
            path: "customer-list",
            element: <CustomerListPage />,
          },
          {
            path: "knowledge",
            element: <NotFoundPage />,
          },
          {
            path: "pre-orders",
            element: <NotFoundPage />,
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

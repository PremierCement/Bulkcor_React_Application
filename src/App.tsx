import { createBrowserRouter, RouterProvider } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProtectedRoute, PublicRoute } from "@/components/auth/AuthRoute";

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
            path: "sales",
            element: <div className="p-4">Sales Page (Coming Soon)</div>,
          },
          {
            path: "inventory",
            element: <div className="p-4">Inventory Page (Coming Soon)</div>,
          },
          {
            path: "customers",
            element: <div className="p-4">Customers Page (Coming Soon)</div>,
          },
          {
            path: "profile",
            element: <div className="p-4">User Profile Page (Coming Soon)</div>,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

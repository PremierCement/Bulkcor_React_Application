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
import PaymentCollectionsPage from "@/pages/PaymentCollectionsPage";
import { SalesReturnPlacementPage } from "@/pages/SalesReturnPlacementPage";
import { SalesReturnCreatePage } from "@/pages/SalesReturnCreatePage";
import { SalesReportPage } from "@/pages/SalesReportPage";
import { CollectionReportPage } from "@/pages/CollectionReportPage";
import { PreOrderReportPage } from "@/pages/PreOrderReportPage";
import { SalesReturnReportPage } from "@/pages/SalesReturnReportPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { DeviceInfoPage } from "@/pages/DeviceInfoPage";
import { AboutPage } from "@/pages/AboutPage";

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
            element: <PaymentCollectionsPage />,
          },
          {
            path: "collections/:xcus",
            element: <PaymentCollectionsPage />,
          },
          {
            path: "sales-return",
            element: <SalesReturnPlacementPage />,
          },
          {
            path: "sales-return/:xcus",
            element: <SalesReturnCreatePage />,
          },
          {
            path: "achievement",
            element: <NotFoundPage />,
          },
          {
            path: "reports",
            children: [
              { index: true, element: <ReportsPage /> },
              { path: "sales-report", element: <SalesReportPage /> },
              { path: "collection-report", element: <CollectionReportPage /> },
              { path: "return-report", element: <SalesReturnReportPage /> },
              { path: "pre-order-report", element: <PreOrderReportPage /> },
            ],
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "settings/device-info",
            element: <DeviceInfoPage />,
          },
          {
            path: "settings/about",
            element: <AboutPage />,
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

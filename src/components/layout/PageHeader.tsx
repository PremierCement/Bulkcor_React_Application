import { useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  "customer-list": "Customer List",
  "order-placement": "Order Placement",
  achievement: "Achievement",
  reports: "Reports",
  knowledge: "Knowledge",
  settings: "Settings",
  "pre-orders": "Pre Orders",
  collections: "Collections",
  "sales-return": "Sales Return",
  "sales-report": "Sales Report",
  "collection-report": "Collection Report",
  "return-report": "Return Report",
  "pre-order-report": "Pre Order Report",
};

export function PageHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show header on dashboard
  if (pathnames.length === 0) return null;

  const currentPath = pathnames[pathnames.length - 1];
  const title =
    routeLabels[currentPath] ||
    currentPath.charAt(0).toUpperCase() +
      currentPath.slice(1).replace(/-/g, " ");

  return (
    <div className="sticky top-0 z-30 flex items-center gap-4 bg-slate-50/80 px-4 py-4 md:px-6 backdrop-blur-md transition-colors dark:bg-slate-950/80 border-b dark:border-slate-800">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-white shadow-sm transition-all active:scale-90 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
          {title}
        </h1>
      </div>
    </div>
  );
}

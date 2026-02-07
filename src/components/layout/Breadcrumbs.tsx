import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

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
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center">
      <ol className="flex items-center space-x-2">
        <li>
          {pathnames.length === 0 ? (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Home className="h-4 w-4 text-primary" />
              <span>Dashboard</span>
            </div>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </li>

        {pathnames.length > 0 && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </li>
        )}

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label =
            routeLabels[name] ||
            name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

          return (
            <li key={name} className="flex items-center">
              {isLast ? (
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {label}
                </span>
              ) : (
                <>
                  <Link
                    to={routeTo}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-2" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

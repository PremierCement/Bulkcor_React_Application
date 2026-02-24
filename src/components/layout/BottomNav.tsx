import { NavLink } from "react-router";
import {
  LayoutDashboard,
  FileChartColumn,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileChartColumn, label: "Reports", href: "/reports" },
  { icon: ShoppingCart, label: "Sales", href: "/order-placement" },
  { icon: CreditCard, label: "Collections", href: "/collections" },
];

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-all active:scale-95 active:opacity-80",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground dark:text-slate-500 dark:hover:text-slate-300",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

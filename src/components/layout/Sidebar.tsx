import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Trophy,
  FileChartColumn,
  BookOpenText,
  Settings,
  X,
  UserSearch,
  ShoppingCart,
  Sun,
  Moon,
  Package,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/bulkcor_t.png";
import { useThemeStore } from "@/store/useThemeStore";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: UserSearch, label: "Customer List", href: "/customer-list" },
  { icon: ShoppingCart, label: "Order Placement", href: "/order-placement" },
  { icon: CreditCard, label: "Payment Collections", href: "/collections" },
  { icon: Package, label: "Sales Return", href: "/sales-return" },
  { icon: Trophy, label: "Achievement", href: "/achievement" },
  { icon: FileChartColumn, label: "Reports", href: "/reports" },
  { icon: BookOpenText, label: "Knowledge", href: "/knowledge" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar({ onClose, className }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-white dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-3 border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Bulkcor Logo"
            className="h-12 w-auto flex-shrink-0"
          />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold uppercase tracking-tight text-slate-700 dark:text-slate-200">
              Bulkcor
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Trading LLC
            </span>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-[0.98] active:opacity-90",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t dark:border-slate-800">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 transition-colors">
          <div>
            <p className="text-xs font-semibold text-foreground dark:text-slate-300">
              Bulkcor Trading LLC
            </p>
            <p className="text-[10px] text-muted-foreground dark:text-slate-500">
              Version 1.0.0
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 transition-colors hover:bg-white dark:hover:bg-slate-800"
            onClick={toggleTheme}
            title={theme === "light" ? "Dark Mode" : "Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-slate-600" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

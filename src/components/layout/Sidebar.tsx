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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/bulkcor_t.png";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: UserSearch, label: "Customer List", href: "/customer-list" },
  { icon: ShoppingCart, label: "Order Placement", href: "/order-placement" },
  { icon: Trophy, label: "Achievement", href: "/achievement" },
  { icon: FileChartColumn, label: "Reports", href: "/reports" },
  { icon: BookOpenText, label: "Knowledge", href: "/knowledge" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar({ onClose, className }: SidebarProps) {
  return (
    <div className={cn("flex h-full flex-col border-r bg-white", className)}>
      <div className="flex h-16 items-center justify-between px-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Bulkcor Logo"
            className="h-18 w-auto flex-shrink-0"
          />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold uppercase tracking-tight text-slate-700">
              Bulkcor
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-semibold text-foreground">
            Bulkcor Trading LLC
          </p>
          <p className="text-[10px] text-muted-foreground">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

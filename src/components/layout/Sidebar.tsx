import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingBag, label: "Sales", href: "/sales" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar({ onClose, className }: SidebarProps) {
  return (
    <div className={cn("flex h-full flex-col border-r bg-white", className)}>
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <span className="text-xl font-bold text-primary">
          Bulkcor Trading LLC
        </span>
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

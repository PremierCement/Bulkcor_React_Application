import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

import Logo from "@/assets/bulkcor_t.png";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white transition-colors dark:border-slate-800 dark:bg-slate-900 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden active:scale-95"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <div className="flex items-center gap-2 md:hidden">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
              <span className="text-sm font-semibold uppercase text-slate-800 dark:text-slate-200">
                Bulkcor Trading LLC
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-slate-200 transition-all active:scale-95 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.first_name || "User"}
              <p className="text-xs font-normal text-muted-foreground">
                {user?.username}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

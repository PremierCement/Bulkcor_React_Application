import { useState } from "react";
import { Outlet } from "react-router";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PageHeader } from "@/components/layout/PageHeader";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 md:block">
        <Sidebar className="fixed inset-y-0 w-64" />
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72" showCloseButton={false}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <div className="mx-auto max-w-7xl">
            <PageHeader />
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

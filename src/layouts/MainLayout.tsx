import { useState, useRef } from "react";
import { Outlet } from "react-router";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 400);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 transition-colors dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 md:block border-r dark:border-slate-800">
        <Sidebar className="w-64" />
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72" showCloseButton={false}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isSidebarOpen={isSidebarOpen}
        />

        <main
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative"
        >
          <PageHeader />
          <div className="mx-auto max-w-7xl p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
          </div>

          {/* Scroll to Top Button */}
          <Button
            variant="default"
            size="icon"
            className={cn(
              "fixed bottom-20 right-4 h-11 w-11 rounded-full shadow-2xl transition-all duration-300 md:bottom-6 md:right-8 z-50",
              showScrollTop
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-0 opacity-0 translate-y-10",
            )}
            onClick={scrollToTop}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

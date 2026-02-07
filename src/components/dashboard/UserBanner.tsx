import { useAuthStore } from "@/store/useAuthStore";
import { Calendar } from "lucide-react";

export function UserBanner() {
  const { user } = useAuthStore();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/50 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900">
      {/* background glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-slate-100 blur-3xl dark:bg-slate-800/50" />

      {/* content */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* left: user info */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* avatar */}
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-slate-50 p-1 ring-1 ring-slate-200/50 dark:bg-slate-800 dark:ring-slate-700">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/60 shadow-inner">
                <span className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                  {user?.first_name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          </div>

          {/* text */}
          <div className="min-w-0">
            <h1 className="truncate text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Hello,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {user?.first_name || "User"}
              </span>
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {user?.user_type || "Standard"}
              </span>
              <span className="font-mono text-[11px] sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                ID: {user?.username || "000000"}
              </span>
            </div>
          </div>
        </div>

        {/* right / bottom: date */}
        <div className="flex w-full justify-end md:w-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 dark:border-slate-800 dark:bg-slate-800/50">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-black tracking-tight text-slate-700 dark:text-slate-200">
              {today.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

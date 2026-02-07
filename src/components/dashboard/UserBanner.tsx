import { useAuthStore } from "@/store/useAuthStore";
import { Calendar } from "lucide-react";

export function UserBanner() {
  const { user } = useAuthStore();

  // Format today's date (e.g., "Fri, Feb 07")
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white/40 p-6 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40">
      {/* Subtle Background Gradient Orb (Decorative) */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/5 to-transparent blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Left: User Info */}
        <div className="flex items-center gap-4">
          {/* Avatar / Placeholder */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner dark:from-slate-800 dark:to-slate-900">
            <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
              {user?.first_name?.charAt(0) || "U"}
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hello, {user?.first_name || "User"}!
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Welcome to your dashboard.
            </p>
          </div>
        </div>

        {/* Right: Actions & Date */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar (Hidden on small mobile) */}
          {/* <div className="hidden items-center rounded-full border border-slate-200/50 bg-white/50 px-3 py-1.5 backdrop-blur-sm sm:flex dark:border-slate-700/50 dark:bg-slate-800/50">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-24 lg:w-48 text-slate-700 dark:text-slate-200"
            />
          </div> */}

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Date Badge */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{today}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

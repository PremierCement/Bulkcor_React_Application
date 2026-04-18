import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import Logo from "@/assets/bulkcor_t.png";

export function AboutPage() {
  const navigate = useNavigate();

  const appInfo = {
    name: "Bulkcor Trading LLC",
    version: import.meta.env.VITE_APP_VERSION || "1.3.5",
    releaseDate: import.meta.env.VITE_APP_RELEASE_DATE || "April 13, 2026",
    description:
      "A comprehensive solution for sales, inventory, and payment collection tracking. Designed to streamline operations and enhance field productivity.",
    copyright: "© 2026 Bulkcor Trading LLC. All rights reserved.",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            About Application
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo Section */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
          <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 transition-transform duration-500 hover:scale-105">
            <img
              src={Logo}
              alt="Bulkcor Logo"
              className="h-24 w-auto drop-shadow-lg"
            />
          </div>
        </div>

        {/* Branding */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            {appInfo.name}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase tracking-widest border border-primary/20">
              v{appInfo.version}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {appInfo.releaseDate}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        {/* <div className="w-full space-y-4 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed text-slate-600 dark:text-slate-400 text-sm text-center">
            {appInfo.description}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a
              href="#"
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Website
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Support
              </span>
            </a>
          </div>
        </div> */}

        {/* Legal Branding */}
        <div className="flex flex-col items-center gap-6 mt-auto">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Verified Secure Build
            </span>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium whitespace-nowrap">
              {appInfo.copyright}
            </p>
            {/* <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-[10px] text-slate-300 dark:text-slate-700 hover:text-primary cursor-pointer transition-colors uppercase font-bold tracking-widest">
                Privacy Policy
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] text-slate-300 dark:text-slate-700 hover:text-primary cursor-pointer transition-colors uppercase font-bold tracking-widest">
                Terms of Service
              </span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

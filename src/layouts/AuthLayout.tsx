import { Outlet } from "react-router";
import Logo from "@/assets/bulkcor_t.png";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-900 dark:ring-slate-800">
            <img src={Logo} alt="Bulkcor Trading" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bulkcor Trading LLC
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

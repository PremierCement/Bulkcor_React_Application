import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary italic">Bulkcor</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your trading account
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

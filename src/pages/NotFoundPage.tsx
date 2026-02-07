import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Hammer, ArrowLeft, Home } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <Hammer className="h-12 w-12 text-primary animate-bounce" />
        </div>
      </div>

      <h1 className="mb-2 text-4xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
        404
      </h1>
      <h2 className="mb-4 text-xl font-bold text-slate-700 dark:text-slate-300">
        Feature not available
      </h2>
      <p className="mb-10 max-w-md text-base text-slate-500 dark:text-slate-400">
        The feature you are looking for might have been removed or is
        temporarily unavailable.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>

      <div className="mt-16 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
        <span>Bulkcor Trading LLC</span>
        <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

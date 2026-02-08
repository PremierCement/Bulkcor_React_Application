import { useToast } from "@/store/useToast";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[320px] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
            toast.type === "success" &&
              "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
            toast.type === "error" &&
              "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
            toast.type === "info" &&
              "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
          )}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
            {toast.type === "info" && <Info className="h-4 w-4" />}
          </div>
          <div className="flex-1 text-sm font-medium leading-tight">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-lg p-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-3.5 w-3.5 opacity-50" />
          </button>
        </div>
      ))}
    </div>
  );
}

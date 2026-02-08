import { Link } from "react-router";
import {
  FileChartPie,
  FileUp,
  FileOutput,
  FileChartColumn,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export function ReportsPage() {
  const stats = [
    {
      label: "Sales Report",
      icon: FileChartColumn,
      href: "sales-report",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgGradient:
        "bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
      shadowColor: "shadow-emerald-500/10",
    },
    {
      label: "Collection Report",
      value: "45",
      icon: FileChartPie,
      href: "collection-report",
      textColor: "text-blue-600 dark:text-blue-400",
      bgGradient:
        "bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent",
      borderColor: "border-blue-200/50 dark:border-blue-800/50",
      shadowColor: "shadow-blue-500/10",
    },
    {
      label: "Return Report",
      value: "1220",
      icon: FileOutput,
      href: "return-report",
      textColor: "text-purple-600 dark:text-purple-400",
      bgGradient:
        "bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent",
      borderColor: "border-purple-200/50 dark:border-purple-800/50",
      shadowColor: "shadow-purple-500/10",
    },
    {
      label: "Pre Order Report",
      value: "850",
      icon: FileUp,
      href: "pre-order-report",
      textColor: "text-orange-600 dark:text-orange-400",
      bgGradient:
        "bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent",
      borderColor: "border-orange-200/50 dark:border-orange-800/50",
      shadowColor: "shadow-orange-500/10",
    },
  ];

  return (
    <div className="relative">
      <PageHeader />
      <div className="p-4 md:p-6 mt-2 md:mt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className={`
                group relative overflow-hidden
                min-h-[120px] 
                rounded-lg border
                backdrop-blur-xl 
                transition-all duration-300
                hover:scale-[1.02] active:scale-[0.95] active:opacity-90
                hover:shadow-lg
                ${stat.bgGradient}
                ${stat.borderColor}
                ${stat.shadowColor}
                dark:bg-none
              `}
            >
              <div className="absolute inset-0 bg-white/40 transition-colors group-hover:bg-white/20 dark:bg-slate-900/50 dark:group-hover:bg-slate-900/30" />

              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                <stat.icon
                  className={`
                    h-10 w-10 sm:h-12 sm:w-12
                    transition-transform duration-300
                    group-hover:scale-110
                    ${stat.textColor}
                  `}
                  strokeWidth={1.5}
                />

                <div className="text-sm sm:text-base font-semibold tracking-tight">
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { UserBanner } from "@/components/dashboard/UserBanner";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

export function DashboardPage() {
  const stats = [
    {
      label: "Orders",
      value: "$12,450",
      icon: TrendingUp,
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgGradient:
        "bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
      shadowColor: "shadow-emerald-500/10",
    },
    {
      label: "Pre Orders",
      value: "45",
      icon: ShoppingBag,
      textColor: "text-blue-600 dark:text-blue-400",
      bgGradient:
        "bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent",
      borderColor: "border-blue-200/50 dark:border-blue-800/50",
      shadowColor: "shadow-blue-500/10",
    },
    {
      label: "Collections",
      value: "120",
      icon: Users,
      textColor: "text-purple-600 dark:text-purple-400",
      bgGradient:
        "bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent",
      borderColor: "border-purple-200/50 dark:border-purple-800/50",
      shadowColor: "shadow-purple-500/10",
    },
    {
      label: "Sales Return",
      value: "850",
      icon: Package,
      textColor: "text-orange-600 dark:text-orange-400",
      bgGradient:
        "bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent",
      borderColor: "border-orange-200/50 dark:border-orange-800/50",
      shadowColor: "shadow-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <UserBanner />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`
              relative overflow-hidden
              min-h-[120px] 
              rounded-lg border
              backdrop-blur-xl 
              ${stat.bgGradient}
              ${stat.borderColor}
              ${stat.shadowColor}
            `}
          >
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20" />

            <div className="relative z-10 p-4 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                    {stat.label}
                  </p>
                  <div className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    {stat.value}
                  </div>
                </div>

                {/* Big Icon */}
                <stat.icon
                  className={`h-10 w-10 opacity-80 ${stat.textColor}`}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

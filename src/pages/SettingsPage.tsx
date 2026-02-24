import {
  Moon,
  Sun,
  ChevronRight,
  User,
  Shield,
  Info,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useThemeStore } from "@/store/useThemeStore";
import { PageHeader } from "@/components/layout/PageHeader";

interface SettingItem {
  icon: any;
  iconBg: string;
  label: string;
  description: string;
  hasToggle: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const settingsGroups: SettingGroup[] = [
    {
      title: "General",
      items: [
        {
          icon: theme === "light" ? Sun : Moon,
          iconBg: "bg-blue-500",
          label: "Dark Mode",
          description: "Change the appearance of the application",
          hasToggle: true,
          toggleValue: theme === "dark",
          onToggle: toggleTheme,
        },
        {
          icon: Smartphone,
          iconBg: "bg-purple-500",
          label: "Device Info",
          description: "Technical details about your device",
          hasToggle: false,
        },
        {
          icon: Info,
          iconBg: "bg-slate-500",
          label: "About Application",
          description: "Version, license, and legal info",
          hasToggle: false,
        },
      ],
    },
    {
      title: "Account & Security",
      items: [
        {
          icon: User,
          iconBg: "bg-emerald-500",
          label: "Update Profile",
          description: "Manage your personal information",
          hasToggle: false,
        },
        {
          icon: Shield,
          iconBg: "bg-indigo-500",
          label: "Password Reset",
          description: "Change your password",
          hasToggle: false,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader title="Settings" />

      <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h3 className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.title}
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`
                    group relative flex items-center justify-between p-4 transition-colors
                    ${itemIndex !== group.items.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}
                    ${!item.hasToggle ? "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer active:scale-[0.995]" : ""}
                  `}
                  onClick={() => {
                    if (!item.hasToggle) {
                      if (item.label === "Device Info") {
                        navigate("/settings/device-info");
                      } else if (item.label === "About Application") {
                        navigate("/settings/about");
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                      h-10 w-10 rounded-2xl ${item.iconBg} flex items-center justify-center text-white
                      shadow-lg shadow-${item.iconBg.split("-")[1]}-500/20
                    `}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {item.hasToggle ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onToggle?.();
                      }}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900
                        ${item.toggleValue ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${item.toggleValue ? "translate-x-6" : "translate-x-1"}
                        `}
                      />
                    </button>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* <div className="pt-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium whitespace-nowrap">
            Bulkcor Trading LLC • Version 1.0.0 (Release)
          </p>
        </div> */}
      </div>
    </div>
  );
}

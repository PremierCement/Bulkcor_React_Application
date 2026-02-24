import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Monitor,
  Smartphone,
  Globe,
  Cpu,
  Maximize,
  Languages,
  Clock,
  Radical,
} from "lucide-react";
import { useNavigate } from "react-router";

interface DeviceData {
  os: string;
  browser: string;
  screenResolution: string;
  viewportSize: string;
  language: string;
  timeZone: string;
  platform: string;
  cores: string;
  memory: string;
  touchSupport: string;
}

export function DeviceInfoPage() {
  const navigate = useNavigate();
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);

  useEffect(() => {
    const getBrowser = () => {
      const ua = navigator.userAgent;
      if (ua.includes("Firefox")) return "Mozilla Firefox";
      if (ua.includes("SamsungBrowser")) return "Samsung Internet";
      if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
      if (ua.includes("Trident")) return "Internet Explorer";
      if (ua.includes("Edge")) return "Microsoft Edge";
      if (ua.includes("Chrome")) return "Google Chrome";
      if (ua.includes("Safari")) return "Safari";
      return "Unknown";
    };

    const getOS = () => {
      const ua = navigator.userAgent;
      if (ua.includes("Win")) return "Windows";
      if (ua.includes("Mac")) return "macOS";
      if (ua.includes("X11")) return "UNIX";
      if (ua.includes("Linux")) return "Linux/Android";
      if (ua.includes("Android")) return "Android";
      if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
      return "Unknown";
    };

    setDeviceData({
      os: getOS(),
      browser: getBrowser(),
      screenResolution: `${window.screen.width} x ${window.screen.height}`,
      viewportSize: `${window.innerWidth} x ${window.innerHeight}`,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: (navigator as any).platform || "N/A",
      cores: navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} Cores`
        : "N/A",
      memory: (navigator as any).deviceMemory
        ? `${(navigator as any).deviceMemory} GB`
        : "N/A",
      touchSupport:
        "ontouchstart" in window || navigator.maxTouchPoints > 0 ? "Yes" : "No",
    });
  }, []);

  const infoGroups = [
    {
      title: "System Hardware",
      items: [
        {
          label: "Device Type",
          value:
            deviceData?.os === "Android" ||
            deviceData?.os === "iOS" ||
            deviceData?.os === "Linux/Android"
              ? "Mobile"
              : "Desktop",
          icon:
            deviceData?.os === "Android" ||
            deviceData?.os === "iOS" ||
            deviceData?.os === "Linux/Android"
              ? Smartphone
              : Monitor,
          iconBg: "bg-blue-500",
        },
        {
          label: "Platform",
          value: deviceData?.platform,
          icon: Cpu,
          iconBg: "bg-indigo-500",
        },
        {
          label: "Processor Cores",
          value: deviceData?.cores,
          icon: Cpu,
          iconBg: "bg-slate-500",
        },
        {
          label: "System Memory",
          value: deviceData?.memory,
          icon: Cpu,
          iconBg: "bg-emerald-500",
        },
      ],
    },
    {
      title: "Software & Browser",
      items: [
        {
          label: "Operating System",
          value: deviceData?.os,
          icon: Radical,
          iconBg: "bg-purple-500",
        },
        {
          label: "Browser",
          value: deviceData?.browser,
          icon: Globe,
          iconBg: "bg-sky-500",
        },
      ],
    },
    {
      title: "Display & Region",
      items: [
        {
          label: "Touch Support",
          value: deviceData?.touchSupport,
          icon: Smartphone,
          iconBg: "bg-amber-500",
        },
        {
          label: "Screen Resolution",
          value: deviceData?.screenResolution,
          icon: Maximize,
          iconBg: "bg-rose-500",
        },
        {
          label: "Viewport Size",
          value: deviceData?.viewportSize,
          icon: Maximize,
          iconBg: "bg-pink-500",
        },
        {
          label: "System Language",
          value: deviceData?.language,
          icon: Languages,
          iconBg: "bg-teal-500",
        },
        {
          label: "Time Zone",
          value: deviceData?.timeZone,
          icon: Clock,
          iconBg: "bg-orange-500",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            Device Info
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {infoGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h3 className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.title}
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`
                    flex items-center justify-between p-4
                    ${itemIndex !== group.items.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}
                  `}
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
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.value || "Detecting..."}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* <div className="p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-[32px] border border-blue-500/10 dark:border-blue-500/20 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
            This information is private to your session and is not stored on our
            servers. It is used solely for optimizing your experience on this
            device.
          </p>
        </div> */}
      </div>
    </div>
  );
}

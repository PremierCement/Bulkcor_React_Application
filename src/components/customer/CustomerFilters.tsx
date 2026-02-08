import { useState } from "react";
import { useCustomerFilterStore } from "@/store/useCustomerFilterStore";
import { commonService, type CodeParam } from "@/services/common.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Map, MapPin, Search, RotateCcw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomerFiltersProps {
  states: CodeParam[];
  loadingStates: boolean;
  onReset: () => void;
}

export function CustomerFilters({
  states,
  loadingStates,
  onReset,
}: CustomerFiltersProps) {
  const {
    selectedState,
    selectedZone,
    selectedArea,
    searchTerm,
    zones,
    areas,
    setSelectedState,
    setSelectedZone,
    setSelectedArea,
    setSearchTerm,
    setZones,
    setAreas,
  } = useCustomerFilterStore();

  const [loading, setLoading] = useState({
    zones: false,
    areas: false,
  });

  const handleStateChange = async (value: string) => {
    setSelectedState(value);
    if (value === "_all" || !value) return;

    setLoading((prev) => ({ ...prev, zones: true }));
    try {
      const data = await commonService.getCodeParams("Zone", value);
      setZones(data);
    } catch (error) {
      console.error("Failed to fetch zones", error);
    } finally {
      setLoading((prev) => ({ ...prev, zones: false }));
    }
  };

  const handleZoneChange = async (value: string) => {
    setSelectedZone(value);
    if (value === "_all" || !value) return;

    setLoading((prev) => ({ ...prev, areas: true }));
    try {
      const data = await commonService.getCodeParams("Area", value);
      setAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas", error);
    } finally {
      setLoading((prev) => ({ ...prev, areas: false }));
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* State Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Globe className="h-3 w-3 text-primary" /> State
          </label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl shadow-none focus:ring-primary/10 h-12 transition-all">
              {loadingStates ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-slate-400 text-sm">Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select State" />
              )}
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <SelectItem
                value="_all"
                className="rounded-lg focus:bg-primary focus:text-white"
              >
                All States
              </SelectItem>
              {states.map((s) => (
                <SelectItem
                  key={s.xcode}
                  value={s.xcode}
                  className="rounded-lg focus:bg-primary focus:text-white"
                >
                  {s.xcode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zone Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Map className="h-3 w-3 text-primary" /> Zone
          </label>
          <Select
            value={selectedZone}
            onValueChange={handleZoneChange}
            disabled={!selectedState || loading.zones}
          >
            <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl shadow-none focus:ring-primary/10 h-12 transition-all disabled:opacity-50">
              {loading.zones ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-slate-400 text-sm">Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Not Selected" />
              )}
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <SelectItem
                value="_all"
                className="rounded-lg focus:bg-primary focus:text-white"
              >
                All Zones
              </SelectItem>
              {zones.map((z) => (
                <SelectItem
                  key={z.xcode}
                  value={z.xcode}
                  className="rounded-lg focus:bg-primary focus:text-white"
                >
                  {z.xcode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MapPin className="h-3 w-3 text-primary" /> Area
          </label>
          <Select
            value={selectedArea}
            onValueChange={setSelectedArea}
            disabled={!selectedZone || loading.areas}
          >
            <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl shadow-none focus:ring-primary/10 h-12 transition-all disabled:opacity-50">
              {loading.areas ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-slate-400 text-sm">Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Not Selected" />
              )}
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <SelectItem
                value="_all"
                className="rounded-lg focus:bg-primary focus:text-white"
              >
                All Areas
              </SelectItem>
              {areas.map((a) => (
                <SelectItem
                  key={a.xcode}
                  value={a.xcode}
                  className="rounded-lg focus:bg-primary focus:text-white"
                >
                  {a.xcode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by ID or Name..."
            className="h-10 pl-12 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-primary/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="h-10 w-10 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-primary hover:border-primary/30 transition-all shrink-0"
          title="Reset Filters"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

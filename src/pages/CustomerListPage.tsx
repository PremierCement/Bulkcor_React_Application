import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { commonService } from "@/services/common.service";
import { customerService } from "@/services/customer.service";
import type { CodeParam } from "@/services/common.service";
import type { Customer } from "@/types/customer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Map,
  MapPin,
  UserSearch,
  Loader2,
  Phone,
  Hash,
  Building2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function CustomerListPage() {
  const [states, setStates] = useState<CodeParam[]>([]);
  const [zones, setZones] = useState<CodeParam[]>([]);
  const [areas, setAreas] = useState<CodeParam[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 20;

  const [loading, setLoading] = useState({
    states: false,
    zones: false,
    areas: false,
    customers: false,
  });

  useEffect(() => {
    fetchStates();
    fetchCustomers();
  }, []);

  const fetchStates = async () => {
    setLoading((prev) => ({ ...prev, states: true }));
    try {
      const data = await commonService.getCodeParams("State");
      setStates(data);
    } catch (error) {
      console.error("Failed to fetch states", error);
    } finally {
      setLoading((prev) => ({ ...prev, states: false }));
    }
  };

  const fetchCustomers = async () => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const stateMatch =
        !selectedState ||
        selectedState === "_all" ||
        customer.xstate === selectedState;
      const zoneMatch =
        !selectedZone ||
        selectedZone === "_all" ||
        customer.xzone === selectedZone;
      const areaMatch =
        !selectedArea ||
        selectedArea === "_all" ||
        customer.xarea === selectedArea;

      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        !searchTerm ||
        customer.xcus.toLowerCase().includes(searchLower) ||
        customer.xorg.toLowerCase().includes(searchLower);

      return stateMatch && zoneMatch && areaMatch && searchMatch;
    });
  }, [customers, selectedState, selectedZone, selectedArea, searchTerm]);

  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCount);
  }, [filteredCustomers, visibleCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedState, selectedZone, selectedArea, searchTerm]);

  // Infinite Scroll Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < filteredCustomers.length) {
        setVisibleCount((prev) => prev + PAGE_SIZE);
      }
    },
    [visibleCount, filteredCustomers.length],
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const handleStateChange = async (value: string) => {
    setSelectedState(value);
    setSelectedZone("");
    setSelectedArea("");
    setZones([]);
    setAreas([]);

    if (value === "_all") return;

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
    setSelectedArea("");
    setAreas([]);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Search Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* State Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Globe className="h-3 w-3 text-primary" /> State
            </label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl shadow-none focus:ring-primary/10 h-12 transition-all">
                {loading.states ? (
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
                  <SelectValue placeholder="Select Zone" />
                )}
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
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
                  <SelectValue placeholder="Select Area" />
                )}
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
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
        {/* Text Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by ID or Name..."
            className="h-10 pl-12 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-primary/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading.customers ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-slate-500 font-medium">Fetching customers...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedCustomers.map((customer) => (
              <div
                key={customer.xcus}
                style={
                  {
                    contentVisibility: "auto",
                    containIntrinsicSize: "1px 180px",
                  } as any
                }
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 dark:border-slate-800/60 dark:bg-slate-900 dark:hover:shadow-none active:scale-[0.98]"
              >
                <div className="flex flex-col gap-4">
                  {/* Header: ID and Name */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
                          {customer.xcus}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                        {customer.xorg}
                      </h3>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 transition-colors group-hover:bg-primary/10 dark:bg-slate-800">
                      <Building2 className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Details */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {customer.xphone || "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <Map className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Zone
                        </p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {customer.xzone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* Load More Trigger */}
          {visibleCount < filteredCustomers.length && (
            <div
              ref={observerTarget}
              className="flex justify-center py-8 animate-pulse"
            >
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading more customers...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50/30 dark:bg-slate-900/30">
          <div className="h-20 w-20 rounded-[28px] bg-white dark:bg-slate-900 shadow-xl shadow-primary/10 flex items-center justify-center mb-6 ring-1 ring-slate-100 dark:ring-slate-800">
            <UserSearch className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            No Customers Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-[280px] mt-2 leading-relaxed">
            We couldn't find any customers matching your selected criteria. Try
            adjusting your{" "}
            <span className="text-primary font-semibold">Filters</span>.
          </p>
        </div>
      )}
    </div>
  );
}

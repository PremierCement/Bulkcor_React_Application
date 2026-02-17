import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { commonService } from "@/services/common.service";
import { customerService } from "@/services/customer.service";
import type { CodeParam } from "@/services/common.service";
import type { Customer } from "@/types/customer";
import {
  UserSearch,
  Loader2,
  Phone,
  Building2,
  MapPin,
  Wallet,
} from "lucide-react";
import { useCustomerFilterStore } from "@/store/useCustomerFilterStore";

import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerFilters } from "@/components/customer/CustomerFilters";

export function SalesReturnPlacementPage() {
  const navigate = useNavigate();

  const {
    selectedState,
    selectedZone,
    selectedArea,
    searchTerm,
    resetFilters: clearStoreFilters,
  } = useCustomerFilterStore();

  const [states, setStates] = useState<CodeParam[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 20;

  const [loading, setLoading] = useState({
    states: false,
    customers: false,
  });

  const resetFilters = () => {
    clearStoreFilters();
    setCustomers([]);
  };

  useEffect(() => {
    fetchStates();
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

  const fetchCustomers = useCallback(async () => {
    if (!selectedState || selectedState === "_all") {
      setCustomers([]);
      return;
    }

    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const data = await customerService.getCustomers({
        state: selectedState,
        zone: selectedZone,
        area: selectedArea,
      });
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setCustomers([]);
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  }, [selectedState, selectedZone, selectedArea]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  return (
    <div className="relative">
      <PageHeader title="Sales Return" />
      <div className="p-4 md:p-6 mt-2 md:mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <CustomerFilters
          states={states}
          loadingStates={loading.states}
          onReset={resetFilters}
        />

        {loading.customers ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-slate-500 font-medium">Fetching customers...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCustomers.map((customer) => (
                <div
                  key={customer.xcus}
                  onClick={() => navigate(`/sales-return/${customer.xcus}`)}
                  style={
                    {
                      contentVisibility: "auto",
                      containIntrinsicSize: "1px 120px",
                    } as any
                  }
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 dark:border-slate-800/60 dark:bg-slate-900 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header: ID and Group/Icon */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-primary/20">
                        {customer.xcus}
                      </span>
                      <div className="flex items-center gap-2">
                        {customer.xgcus && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
                            {customer.xgcus}
                          </span>
                        )}
                        <Building2 className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Organization Name */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="flex-1 truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                        {customer.xorg || "Unnamed Customer"}
                      </h3>

                      <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Wallet className="h-3 w-3" />
                        AED{" "}
                        {(customer.xbalance ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-slate-50 dark:bg-slate-800/50" />

                    {/* Contact Information in one row */}
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Phone className="h-3 w-3 shrink-0 text-emerald-500" />
                        <span className="text-[11px] font-medium truncate">
                          {customer.xfphone || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <MapPin className="h-3 w-3 shrink-0 text-blue-500" />
                        <span className="text-[11px] font-medium truncate">
                          {customer.xadd1 || "No address"}
                        </span>
                      </div>
                    </div>
                  </div>
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
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              No Customers Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-[280px] mt-2 leading-relaxed">
              Select at least a{" "}
              <span className="text-primary font-semibold">State</span> to
              explore customers in your regions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

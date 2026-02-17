import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { commonService } from "@/services/common.service";
import { customerService } from "@/services/customer.service";
import { paymentService } from "@/services/payment.service";
import type { CodeParam } from "@/services/common.service";
import type { Customer } from "@/types/customer";
import type { Bank, PendingInvoice, PaymentSubmission } from "@/types/payment";
import {
  UserSearch,
  Loader2,
  Phone,
  Building2,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  Calendar,
  History,
} from "lucide-react";
import { useCustomerFilterStore } from "@/store/useCustomerFilterStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerFilters } from "@/components/customer/CustomerFilters";
import { useToast } from "@/store/useToast";
import { useAuthStore } from "@/store/useAuthStore";

export default function PaymentCollectionsPage() {
  const { xcus } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

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
    balance: false,
    invoices: false,
    banks: false,
    submitting: false,
  });

  const [balance, setBalance] = useState<string>("0");
  const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);

  const [paymentMode, setPaymentMode] = useState<"Cash" | "Bank">("Cash");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = useState<string>("");
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>(
    {},
  );
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (xcus) {
      fetchCustomerData(xcus);
    } else {
      setSelectedCustomer(null);
    }
  }, [xcus]);

  const fetchCustomerData = async (cusId: string) => {
    setLoading((prev) => ({ ...prev, balance: true, invoices: true }));
    try {
      const [customer, balanceData, invoicesData] = await Promise.all([
        customerService.getCustomerById(cusId),
        paymentService.getCustomerBalance(cusId),
        paymentService.getPendingInvoices(cusId),
      ]);
      setSelectedCustomer(customer);
      setBalance(balanceData.xbalance);
      setInvoices(invoicesData);

      setPaymentAmounts({});
      setSelectedInvoices(new Set());
      setPaymentMode("Cash");
      setSelectedBank("");
      setBranchName("");
      setTransactionRef("");
      setNote("");
    } catch (error) {
      console.error("Failed to fetch customer data", error);
      addToast("Failed to fetch customer data", "error");
      navigate("/collections", { replace: true });
    } finally {
      setLoading((prev) => ({ ...prev, balance: false, invoices: false }));
    }
  };

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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedState, selectedZone, selectedArea, searchTerm]);

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

  useEffect(() => {
    if (paymentMode === "Bank" && banks.length === 0) {
      fetchBanks();
    }
  }, [paymentMode]);

  const fetchBanks = async () => {
    setLoading((prev) => ({ ...prev, banks: true }));
    try {
      const data = await paymentService.getBanks();
      setBanks(data);
    } catch (error) {
      console.error("Failed to fetch banks", error);
      addToast("Failed to fetch bank list", "error");
    } finally {
      setLoading((prev) => ({ ...prev, banks: false }));
    }
  };

  const handleInvoiceToggle = (chlnum: string, amount: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(chlnum)) {
      newSelected.delete(chlnum);
      const newAmounts = { ...paymentAmounts };
      delete newAmounts[chlnum];
      setPaymentAmounts(newAmounts);
    } else {
      newSelected.add(chlnum);
      setPaymentAmounts((prev) => ({
        ...prev,
        [chlnum]: parseFloat(amount),
      }));
    }
    setSelectedInvoices(newSelected);
  };

  const handleAmountChange = (chlnum: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPaymentAmounts((prev) => ({
      ...prev,
      [chlnum]: numValue,
    }));
  };

  const totalAmount = useMemo(() => {
    const sum = Array.from(selectedInvoices).reduce((acc, chlnum) => {
      return acc + (paymentAmounts[chlnum] || 0);
    }, 0);
    return Number(sum.toFixed(2));
  }, [selectedInvoices, paymentAmounts]);

  const handleSubmit = async () => {
    if (selectedInvoices.size === 0) {
      addToast("Please select at least one invoice", "error");
      return;
    }

    if (paymentMode === "Bank") {
      if (!selectedBank) {
        addToast("Please select a bank", "error");
        return;
      }
      if (!branchName.trim()) {
        addToast("Please enter the branch name", "error");
        return;
      }
      if (!transactionRef.trim()) {
        addToast("Please enter the reference/cheque number", "error");
        return;
      }
    }

    setLoading((prev) => ({ ...prev, submitting: true }));
    try {
      const submission: PaymentSubmission = {
        xdate: paymentDate,
        xcus: selectedCustomer!.xcus,
        xpaymode: paymentMode,
        xprime: totalAmount.toFixed(2),
        xcreatedby: user?.username || "system",
        xcheque: transactionRef,
        xbank: selectedBank,
        xbankbr: branchName,
        xnote: note,
        payment_details: Array.from(selectedInvoices).map((chlnum) => ({
          xchlnum: chlnum,
          xpayamt: Number((paymentAmounts[chlnum] || 0).toFixed(2)),
          xstatus: "Open",
        })),
      };

      await paymentService.createPaymentEntry(submission);
      addToast("Payment collected successfully", "success");
      navigate("/collections", { replace: true });
    } catch (error) {
      console.error("Failed to submit payment", error);
      addToast("Failed to submit payment", "error");
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (xcus && selectedCustomer) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-32">
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate("/collections", { replace: true })}
              className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {selectedCustomer.xorg}
              </h1>
              <div className="flex flex-col">
                <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  {selectedCustomer.xcus} • {selectedCustomer.xstate}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  Balance: AED{" "}
                  {parseFloat(balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                Invoices
              </p>
              <p className="text-xs font-medium text-slate-900 dark:text-white">
                {invoices.length}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-blue-600/70 dark:border-slate-800/60 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                      Collection Details
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                    <button
                      onClick={() => setPaymentMode("Cash")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium transition-all ${
                        paymentMode === "Cash"
                          ? "bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMode("Bank")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-medium transition-all ${
                        paymentMode === "Bank"
                          ? "bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      Bank
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">
                        Collection Date
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="date"
                          disabled
                          value={paymentDate}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {paymentMode === "Bank" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                            Bank{" "}
                            <span className="text-red-500 ml-1 font-bold">
                              *
                            </span>
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm  focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                            >
                              <option value="">Choose a Bank</option>
                              {banks.map((bank) => (
                                <option key={bank.xcode} value={bank.xcode}>
                                  {bank.xcode}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400 rotate-90" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                              Branch{" "}
                              <span className="text-red-500 ml-1 font-bold">
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              value={branchName}
                              onChange={(e) => setBranchName(e.target.value)}
                              placeholder="Branch"
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                              Ref/CHQ{" "}
                              <span className="text-red-500 ml-1 font-bold">
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              value={transactionRef}
                              onChange={(e) =>
                                setTransactionRef(e.target.value)
                              }
                              placeholder="Reference"
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">
                      Notes
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional remarks..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <History className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest">
                    Pending Invoices
                  </h3>
                </div>
                <button
                  onClick={() => {
                    const allChls = new Set(invoices.map((i) => i.xchlnum));
                    setSelectedInvoices(allChls);
                    const allAmts = invoices.reduce(
                      (acc, i) => ({
                        ...acc,
                        [i.xchlnum]: parseFloat(i.xamtdue),
                      }),
                      {},
                    );
                    setPaymentAmounts(allAmts);
                  }}
                  className="text-[10px] font-medium text-primary uppercase tracking-widest hover:underline"
                >
                  Select All
                </button>
              </div>

              {loading.invoices ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40 mb-3" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Loading Invoices
                  </p>
                </div>
              ) : invoices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.xchlnum}
                      className={`group relative overflow-hidden rounded-[20px] border transition-all duration-300 p-4 ${
                        selectedInvoices.has(invoice.xchlnum)
                          ? "bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/5"
                          : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() =>
                            handleInvoiceToggle(
                              invoice.xchlnum,
                              invoice.xamtdue,
                            )
                          }
                          className={`shrink-0 mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            selectedInvoices.has(invoice.xchlnum)
                              ? "bg-primary border-primary text-white"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-primary/50"
                          }`}
                        >
                          {selectedInvoices.has(invoice.xchlnum) && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight">
                                #{invoice.xchlnum}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] font-semibold text-amber-600 uppercase tracking-tighter">
                                Due
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(invoice.xdate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
                              <p className="text-[8px] uppercase font-semibold text-slate-400 tracking-widest mb-1">
                                Total
                              </p>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {parseFloat(invoice.xtotamt).toLocaleString()}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                              <p className="text-[8px] uppercase font-semibold text-rose-500 dark:text-rose-400 tracking-widest mb-1">
                                Unpaid
                              </p>
                              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                                {parseFloat(invoice.xamtdue).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {selectedInvoices.has(invoice.xchlnum) && (
                            <div className="pt-1 animate-in slide-in-from-top-2 duration-200">
                              <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-primary/40">
                                  AED
                                </span>
                                <input
                                  type="number"
                                  value={paymentAmounts[invoice.xchlnum] || ""}
                                  onChange={(e) =>
                                    handleAmountChange(
                                      invoice.xchlnum,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-primary/20 rounded-xl text-sm font-semibold text-primary focus:border-primary outline-none transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                  <Check className="h-8 w-8 text-emerald-500/20 mb-2" />
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                    No pending invoices
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 md:py-[22px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-1">
                {selectedInvoices.size} Invoices Selected
              </p>
              <p className="text-xl font-semibold text-primary leading-none tracking-tighter">
                AED{" "}
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/collections", { replace: true })}
                className="hidden sm:block px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading.submitting || selectedInvoices.size === 0}
                className="relative px-8 sm:px-12 py-3.5 bg-primary hover:bg-primary/95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-medium text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 group overflow-hidden"
              >
                {loading.submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Confirm Payment</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/30 dark:bg-slate-950">
      <PageHeader title="Payment Collections" />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCustomers.map((customer) => (
                <div
                  key={customer.xcus}
                  onClick={() => navigate(`/collections/${customer.xcus}`)}
                  style={
                    {
                      contentVisibility: "auto",
                      containIntrinsicSize: "1px 120px",
                    } as any
                  }
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 dark:border-slate-800/60 dark:bg-slate-900 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
                        {customer.xcus}
                      </span>
                      <div className="flex items-center gap-2">
                        {customer.xgcus && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
                            {customer.xgcus}
                          </span>
                        )}
                        <Building2 className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                      {customer.xorg || "Unnamed Customer"}
                    </h3>

                    <div className="h-px bg-slate-50 dark:bg-slate-800/50" />

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

            {visibleCount < filteredCustomers.length && (
              <div ref={observerTarget} className="flex justify-center py-8">
                <div className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-slate-400 text-[11px] font-medium uppercase tracking-widest">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Loading more
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
              We couldn't find any customers matching your filters. Try
              adjusting your search or region.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

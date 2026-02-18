import { useNavigate } from "react-router";
import {
  Search,
  FileText,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CalendarDays,
  Printer,
  Banknote,
  CreditCard,
} from "lucide-react";
import {
  salesService,
  type SalesReportEntry,
  type SalesOrderDetailEntry,
} from "@/services/sales.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/store/useToast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Package, Clock, User, Hash, ShoppingBag, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function SalesReportPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<SalesReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<SalesOrderDetailEntry[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchReport = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await salesService.getSalesReport(user.username, date);
      if (response.status) {
        setReportData(response.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Failed to fetch sales report", error);
      addToast("Failed to fetch sales report", "error");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [date, user?.username]);

  const fetchDetails = async (xchlnum: string) => {
    setSelectedInvoice(xchlnum);
    setDetailsLoading(true);
    try {
      const response = await salesService.getOrderDetails(xchlnum);
      if (response.status) {
        setOrderDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      addToast("Failed to fetch order details", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const sortedData = useMemo(() => {
    return [...reportData]
      .filter(
        (item) =>
          item.xcus.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.xorg.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.xchlnum.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => b.xchlnum.localeCompare(a.xchlnum));
  }, [reportData, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const totals = useMemo(() => {
    return sortedData.reduce(
      (acc, item) => {
        const amt = parseFloat(item.xtotamt || "0");
        if (item.xtypeloc === "Cash") {
          acc.cash += amt;
        } else {
          acc.credit += amt;
        }
        return acc;
      },
      { cash: 0, credit: 0 },
    );
  }, [sortedData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 print:bg-white print:pb-0">
      <style>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          body { background: white; }
          .print-hidden { display: none !important; }
          .print-header { display: flex !important; }
        }
      `}</style>

      {/* Header & Filters */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 print:relative print:bg-white print:border-none">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors print:hidden text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs font-bold hidden xs:inline">Back</span>
              </button>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="truncate">Sales Report</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all font-bold text-[10px] sm:text-xs print:hidden"
              >
                <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">PRINT PDF</span>
              </button>
              <div className="bg-primary/10 text-primary px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {sortedData.length}{" "}
                <span className="hidden sm:inline">Records</span>
                <span className="sm:hidden text-[8px]">Rec.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:hidden">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <CalendarDays className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all font-medium text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by Customer or Invoice"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sans">
          <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-3.5 sm:p-4 rounded-[22px] border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/20 dark:shadow-none group transition-all hover:border-emerald-500/50">
            <div className="absolute -right-4 -top-4 bg-emerald-500/5 h-16 w-16 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="relative flex flex-col h-full justify-between gap-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Cash Sales
                </p>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Banknote className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-slate-400">
                  AED
                </span>
                {totals.cash.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-3.5 sm:p-4 rounded-[22px] border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/20 dark:shadow-none group transition-all hover:border-amber-500/50">
            <div className="absolute -right-4 -top-4 bg-amber-500/5 h-16 w-16 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="relative flex flex-col h-full justify-between gap-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Credit Sales
                </p>
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-slate-400">
                  AED
                </span>
                {totals.credit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-slate-50 dark:bg-slate-950 rounded-full" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
              Fetching sales data...
            </p>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 print:hidden">
            <div className="bg-slate-100 dark:bg-slate-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Records Found
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Try adjusting your filters or date selection
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto print:block print:rounded-none print:shadow-none print:border-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 print:bg-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 print:text-slate-900">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 print:text-slate-900">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-center print:text-slate-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right print:text-slate-900">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right print:hidden">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedData.map((item) => (
                    <tr
                      key={item.xchlnum}
                      onClick={() => fetchDetails(item.xchlnum)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer print:break-inside-avoid"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-xs">
                          {item.xchlnum}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {item.xdatecom}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] print:text-xs print:whitespace-normal">
                          {item.xorg}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          ID: {item.xcus} • {item.xwh}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            item.xtypeloc === "Cash"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                          } print:border print:px-1`}
                        >
                          {item.xtypeloc}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-xs">
                          AED {parseFloat(item.xtotamt).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold">
                          Paid: {parseFloat(item.xpayamt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Tabular View (Combined Columns) */}
            <div className="md:hidden bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedData.map((item) => (
                  <div
                    key={item.xchlnum}
                    onClick={() => fetchDetails(item.xchlnum)}
                    className="p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-400">
                          #{item.xchlnum}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.xdatecom}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.xorg}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            item.xtypeloc === "Cash"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {item.xtypeloc}
                        </span>
                        <span>• {item.xwh}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        <span className="text-[9px] font-bold text-slate-400 mr-0.5">
                          AED
                        </span>
                        {parseFloat(item.xtotamt).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-500">
                        Paid: {parseFloat(item.xpayamt).toLocaleString()}
                      </p>
                      <div className="mt-1 flex justify-end">
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Details Overlay */}
      <Sheet
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 bg-slate-50 dark:bg-slate-950 border-l-slate-200 dark:border-l-slate-800"
        >
          <SheetHeader className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                  <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Back
                  </span>
                </button>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Order Details
                </div>
                {orderDetails.length > 0 && (
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                      orderDetails[0].xtype === "Cash"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}
                  >
                    {orderDetails[0].xtype}
                  </span>
                )}
              </div>

              <SheetTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                {selectedInvoice}
              </SheetTitle>

              {orderDetails.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    {orderDetails[0].zorg}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(orderDetails[0].xdate).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </div>
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Loading Items...
                </p>
              </div>
            ) : orderDetails.length === 0 ? (
              <div className="text-center py-20">
                <Info className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">
                  No items found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <ShoppingBag className="h-3 w-3" />
                  Order Items ({orderDetails.length})
                </p>
                {orderDetails.map((item) => (
                  <div
                    key={item.xline}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start gap-3 relative z-10">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                          {item.xdesc}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Item ID: {item.xitem} • {item.xunitsel}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          AED {parseFloat(item.xlineamt).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {parseFloat(item.xqty).toFixed(0)} Units
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!detailsLoading && orderDetails.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Net Amount</span>
                  <span>
                    AED {parseFloat(orderDetails[0].xdtwotax).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Total Tax</span>
                  <span>
                    AED {parseFloat(orderDetails[0].xdttax).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Total Duty</span>
                  <span>
                    AED {parseFloat(orderDetails[0].xchgtot).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-xl font-black text-primary">
                  <span className="text-[10px] mr-1">AED</span>
                  {parseFloat(orderDetails[0].xtotamt).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 },
                  )}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

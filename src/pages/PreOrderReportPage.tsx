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
import { Clock, User, Hash, ShoppingBag, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function PreOrderReportPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [pdate, setPdate] = useState<string>(
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
      const response = await salesService.getPreOrderReport(
        user.username,
        pdate,
      );
      if (response.status) {
        setReportData(response.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Failed to fetch pre-order report", error);
      addToast("Failed to fetch pre-order report", "error");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [pdate, user?.username]);

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

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Company Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("BULKCOR TRADING LLC", pageWidth / 2, 20, { align: "center" });

    // Report Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Pre Order Report of: ${pdate}`, pageWidth / 2, 28, {
      align: "center",
    });

    // Salesman info & Totals
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`SP ID: ${user?.username || "N/A"}`, 15, 45);
    doc.text(`Cash : ${totals.cash.toFixed(4)} Taka`, 15, 52);
    doc.text(`Credit : ${totals.credit.toFixed(4)} Taka`, 15, 59);

    // Table Data
    const tableData = sortedData.map((item) => [
      item.xdatecom,
      `${item.xorg} - ${item.xcus}`,
      item.xchlnum,
      item.xtypeloc,
      parseFloat(item.xtotamt).toFixed(4),
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Date", "Customer Name", "Order No", "Order Type", "Amount"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: { top: 0.5, bottom: 0.5 },
        lineColor: [0, 0, 0],
      },
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      columnStyles: {
        4: { halign: "right" },
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.text(
          `Generated on ${new Date().toLocaleString()}`,
          15,
          doc.internal.pageSize.getHeight() - 10,
        );
      },
    });

    // Trigger auto-print
    doc.autoPrint();

    // Open PDF in new tab with print intent
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
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
          @page { size: auto; margin: 15mm; }
          body { background: white !important; color: black !important; font-family: sans-serif; }
          .print-hidden { display: none !important; }
          .print-header { display: block !important; }
          .print-table { border-collapse: collapse !important; width: 100% !important; border-top: 1px solid black !important; border-bottom: 1px solid black !important; }
          .print-table th { border-bottom: 1px solid black !important; padding: 4px !important; text-align: left !important; font-size: 10px !important; color: black !important; text-transform: none !important; }
          .print-table td { padding: 4px !important; border: none !important; font-size: 10px !important; color: black !important; }
          .print-shadow-none { box-shadow: none !important; }
          .print-border-none { border: none !important; }
          .print-rounded-none { border-radius: 0 !important; }
        }
      `}</style>

      {/* Header & Filters */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 print:relative print:bg-white print:border-none">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          {/* Print Only Header */}
          <div className="hidden print:block text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold text-black uppercase">
              BULKCOR TRADING LLC
            </h1>
            <p className="text-sm font-medium text-black">
              Pre Order Report of: {pdate}
            </p>
            <div className="text-left mt-6 space-y-1">
              <p className="text-sm font-semibold text-black">
                Sales Man Name : {user?.username}
              </p>
              <p className="text-sm font-semibold text-black">
                Cash : {totals.cash.toFixed(4)} Taka
              </p>
              <p className="text-sm font-semibold text-black">
                Credit : {totals.credit.toFixed(4)} Taka
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors print:hidden text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs font-semibold hidden xs:inline">
                  Back
                </span>
              </button>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="truncate">Pre Order Report</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all font-bold text-[10px] sm:text-xs print:hidden shadow-lg shadow-primary/20"
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
                value={pdate}
                onChange={(e) => setPdate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all font-medium text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by Customer or Order No"
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
                  Cash Pre-Orders
                </p>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Banknote className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                <span className="text-[10px] font-semibold text-slate-400">
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
                  Credit Pre-Orders
                </p>
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-baseline gap-1">
                <span className="text-[10px] font-semibold text-slate-400">
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
              Fetching pre-order data...
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
              <table className="w-full text-left border-collapse print:table print-table">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 print:bg-white">
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 print:text-black print:text-[10px]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 print:text-black print:text-[10px]">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 print:text-black print:text-[10px]">
                      Order No
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 print:text-black print:text-[10px]">
                      Order Type
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right print:text-black print:text-[10px]">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right print:hidden">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedData.map((item) => (
                    <tr
                      key={item.xchlnum}
                      onClick={() => fetchDetails(item.xchlnum)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer print:break-inside-avoid print:hover:bg-transparent"
                    >
                      <td className="px-6 py-4 print:py-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white print:text-[10px] print:font-normal">
                          {item.xdatecom}
                        </p>
                      </td>
                      <td className="px-6 py-4 print:py-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] print:whitespace-nowrap print:max-w-none print:text-[10px] print:font-normal">
                          {item.xorg} - {item.xcus}
                        </p>
                      </td>
                      <td className="px-6 py-4 print:py-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white print:text-[10px] print:font-normal">
                          {item.xchlnum}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center print:py-1 print:text-left">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase print:px-0 print:py-0 print:font-normal print:text-[10px] ${
                            item.xtypeloc === "Cash"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 print:bg-transparent print:text-black"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 print:bg-transparent print:text-black"
                          }`}
                        >
                          {item.xtypeloc}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right print:py-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white print:text-[10px] print:font-normal">
                          {parseFloat(item.xtotamt).toFixed(4)}
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

            {/* Mobile Tabular View */}
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
                        <span className="text-[11px] font-semibold text-slate-400">
                          #{item.xchlnum}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.xdatecom}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.xorg}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
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
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        <span className="text-[9px] font-semibold text-slate-400 mr-0.5">
                          AED
                        </span>
                        {parseFloat(item.xtotamt).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-500">
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
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Back
                  </span>
                </button>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Pre-Order Details
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    {orderDetails[0].zorg}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
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
                <p className="text-xs font-semibold text-slate-400">
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
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                          {item.xdesc}
                        </p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          Item ID: {item.xitem} • {item.xunitsel}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
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
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase">
                  <span>Net Amount</span>
                  <span>
                    AED {parseFloat(orderDetails[0].xdtwotax).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase">
                  <span>Total Tax</span>
                  <span>
                    AED {parseFloat(orderDetails[0].xdttax).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase">
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

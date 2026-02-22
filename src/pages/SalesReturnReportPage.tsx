import { useNavigate } from "react-router";
import {
  Search,
  ChevronLeft,
  Loader2,
  CalendarDays,
  Printer,
  RotateCcw,
  Receipt,
} from "lucide-react";
import {
  salesService,
  type SalesReturnReportEntry,
} from "@/services/sales.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/store/useToast";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function SalesReturnReportPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [pdate, setPdate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<SalesReturnReportEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await salesService.getSalesReturnReport(
        user.username,
        pdate,
      );
      if (response.status) {
        setReportData(response.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Failed to fetch sales return report", error);
      addToast("Failed to fetch sales return report", "error");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [pdate, user?.username]);

  const filteredData = useMemo(() => {
    return [...reportData]
      .filter(
        (item) =>
          item.xcus.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.xorg.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.xtrnnum.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => b.xtrnnum.localeCompare(a.xtrnnum));
  }, [reportData, searchTerm]);

  const totalReturnAmt = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => acc + parseFloat(item.xtotamt || "0"),
      0,
    );
  }, [filteredData]);

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
    doc.text(`Sales Return Report of: ${pdate}`, pageWidth / 2, 28, {
      align: "center",
    });

    // Salesman info & Totals
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`SP ID: ${user?.username || "N/A"}`, 15, 45);
    doc.text(`Total Returns : ${totalReturnAmt.toFixed(4)} Taka`, 15, 52);

    // Table Data
    const tableData = filteredData.map((item) => [
      item.xdate,
      `${item.xorg} - ${item.xcus}`,
      item.xtrnnum,
      item.xretvstat,
      parseFloat(item.xtotamt).toFixed(4),
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Date", "Customer Name", "Return No", "Status", "Amount"]],
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
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 print:bg-white print:pb-0">
      <style>{`
        @media print {
          @page { size: auto; margin: 15mm; }
          body { background: white !important; color: black !important; font-family: sans-serif; }
          .print-hidden { display: none !important; }
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
              Sales Return Report of: {pdate}
            </p>
            <div className="text-left mt-6 space-y-1">
              <p className="text-sm font-semibold text-black">
                SP ID: {user?.username}
              </p>
              <p className="text-sm font-semibold text-black">
                Total Returns : {totalReturnAmt.toFixed(4)} Taka
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
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="truncate">Sales Return Report</span>
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
                {filteredData.length}{" "}
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
                placeholder="Search by Customer or Return No"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Card */}
        <div className="grid grid-cols-1 mb-6">
          <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-6 rounded-[22px] border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/20 dark:shadow-none group transition-all hover:border-primary/50">
            <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Returned
                </p>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-400">AED</span>
                {totalReturnAmt.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
              Fetching data...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 print:hidden">
            <div className="bg-slate-100 dark:bg-slate-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Records Found
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto print:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      Return No
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredData.map((item) => (
                    <tr
                      key={item.xtrnnum}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-semibold">
                        {item.xdate}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold truncate max-w-[300px]">
                        {item.xorg} - {item.xcus}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {item.xtrnnum}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                            item.xretvstat === "Confirmed"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.xretvstat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">
                        {parseFloat(item.xtotamt).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3 print:hidden">
              {filteredData.map((item) => (
                <div
                  key={item.xtrnnum}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">
                          #{item.xtrnnum}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.xdate}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {item.xorg}
                      </h4>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase ${
                        item.xretvstat === "Confirmed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.xretvstat}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-base font-black text-primary">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">
                        AED
                      </span>
                      {parseFloat(item.xtotamt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

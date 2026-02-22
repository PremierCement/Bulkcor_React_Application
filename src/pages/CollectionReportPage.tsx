import { useNavigate } from "react-router";
import {
  Search,
  ChevronLeft,
  Loader2,
  CalendarDays,
  Printer,
  Wallet,
  Receipt,
  Building2,
} from "lucide-react";
import {
  salesService,
  type CollectionReportEntry,
} from "@/services/sales.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/store/useToast";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function CollectionReportPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [pdate, setPdate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<CollectionReportEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await salesService.getCollectionReport(
        user.username,
        pdate,
      );
      if (response.status) {
        setReportData(response.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Failed to fetch collection report", error);
      addToast("Failed to fetch collection report", "error");
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
          item.xorg.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.xtrnnum.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.xpaymode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => b.xtrnnum.localeCompare(a.xtrnnum));
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
    doc.text(`Collection Report of: ${pdate}`, pageWidth / 2, 28, {
      align: "center",
    });

    // Salesman info & Totals
    const totalCollected = filteredData.reduce(
      (sum, item) => sum + parseFloat(item.xprime || "0"),
      0,
    );

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`SP ID: ${user?.username || "N/A"}`, 15, 45);
    doc.text(`Total Collected : ${totalCollected.toFixed(4)} Taka`, 15, 52);

    // Table Data
    const tableData = filteredData.map((item) => [
      item.xdate,
      item.xorg,
      item.xtrnnum,
      item.xpaymode,
      parseFloat(item.xprime).toFixed(4),
      item.xstatus,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [
        ["Date", "Customer Name", "Trans No", "Pay Mode", "Amount", "Status"],
      ],
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

    // Trigger auto-print and open in new tab
    doc.autoPrint();
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };

  const totalCollected = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => acc + parseFloat(item.xprime || "0"),
      0,
    );
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header & Filters */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs font-semibold hidden xs:inline">
                  Back
                </span>
              </button>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="truncate">Collection Report</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all font-bold text-[10px] sm:text-xs shadow-lg shadow-primary/20"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                placeholder="Search by Customer, Trans No or Mode"
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
                  Total Collected
                </p>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-400">AED</span>
                {totalCollected.toLocaleString(undefined, {
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
              Fetching collection data...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
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
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      TRN / Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      Customer / Mode
                    </th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-center">
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
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          # {item.xtrnnum}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {item.xdate}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[250px]">
                          {item.xorg}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.xpaymode}
                          </span>
                          {item.xbank && (
                            <span className="text-[9px] text-slate-400">
                              • {item.xbank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                            item.xstatus === "Confirmed"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {item.xstatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          <span className="text-[10px] font-semibold text-slate-400 mr-1">
                            AED
                          </span>
                          {parseFloat(item.xprime).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {filteredData.map((item) => (
                <div
                  key={item.xtrnnum}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400">
                          #{item.xtrnnum}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[11px] font-semibold text-slate-500">
                          {item.xdate}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                        {item.xorg}
                      </h4>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider ${
                        item.xstatus === "Confirmed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {item.xstatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium capitalize">
                        <Building2 className="h-3 w-3" />
                        {item.xpaymode}
                      </div>
                      {item.xbank && (
                        <p className="text-[9px] text-slate-400 pl-4">
                          {item.xbank}
                        </p>
                      )}
                    </div>
                    <p className="text-base font-black text-primary">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">
                        AED
                      </span>
                      {parseFloat(item.xprime).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/pustilogo.png";

// Helper to convert logo to base64
const getBase64Image = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Load failed");
    img.src = url;
  });
};

export async function printPOSInvoice(
  order: any,
  details: any[],
  customer: any,
  currentUser: any,
) {
  // 80mm = 80mm / 0.352777 = 226.77 pt
  // We'll use mm unit for jsPDF
  const width = 80;
  // Calculate height dynamically: Base (150mm for header/footer/totals) + 9mm per item
  const estimatedHeight = 150 + details.length * 9;

  const doc = new jsPDF({
    unit: "mm",
    format: [width, estimatedHeight],
    putOnlyUsedFonts: true,
  });

  let y = 10;

  // 1. Logo
  try {
    const logoBase64 = await getBase64Image(logo);
    // Logo padding and size
    const logoWidth = 30;
    const logoHeight = 15;
    doc.addImage(
      logoBase64,
      "PNG",
      (width - logoWidth) / 2,
      y,
      logoWidth,
      logoHeight,
    );
    y += logoHeight + 6; // Increased gap from 3 to 6
  } catch (e) {
    console.error("Logo load failed", e);
    y += 5;
  }

  // 2. Company Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 50, 20); // Reddish color for company name
  doc.text("BULKCOR TRADING LLC", width / 2, y, { align: "center" });
  y += 5;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Jiddah Street, Al Jure Ind Area 3, Ajman - UAE", width / 2, y, {
    align: "center",
  });
  y += 3.5;
  doc.text("Mob : +971 523608093, Phone : +971 67474033", width / 2, y, {
    align: "center",
  });
  y += 3.5;
  doc.text("TRN : 100555538600003", width / 2, y, { align: "center" });
  y += 7;

  // 3. TAX INVOICE Header
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", width / 2, y, { align: "center" });
  y += 8;

  // 4. Invoice & Customer Details
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Inv.No:${order.xchlnum}`, 5, y);
  doc.text(`Date: ${order.xdate}`, width - 5, y, { align: "right" });
  y += 4;

  doc.text(`Customer : ${customer?.xorg || order.xorg || order.zorg || "N/A"}`, 5, y);
  y += 4;
  doc.text(`Address : ${customer?.xadd1 || ""}`, 5, y);
  y += 4;
  doc.text(`Ph : ${customer?.xfphone || ""}`, 5, y);
  y += 4;
  doc.text(`TRN : ${customer?.xtaxnum || ""}`, 5, y);
  y += 2;

  doc.setLineWidth(0.3);
  doc.line(5, y, width - 5, y);
  y += 1;

  // 5. Table
  const tableBody = details.map((item) => [
    item.xdesc,
    parseFloat(item.xqty || item.xqtychl || "0").toFixed(0),
    parseFloat(item.xrate).toFixed(2),
    parseFloat(item.xdttax || "0").toFixed(2),
    parseFloat(item.xdtwotax || "0").toFixed(2),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["ITEM", "Qty\n(pcs)", "Price\n(pcs)", "Vat @\n5%", "Total\nAmt"]],
    body: tableBody,
    theme: "plain",
    styles: {
      fontSize: 7,
      cellPadding: 0.8,
      valign: "middle",
      font: "helvetica",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fontStyle: "bold",
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 28 }, // Item description column
      1: { halign: "center", cellWidth: 9 },
      2: { halign: "center", cellWidth: 10 },
      3: { halign: "center", cellWidth: 10 },
      4: { halign: "right", cellWidth: 12 },
    },
    margin: { left: 5, right: 5, bottom: 0 },
    pageBreak: "avoid",
    rowPageBreak: "avoid",
  });

  y = (doc as any).lastAutoTable.finalY + 1;

  doc.setLineWidth(0.3);
  doc.line(5, y, width - 5, y);
  y += 4;

  // 6. Summary Section
  const summaryX = width - 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Total AED:`, 5, y);

  const subTotal = details.reduce(
    (acc, item) => acc + parseFloat(item.xdtwotax || "0"),
    0,
  );
  const totalVAT = details.reduce(
    (acc, item) => acc + parseFloat(item.xdttax || "0"),
    0,
  );
  const totalExcise = details.reduce(
    (acc, item) => acc + parseFloat(item.xchgtot || "0"),
    0,
  );
  const printedSubTotal = parseFloat(subTotal.toFixed(2));
  const printedVAT = parseFloat(totalVAT.toFixed(2));
  const printedExcise = parseFloat(totalExcise.toFixed(2));
  const exactGrandTotal = parseFloat(
    (printedSubTotal + printedVAT + printedExcise).toFixed(2),
  );
  const roundedBillAmount = (Math.round(exactGrandTotal * 4) / 4).toFixed(2);

  doc.text(`${subTotal.toFixed(2)}`, summaryX, y, { align: "right" });
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text(`Total VAT :`, summaryX - 25, y, { align: "right" });
  doc.text(`${totalVAT.toFixed(2)}`, summaryX, y, { align: "right" });
  y += 4;
  doc.text(`Total Exc. Duty :`, summaryX - 25, y, { align: "right" });
  doc.text(`${totalExcise.toFixed(2)}`, summaryX, y, { align: "right" });
  y += 4;
  doc.text(`Bill Discount :`, summaryX - 25, y, { align: "right" });
  doc.text(`0.00`, summaryX, y, { align: "right" });
  y += 2;

  doc.setLineWidth(0.3);
  doc.line(5, y, width - 5, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text(`Round Bill Amount:`, summaryX - 20, y, { align: "right" });
  doc.text(`AED ${roundedBillAmount}`, summaryX, y, {
    align: "right",
  });
  y += 6;

  doc.line(5, y, width - 5, y);
  y += 4;

  // 7. Payment Mode & Footer
  doc.setTextColor(0, 0, 0); // Force black color
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Mode : ${order.xtypeloc || "Cash"}`, 5, y);
  y += 5;

  const salesManName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : "Md.Shohel Miah";
  const salesManCode = currentUser ? currentUser.username : "SysAdmin";

  doc.text(`SP Name : ${salesManName} (${salesManCode})`, 5, y);
  y += 4;
  doc.text(`SP Mob : +971521294564`, 5, y);
  y += 4;
  doc.text(`Bank Name: Emirates NBD`, 5, y);
  y += 4;
  doc.text(`Account Name : Bulkcor Trading LLC`, 5, y);
  y += 4;
  doc.text(`Acc No : 1015755784701`, 5, y);
  y += 2;

  // Auto-print settings
  doc.autoPrint();
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}

import jsPDF from "jspdf";
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

export async function printCollectionInvoice(payment: any) {
  // 80mm width for POS printer
  const width = 80;
  // Estimated height for collection invoice
  const height = 140;

  const doc = new jsPDF({
    unit: "mm",
    format: [width, height],
    putOnlyUsedFonts: true,
  });

  let y = 10;

  // 1. Logo
  try {
    const logoBase64 = await getBase64Image(logo);
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
    y += logoHeight + 6;
  } catch (e) {
    console.error("Logo load failed", e);
    y += 5;
  }

  // 2. Company Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 50, 20);
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

  // 3. Collection Receipt Header
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("COLLECTION RECEIPT", width / 2, y, { align: "center" });
  y += 8;

  // 4. Payment Details
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt No: ${payment.xtrnnum}`, 5, y);
  doc.text(`Date: ${payment.xdate}`, width - 5, y, { align: "right" });
  y += 5;

  doc.text(`Customer : ${payment.xorg}`, 5, y);
  y += 4;
  if (payment.xtaxnum) {
    doc.text(`TRN : ${payment.xtaxnum}`, 5, y);
    y += 4;
  }
  y += 2; // Spacer

  // Horizontal line
  doc.setLineWidth(0.1);
  doc.line(5, y, width - 5, y);
  y += 6;

  // Receipt Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const labelX = 5;
  const valueX = 35;

  doc.text("Payment Mode:", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.text(payment.xpaymode, valueX, y);
  y += 5;

  if (payment.xpaymode === "Bank") {
    doc.setFont("helvetica", "normal");
    doc.text("Bank:", labelX, y);
    doc.setFont("helvetica", "bold");
    doc.text(payment.xbank || "N/A", valueX, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.text("Branch:", labelX, y);
    doc.setFont("helvetica", "bold");
    doc.text(payment.xbankbr || "N/A", valueX, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.text("Ref/Cheque:", labelX, y);
    doc.setFont("helvetica", "bold");
    doc.text(payment.xcheque || "N/A", valueX, y);
    y += 5;
  }

  y += 2;
  doc.line(5, y, width - 5, y);
  y += 8;

  // Big Amount Display
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL AMOUNT", 5, y);
  doc.text(`${payment.xprime} AED`, width - 5, y, { align: "right" });
  y += 10;

  // Status
//   doc.setFontSize(8);
//   doc.setFont("helvetica", "normal");
//   doc.text("Status:", 5, y);
//   doc.setFont("helvetica", "bold");
//   doc.text(payment.xstatus, 35, y);
//   y += 6;

  // Footer
  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Collected By: " + (payment.xcreatedby || "System"), 5, y);
  y += 4;
  if (payment.xconfirmt) {
    const [date, time] = payment.xconfirmt?.split("T") || [];
    doc.text(`Confirmed At: ${date} ${time?.slice(0, 5)}`, 5, y);
    y += 4;
  }
  doc.text("Printed On: " + new Date().toLocaleString(), 5, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  //   doc.text("THANK YOU", width / 2, y, { align: "center" });

  const fileName = `Receipt_${payment.xtrnnum}.pdf`;
  doc.save(fileName);
}

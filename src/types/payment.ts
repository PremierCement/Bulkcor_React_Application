export interface Bank {
  zid: number;
  ztime: string;
  zutime: string | null;
  xtype: string;
  xcode: string;
  xdescdet: string;
  xprops: string;
  xcodealt: string;
  zactive: string;
  xrate: number | null;
  xteam: string;
}

export interface CustomerBalance {
  xcus: string;
  xbalance: string;
}

export interface PendingInvoice {
  zid: number;
  xchlnum: string;
  xcus: string;
  xdate: string;
  xtotamt: string;
  xamtdue: string;
}

export interface PaymentDetail {
  xchlnum: string;
  xpayamt: number;
  xstatus: "Open" | "Closed";
}

export interface PaymentSubmission {
  xdate: string;
  xcus: string;
  xpaymode: "Cash" | "Bank";
  xprime: string; // Total amount
  xcreatedby: string;
  xcheque: string;
  xbank: string;
  xbankbr: string;
  xnote: string;
  payment_details: PaymentDetail[];
}

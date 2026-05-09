export interface Customer {
  zid: number;
  xcus: string;
  xorg: string;
  xtitle: string;
  xfphone: string;
  xdiv: string | null;
  xzone: string;
  xarea: string;
  xcountry: string;
  xstate: string;
  xphone: string;
  xmobile: string;
  xemail1: string;
  xagent: string;
  xtaxnum: string;
  xadd1: string;
  xgcus: string;
  xstatuscus: string;
  xzip: string;
  xbalance: number | null;
}

export interface CustomerResponse {
  status: boolean;
  status_code: number;
  data: Customer[];
}

export interface CustomerBalance {
  zid: number;
  xcus: string;
  xorg: string;
  xprime: string;
  xlineamt: string;
  xpayamt: string;
  xbalance: string;
}

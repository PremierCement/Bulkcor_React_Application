export interface Product {
  xitem: string;
  xdesc: string;
  xlong: string;
  xstdprice: string;
  xstdcost: string;
  xunitsel: string;
  xwtunit: string;
  xcfsel: string;
  xdutychg: string;
  xvatchg: string;
  xgitem: string;
  xdiv: string;
  xunitpur: string;
}

export interface Category {
  zid: number;
  xtype: string;
  xcode: string;
  xdescdet: string;
  xprops: string;
  xcodealt: string | null;
  zactive: string;
  xrate: number | null;
}

export interface ProductListResponse {
  status: boolean;
  status_code: number;
  data: Product[];
}

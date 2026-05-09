import type { ApiEnvelope } from "./api";

export interface Product {
  xitem: string;
  xname: string;
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

export type ProductListResponse = ApiEnvelope<Product[]>;

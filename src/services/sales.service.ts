import api from "@/api/axios";

export interface SaleDetail {
  xline: number;
  xqtychl: number;
  xqty: number;
  xrate: number | string;
  xdtwotax: string | number;
  xdttax: string | number;
  xchgtot: string | number;
  xlineamt: string | number;
  xitem: string;
  xunitsel: string;
  xwtunit: string | number;
  xtypeloc: string;
  xqtyfoc: string | number;
  xbonqty: string | number;
  xdutychg: string | number;
  xvatchg: string | number;
}

export interface SaleOrder {
  xpayamt: string | number;
  xcus: string;
  xwh: string;
  xdatecom: string;
  xtypeloc: string;
  xtotamt: string | number;
  xnote: string;
  xsp: string;
  xstatuschl: string;
  xstatustrn: string;
  xdtwotax: string | number;
  xdttax: string | number;
  xchgtot: string | number;
  xchlnum: SaleDetail[];
}

export const salesService = {
  confirmOrder: async (data: SaleOrder) => {
    const response = await api.post("/sales/", data);
    return response.data;
  },
};

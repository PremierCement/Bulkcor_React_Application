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
  xqtycrn: number | string;
}

export interface PreOrderItem {
  xchlnum: string;
  xcus: string;
  xwh: string;
  xorg: string;
  xdate: string;
  xdatecom: string;
  xdaterev: string;
  xtypeloc: string;
  xtotamt: string;
  xpayamt: string;
  xnote: string;
  xbalance: string | null;
}

export interface PreOrderResponse {
  status: boolean;
  status_code: number;
  data: PreOrderItem[];
}

export interface SaleOrder {
  xpayamt: string | number;
  xcus: string;
  xwh: string;
  xdatecom?: string;
  xdaterev?: string;
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

export interface SalesReturnDetail {
  xline: number;
  xqtychl: number;
  xqty: number;
  xrate: number;
  xdtwotax: null | number | string;
  xdttax: null | number | string;
  xchgtot: null | number | string;
  xlineamt: number;
  xitem: string;
  xunitsel: string;
  xwtunit: number;
  xqtycrn: null | number | string;
  xqtyfoc: string;
  xdutychg: string;
  xvatchg: string;
}

export interface SalesReturn {
  xpayamt: number;
  xcus: string;
  xwh: string;
  xdatecom: string;
  xtypeloc: string;
  xtotamt: string;
  xnote: string;
  xsp: string;
  xretvstat: string;
  xdtwotax: null | number | string;
  xdttax: null | number | string;
  xchgtot: null | number | string;
  xtrnnum: SalesReturnDetail[];
}

export interface SaleDetailResponse {
  status: boolean;
  status_code: number;
  data: any[];
}

export interface SalesReportEntry {
  xchlnum: string;
  xcus: string;
  xwh: string;
  xorg: string;
  xdate: string;
  xdatecom: string;
  xdaterev: string | null;
  xtypeloc: string;
  xtotamt: string;
  xpayamt: string;
  xnote: string;
}

export interface SalesReportResponse {
  status: boolean;
  status_code: number;
  data: SalesReportEntry[];
}

export interface SalesOrderDetailEntry {
  ztime: string;
  xchlnum: string;
  xtype: string;
  xline: number;
  xdornum: string;
  xitem: string;
  xdesc: string;
  xlong: string;
  xqtycrn: string;
  xwtunit: string;
  xqty: string;
  xrate: string;
  xlineamt: string;
  xunitsel: string;
  xtypeloc: string;
  xtax: string;
  zorg: string;
  xtotamt: string;
  xpayamt: string;
  xsp: string;
  xqtyfoc: string;
  xbonqty: string;
  xdate: string;
  xdutychg: string;
  xvatchg: string;
  xdtwotax: string;
  xdttax: string;
  xchgtot: string;
}

export interface CollectionReportEntry {
  xtrnnum: string;
  xorg: string;
  xprime: string;
  xstatus: string;
  xdate: string;
  xconfirmt: string;
  xcreatedby: string;
  xpaymode: string;
  xbank: string | null;
  xbankbr: string | null;
  xcheque: string | null;
  current_user: string | null;
  xtaxnum: string | null;
}

export interface CollectionReportResponse {
  status: boolean;
  status_code: number;
  data: CollectionReportEntry[];
}

export interface SalesOrderDetailsResponse {
  status: boolean;
  status_code: number;
  data: SalesOrderDetailEntry[];
}

export interface SalesReturnReportEntry {
  xtrnnum: string;
  xcus: string;
  xwh: string;
  xorg: string;
  xdate: string;
  xretvstat: string;
  xtypeloc: string;
  xtotamt: string;
  xpayamt: string;
  xreason: string | null;
}

export interface SalesReturnReportResponse {
  status: boolean;
  status_code: number;
  data: SalesReturnReportEntry[];
}

export interface PaymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CollectionReportEntry[];
}

export const salesService = {
  confirmOrder: async (data: SaleOrder) => {
    const response = await api.post("/sales/", data);
    return response.data;
  },
  getPreOrders: async (
    cusCode: string,
    date: string,
  ): Promise<PreOrderResponse> => {
    const response = await api.get(
      `/preSales/prechallaninfo?cus_code=${cusCode}&pdate=${date}`,
    );
    return response.data;
  },
  getOrders: async (
    cusCode: string,
    date: string,
  ): Promise<PreOrderResponse> => {
    const response = await api.get(
      `/Sales/challaninfo?cus_code=${cusCode}&pdate=${date}`,
    );
    return response.data;
  },
  getSaleDetails: async (xchlnum: string): Promise<SaleDetailResponse> => {
    const response = await api.get(`/Sales/detail?xchlnum=${xchlnum}`);
    return response.data;
  },
  updateSale: async (xchlnum: string, data: SaleOrder) => {
    const response = await api.put(`/sales/${xchlnum}/`, data);
    return response.data;
  },
  createSalesReturn: async (data: SalesReturn) => {
    const response = await api.post("/salesretv2/", data);
    return response.data;
  },
  getSalesReport: async (
    empCode: string,
    pdate: string,
  ): Promise<SalesReportResponse> => {
    const response = await api.get(
      `/reports/salesreports?emp_code=${empCode}&pdate=${pdate}`,
    );
    return response.data;
  },
  getOrderDetails: async (
    xchlnum: string,
  ): Promise<SalesOrderDetailsResponse> => {
    const response = await api.get(`/Sales/detail?xchlnum=${xchlnum}`);
    return response.data;
  },
  getCollectionReport: async (
    empCode: string,
    pdate: string,
  ): Promise<CollectionReportResponse> => {
    const response = await api.get(
      `/reports/collectionreports?emp_code=${empCode}&pdate=${pdate}`,
    );
    return response.data;
  },
  getPreOrderReport: async (
    empCode: string,
    pdate: string,
  ): Promise<SalesReportResponse> => {
    const response = await api.get(
      `/reports/Presalesreports?emp_code=${empCode}&pdate=${pdate}`,
    );
    return response.data;
  },
  getSalesReturnReport: async (
    empCode: string,
    pdate: string,
  ): Promise<SalesReturnReportResponse> => {
    const response = await api.get(
      `/reports/salesreturnreports?emp_code=${empCode}&pdate=${pdate}`,
    );
    return response.data;
  },
  getPaymentList: async (
    cusCode: string,
    date: string,
  ): Promise<PaymentListResponse> => {
    const response = await api.get(
      `/paymentlist?xcus=${cusCode}&xdate=${date}`,
    );
    return response.data;
  },
};

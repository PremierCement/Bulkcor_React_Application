import api from "@/api/axios";
import type { ApiEnvelope } from "@/types/api";

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
  xstatuschl?: string;
  xstatustrn?: string;
}

export type PreOrderResponse = ApiEnvelope<PreOrderItem[]>;

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

export type SaleDetailResponse = ApiEnvelope<{
  xchlnum: string;
  xcus: string;
  xorg: string;
  xwh: string;
  xdate: string;
  xdatecom: string;
  xdaterev: string;
  xtypeloc: string;
  xtotamt: string;
  xpayamt: string;
  xdtwotax: string;
  xdttax: string;
  xchgtot: string;
  xnote: string;
  xstatuschl: string;
  xstatustrn: string;
  xsp: string;
  xbalance: string;
  lines: any[];
}>;

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
  xstatuschl?: string;
  xstatustrn?: string;
  xbalance?: string;
}

export type SalesReportResponse = ApiEnvelope<SalesReportEntry[]>;

export interface SalesOrderDetailEntry {
  ztime: string;
  xchlnum: string;
  xtype: string;
  xline: number;
  xdornum: string;
  xitem: string;
  xname: string;
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

export type SalesOrderDetailsResponse = ApiEnvelope<{
  lines: any[];
  [key: string]: any;
}>;

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

export type CollectionReportResponse = ApiEnvelope<CollectionReportEntry[]>;

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

export type SalesReturnReportResponse = ApiEnvelope<SalesReturnReportEntry[]>;

export interface PaymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CollectionReportEntry[];
}

export const salesService = {
  confirmOrder: async (data: SaleOrder) => {
    const response = await api.post("/sales/order", data);
    return response.data;
  },
  getPreOrders: async (cusCode: string, date: string): Promise<PreOrderResponse> => {
    const response = await api.get(`/sales/preorder?xcus=${cusCode}&xdate=${date}`);
    return response.data;
  },
  getOrders: async (cusCode: string, date: string): Promise<PreOrderResponse> => {
    const response = await api.get(`/sales?xcus=${cusCode}&xdate=${date}`);
    return response.data;
  },
  getSaleDetails: async (xchlnum: string): Promise<SaleDetailResponse> => {
    const response = await api.get(`/sales/${xchlnum}`);
    return response.data;
  },
  updateSale: async (xchlnum: string, data: SaleOrder) => {
    const response = await api.put(`/sales/preorder/${xchlnum}`, data);
    return response.data;
  },
  createSalesReturn: async (data: SalesReturn) => {
    const response = await api.post("/sales/return", data);
    return response.data;
  },
  getSalesReport: async (cusCode: string, date: string): Promise<SalesReportResponse> => {
    const response = await api.get(`/sales?xcus=${cusCode}&xdate=${date}`);
    return response.data;
  },
  getOrderDetails: async (xchlnum: string): Promise<SaleDetailResponse> => {
    const response = await api.get(`/sales/${xchlnum}`);
    return response.data;
  },
  getCollectionReport: async (cusCode: string, date: string): Promise<CollectionReportResponse> => {
    const response = await api.get(`/payment/report?xdate=${date}`);
    return response.data;
  },
  getPreOrderReport: async (cusCode: string, date: string): Promise<PreOrderResponse> => {
    const response = await api.get(`/sales/preorder?xcus=${cusCode}&xdate=${date}`);
    return response.data;
  },
  getSalesReturnReport: async (empCode: string, pdate: string): Promise<SalesReturnReportResponse> => {
    const response = await api.get(`/reports/salesreturnreports?emp_code=${empCode}&pdate=${pdate}`);
    return response.data;
  },
  getPaymentList: async (cusCode: string, date: string): Promise<PaymentListResponse> => {
    const response = await api.get(`/paymentlist?xcus=${cusCode}&xdate=${date}`);
    return response.data;
  },
  getPreOrderDetails: async (xchlnum: string): Promise<SaleDetailResponse> => {
    const response = await api.get(`/sales/preorder/${xchlnum}`);
    return response.data;
  }
};

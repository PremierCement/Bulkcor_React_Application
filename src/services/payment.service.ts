import api from "@/api/axios";
import type {
  Bank,
  PendingInvoice,
  PaymentSubmission,
} from "@/types/payment";
import type { ApiEnvelope } from "@/types/api";

export const paymentService = {
  getBanks: async (): Promise<Bank[]> => {
    const response = await api.get<ApiEnvelope<Bank[]>>(
      "/helpers/xcodes?zid=100000&xtype=Bank"
    );
    return response.data.data;
  },

  getPendingInvoices: async (xcus: string): Promise<PendingInvoice[]> => {
    const response = await api.get<ApiEnvelope<PendingInvoice[]>>(
      `/payment/pending-invoices/?xcus=${xcus}`
    );
    return response.data.data;
  },

  createPaymentEntry: async (data: PaymentSubmission): Promise<any> => {
    const response = await api.post("/payment/entry", data);
    return response.data;
  },

  getPaymentDetails: async (xtrnnum: string): Promise<any> => {
    const response = await api.get<ApiEnvelope<any[]>>(`/payment/details?xtrnnum=${xtrnnum}`);
    return response.data;
  },
};

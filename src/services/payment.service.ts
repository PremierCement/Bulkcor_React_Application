import api from "@/api/axios";
import type {
  Bank,
  PendingInvoice,
  PaymentSubmission,
} from "@/types/payment";
import type { PaginatedResponse } from "./common.service";

export const paymentService = {
  getBanks: async (): Promise<Bank[]> => {
    const response = await api.get<PaginatedResponse<Bank>>(
      "/code_and_paramnew",
      {
        params: { xtype: "bank" },
      },
    );
    return response.data.results;
  },

  getPendingInvoices: async (xcus: string): Promise<PendingInvoice[]> => {
    const response = await api.get<PaginatedResponse<PendingInvoice>>(
      "/pending-invoice",
      {
        params: { xcus },
      },
    );
    return response.data.results;
  },

  createPaymentEntry: async (data: PaymentSubmission): Promise<any> => {
    const response = await api.post("/payment-entry/", data);
    return response.data;
  },

  getPaymentDetails: async (xtrnnum: string): Promise<any> => {
    const response = await api.get(`/paymentNumber?xtrnnum=${xtrnnum}`);
    return response.data;
  },
};

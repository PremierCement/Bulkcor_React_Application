import api from "@/api/axios";
import type { CustomerResponse, Customer } from "@/types/customer";

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get<CustomerResponse>("/customer/list-new");
    return response.data.data;
  },
};

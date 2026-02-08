import api from "@/api/axios";
import type { Customer } from "@/types/customer";

export const customerService = {
  getCustomers: async (filters: {
    state?: string;
    zone?: string;
    area?: string;
  }): Promise<Customer[]> => {
    const params: any = {};
    if (filters.state && filters.state !== "_all")
      params.xstate = filters.state;
    if (filters.zone && filters.zone !== "_all") params.xzone = filters.zone;
    if (filters.area && filters.area !== "_all") params.xarea = filters.area;

    const response = await api.get<Customer[]>("/customer/list2", { params });
    return response.data;
  },
  getCustomerById: async (xcus: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customer/${xcus}/`);
    return response.data;
  },
  updateCustomer: async (
    xcus: string,
    data: Partial<Customer>,
  ): Promise<Customer> => {
    const response = await api.put<Customer>(`/customer/${xcus}/`, data);
    return response.data;
  },
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post<Customer>("/customer/new", data);
    return response.data;
  },
};

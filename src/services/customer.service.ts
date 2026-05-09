import api from "@/api/axios";
import type { ApiEnvelope } from "@/types/api";
import type { Customer, CustomerBalance } from "@/types/customer";

type ServerCustomer = Omit<Customer, "xbalance"> & {
  xbalance: string | null;
};

const toCustomer = (c: ServerCustomer): Customer => ({
  ...c,
  xbalance: c.xbalance != null ? Number(c.xbalance) : null,
});

// Whitelist matches the backend Update/CreateCustomerDto. Anything else
// (zid, xcus, ztime, etc.) is stripped to avoid forbidNonWhitelisted 400s.
const CUSTOMER_DTO_FIELDS = [
  "xorg",
  "xtitle",
  "xfphone",
  "xzone",
  "xarea",
  "xcountry",
  "xstate",
  "xphone",
  "xmobile",
  "xemail1",
  "xagent",
  "xtaxnum",
  "xadd1",
  "xgcus",
  "xstatuscus",
  "xzip",
  "xbalance",
] as const;

const toCustomerDto = (data: Partial<Customer>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const key of CUSTOMER_DTO_FIELDS) {
    const v = data[key as keyof Customer];
    if (v === null || v === undefined) continue;
    out[key] = String(v);
  }
  return out;
};

export const customerService = {
  getCustomers: async (filters: {
    state?: string;
    zone?: string;
    area?: string;
  }): Promise<Customer[]> => {
    const params: Record<string, string> = {};
    if (filters.state && filters.state !== "_all")
      params.xstate = filters.state;
    if (filters.zone && filters.zone !== "_all") params.xzone = filters.zone;
    if (filters.area && filters.area !== "_all") params.xarea = filters.area;

    const response = await api.get<ApiEnvelope<ServerCustomer[]>>(
      "/customers/",
      { params },
    );
    return response.data.data.map(toCustomer);
  },

  getCustomerById: async (xcus: string): Promise<Customer> => {
    const response = await api.get<ApiEnvelope<ServerCustomer>>(
      `/customers/${xcus}`,
    );
    return toCustomer(response.data.data);
  },

  updateCustomer: async (
    xcus: string,
    data: Partial<Customer>,
  ): Promise<Customer> => {
    const response = await api.put<ApiEnvelope<ServerCustomer>>(
      `/customers/${xcus}`,
      toCustomerDto(data),
    );
    return toCustomer(response.data.data);
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post<ApiEnvelope<ServerCustomer>>(
      "/customers/",
      toCustomerDto(data),
    );
    return toCustomer(response.data.data);
  },

  getCustomerBalance: async (xcus: string): Promise<CustomerBalance> => {
    const response = await api.get<ApiEnvelope<CustomerBalance>>(
      `/customers/balance/${xcus}`,
    );
    return response.data.data;
  },
};

import api from "@/api/axios";
import type { Product, Category } from "@/types/product";
import type { ApiEnvelope } from "@/types/api";

export const productService = {
  getProducts: async (xdiv?: string): Promise<Product[]> => {
    const response = await api.get<ApiEnvelope<Product[]>>("/products/", {
      params: xdiv && xdiv !== "all" ? { xdiv } : {},
    });
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiEnvelope<Category[]>>("/helpers/xcodes", {
      params: {
        zid: 100000,
        xtype: "Item Category",
      },
    });
    return response.data.data;
  },
};

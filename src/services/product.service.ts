import api from "@/api/axios";
import type { Product, Category, ProductListResponse } from "@/types/product";
import type { PaginatedResponse } from "./common.service";

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get<ProductListResponse>("/item/list");
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<PaginatedResponse<Category>>(
      "/dropdown_list1",
      {
        params: {
          xtype: "Item Category",
        },
      },
    );
    return response.data.results;
  },
};

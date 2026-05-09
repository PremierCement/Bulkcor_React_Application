import api from "@/api/axios";
import type { ApiEnvelope } from "@/types/api";

export interface CodeParam {
  zid: number;
  xtype: string;
  xcode: string;
  xcodealt: string;
  ztime?: string;
  zutime?: string | null;
  xdescdet?: string;
  xprops?: string;
  zactive?: string;
  xteam?: string;
  xrate?: number | null;
}

// Kept for legacy services (product, payment) still on the old backend.
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const commonService = {
  getCodeParams: async (
    type: string,
    codeAlt?: string,
  ): Promise<CodeParam[]> => {
    const params: Record<string, string | number> = {
      zid: 100000,
      xtype: type.toLowerCase(),
    };
    if (codeAlt) {
      params.xcodealt = codeAlt;
    }
    const response = await api.get<ApiEnvelope<CodeParam[]>>(
      "/helpers/xcodes",
      { params },
    );
    return response.data.data;
  },
};

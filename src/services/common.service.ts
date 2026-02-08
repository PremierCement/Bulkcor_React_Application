import api from "@/api/axios";

export interface CodeParam {
  zid: number;
  xtype: string;
  xcode: string;
  xcodealt: string;
}

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
    const params: any = {
      zid: 100000,
      xtype: type,
    };
    if (codeAlt) {
      params.xcodealt = codeAlt;
    }
    const response = await api.get<PaginatedResponse<CodeParam>>(
      "/code_and_param",
      { params },
    );
    return response.data.results;
  },
};

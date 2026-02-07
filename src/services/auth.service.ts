import api from "@/api/axios";
import type { LoginResponse } from "@/types/auth";

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/account/login/", {
      username,
      password,
    });
    return response.data;
  },
};

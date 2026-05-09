import api from "@/api/axios";
import type {
  LoginResponse,
  RefreshResponse,
  ServerUser,
  User,
} from "@/types/auth";

const ZID = "100000";
const EMAIL_DOMAIN = "@bulkcortrading.com";

export const buildUser = (serverUser: ServerUser): User => ({
  ...serverUser,
  username: serverUser.zemail.split("@")[0] ?? "",
  first_name: serverUser.xname ?? "",
  user_type: serverUser.xaccess || "User",
});

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      zemail: `${username}${EMAIL_DOMAIN}`,
      zid: ZID,
      xpassword: password,
    });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },
};

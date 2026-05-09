export interface ServerUser {
  zemail: string;
  zid: number;
  xname: string;
  xaccess: string;
  xmodules: string;
  xhome: string | null;
  xphone: string;
  xmobile: string;
  xlanguage: string;
  xdformat: string;
  xdsep: string;
  xtooltips: string;
  xautoshow: string;
  xsingleses: string;
  xwh: string;
  xdiv: string | null;
  xproj: string | null;
  xassetid: string;
  business: { zid: number };
}

// Derived aliases keep older consumers compiling until their endpoints migrate.
export interface User extends ServerUser {
  username: string;
  first_name: string;
  user_type: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  path: string;
  timestamp: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: ServerUser;
}

export interface RefreshData {
  accessToken: string;
  refreshToken: string;
}

export type LoginResponse = ApiEnvelope<LoginData>;
export type RefreshResponse = ApiEnvelope<RefreshData>;

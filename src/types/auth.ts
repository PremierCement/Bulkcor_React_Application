export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
  designation_idCount: number | null;
  designation_id?: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
  access: any;
  zone: any;
  image: string;
  access_control: any;
  user_type: string;
  home_lat: number | null;
  home_long: number | null;
  zi_id: number | null;
  ci_id: number | null;
  xwh: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  data: User;
}

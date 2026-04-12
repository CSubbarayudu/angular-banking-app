export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface AuthSession {
  token: string;
  username: string;
  fullName: string;
}

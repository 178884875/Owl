
export interface LoginInput {
  userName: string;
  password: string;
  code: string;
  codeId: string;
  remember: boolean;
}
export interface RegisterInput {
  userName: string;
  displayName: string;
  passwordHash: string | null;
  email: string | null;
  phone: string | null;
  code: string | null;
  codeId: string | null;
}
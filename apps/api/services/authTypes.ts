export interface AuthUser {
  userId: number;
  role: string | null;
  permissions: string[];
}

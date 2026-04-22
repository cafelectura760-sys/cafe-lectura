export type AppRole = "admin" | "member";

export interface UserProfile {
  id: string;
  full_name: string;
  role: AppRole;
  membership_expires_at: string;
  created_at: string;
}

export interface AuthSessionContext {
  userId: string;
  email: string | null;
  profile: UserProfile | null;
}


export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'client' | 'writer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: any;
  profile: Profile | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

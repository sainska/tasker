
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const AuthService = {
  async signIn(email: string, password: string) {
    try {
      console.log('Attempting signin with:', { email });
      
      // Clean up any existing auth state first
      await this.cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
        return { error };
      }
      
      console.log('Signin successful:', data);
      return { error: null, data };
    } catch (error) {
      console.error('Signin exception:', error);
      return { error };
    }
  },

  async signUp(
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    role: 'client' | 'writer' | 'admin' = 'client'
  ) {
    try {
      console.log('Attempting signup with:', { email, firstName, lastName, role });
      
      // Clean up any existing auth state first
      await this.cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
            role: role
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('Signup successful:', data);
      
      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User needs email confirmation');
        return { error: null, data, needsConfirmation: true };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error };
    }
  },

  async signOut() {
    try {
      console.log('Signing out...');
      await this.cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Signout error:', error);
      } else {
        console.log('Signout successful');
      }
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Signout exception:', error);
      // Still redirect even if signout fails
      window.location.href = '/auth';
    }
  },

  async resetPassword(email: string) {
    try {
      console.log('Resetting password for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`
      });
      
      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }
      
      console.log('Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('Password reset exception:', error);
      return { error };
    }
  },

  async cleanupAuthState() {
    try {
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Remove from sessionStorage if available
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error cleaning auth state:', error);
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile } from '@/types/auth';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type ProfileType = Database['public']['Tables']['profiles']['Row'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<ProfileType | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First, let's check if the user exists in auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user from auth:', userError);
        return null;
      }
      
      if (!userData.user) {
        console.error('No user found in auth');
        return null;
      }
      
      console.log('User authenticated, fetching profile from database...');
      
      // Try to fetch the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, try to create it manually
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Profile not found, attempting to create one...');
          return await createProfileManually(userId);
        }
        
        // If it's a 500 error, there might be an RLS issue
        if (error.code === '500' || error.message?.includes('500')) {
          console.error('500 error - possible RLS issue. User ID:', userId);
          console.error('Full error:', error);
          
          // Try to create profile manually as fallback
          console.log('Attempting to create profile as fallback...');
          return await createProfileManually(userId);
        }
        
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      
      // If there's an exception, try to create profile manually
      try {
        console.log('Exception occurred, attempting to create profile manually...');
        return await createProfileManually(userId);
      } catch (createError) {
        console.error('Failed to create profile manually:', createError);
        return null;
      }
    }
  };

  const createProfileManually = async (userId: string): Promise<ProfileType | null> => {
    try {
      console.log('Creating profile manually for user:', userId);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Error getting user data:', userError);
        return null;
      }

      const user = userData.user;
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'client'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile manually:', error);
        return null;
      }

      console.log('Profile created manually:', data);
      return data;
    } catch (error) {
      console.error('Error in createProfileManually:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string,
    role: 'client' | 'writer' | 'admin' = 'client'
  ) => {
    try {
      console.log('Attempting signup with:', { email, firstName, lastName, role });
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('Signup successful:', data);
      
      // If user is confirmed immediately (no email confirmation required)
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User needs email confirmation');
        return { error: null, data, needsConfirmation: true };
      }
      
      // If user is already confirmed, fetch their profile
      if (data.user && data.user.email_confirmed_at) {
        console.log('User is confirmed, fetching profile...');
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin with:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
        return { error };
      }
      
      console.log('Signin successful:', data);
      
      // Fetch profile after successful signin
      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Signin exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setProfile(null);
      console.log('Signout successful');
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<ProfileType>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      console.log('Updating profile:', updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        const updatedProfile = await fetchProfile(user.id);
        setProfile(updatedProfile);
        console.log('Profile updated successfully');
      } else {
        console.error('Profile update error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Resetting password for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
      } else {
        console.log('Password reset email sent');
      }
      
      return { error };
    } catch (error) {
      console.error('Password reset exception:', error);
      return { error };
    }
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!profile) return '/auth';
    
    switch (profile.role) {
      case 'admin': return '/admin-dashboard';
      case 'writer': return '/writer-dashboard';
      case 'client': return '/client-dashboard';
      default: return '/auth';
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    getDashboardUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

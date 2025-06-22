import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile } from '@/types/auth';
import { User, Session } from '@supabase/supabase-js';

type ProfileType = Profile;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Simple cache to prevent redundant fetches
  const profileCache = new Map<string, { profile: ProfileType; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchProfile = async (userId: string): Promise<ProfileType | null> => {
    try {
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached profile for user:', userId);
        return cached.profile;
      }

      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Only try to create profile if it doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Profile not found, creating one...');
          const newProfile = await createProfileManually(userId);
          if (newProfile) {
            profileCache.set(userId, { profile: newProfile, timestamp: Date.now() });
          }
          return newProfile;
        }
        
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      
      // Cache the result
      profileCache.set(userId, { profile: data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const createProfileManually = async (userId: string): Promise<ProfileType | null> => {
    try {
      console.log('Creating profile for user:', userId);
      
      // Get user data from auth
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
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProfileManually:', error);
      return null;
    }
  };

  const clearProfileCache = (userId?: string) => {
    if (userId) {
      profileCache.delete(userId);
    } else {
      profileCache.clear();
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          if (mounted) {
            setProfile(null);
            clearProfileCache(); // Clear cache on logout
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          if (mounted) {
            setProfile(profileData);
            setLoading(false);
          }
        });
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
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
      
      // If user is confirmed immediately, fetch profile
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User needs email confirmation');
        return { error: null, data, needsConfirmation: true };
      }
      
      // If user is already confirmed, fetch profile
      if (data.user) {
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
      clearProfileCache(); // Clear cache on logout
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
        // Clear cache for this user to ensure fresh data
        clearProfileCache(user.id);
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
  };

  const getDashboardUrl = () => {
    if (!profile) return '/';
    
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'client':
        return '/client';
      case 'writer':
        return '/writer';
      default:
        return '/';
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    getDashboardUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

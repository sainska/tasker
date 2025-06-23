
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile } from '@/types/auth';
import { User, Session } from '@supabase/supabase-js';
import { AuthService } from '@/services/authService';
import { UserService } from '@/services/userService';

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

  const fetchProfile = async (userId: string): Promise<ProfileType | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const profileData = await UserService.getUserById(userId);
      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Try to create profile if it doesn't exist
      try {
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          const newProfile = await createProfileFromUser(session.user);
          return newProfile;
        }
      } catch (createError) {
        console.error('Error creating profile:', createError);
      }
      
      return null;
    }
  };

  const createProfileFromUser = async (user: User): Promise<ProfileType | null> => {
    try {
      console.log('Creating profile for user:', user.id);
      
      const profileData = await UserService.createUser({
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'client'
      });

      console.log('Profile created successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(session.user.id);
              if (mounted) {
                setProfile(profileData);
                setLoading(false);
              }
            }
          }, 0);
        } else {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    AuthService.getCurrentSession().then((session) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.id);
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
    return await AuthService.signUp(email, password, firstName, lastName, role);
  };

  const signIn = async (email: string, password: string) => {
    return await AuthService.signIn(email, password);
  };

  const signOut = async () => {
    await AuthService.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<ProfileType>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      console.log('Updating profile:', updates);
      const updatedProfile = await UserService.updateUser(user.id, updates);
      setProfile(updatedProfile);
      console.log('Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email);
  };

  const getDashboardUrl = () => {
    if (!profile) return '/';
    
    switch (profile.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'client':
        return '/client-dashboard';
      case 'writer':
        return '/writer-dashboard';
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

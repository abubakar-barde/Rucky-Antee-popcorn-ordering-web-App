import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProfilesService } from '../lib/supabaseService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalTab: 'login' | 'signup' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'signup' | 'forgot') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');

  useEffect(() => {
    // Check active Supabase session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await ProfilesService.getProfile(session.user.id);
            if (profile) {
              setUser({
                ...profile,
                email: session.user.email,
              });
            } else {
              // Ensure profile row exists in 'profiles' table
              const newProfile = await ProfilesService.createProfile({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 'Customer',
                phone: session.user.user_metadata?.phone || undefined,
                role: 'customer',
              });
              setUser({
                ...(newProfile || {
                  id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || 'Customer',
                  role: 'customer',
                }),
                email: session.user.email,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Supabase Auth session check:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to real Supabase auth state changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const profile = await ProfilesService.getProfile(session.user.id);
            if (profile) {
              setUser({
                ...profile,
                email: session.user.email,
              });
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || 'Customer',
                role: 'customer',
              });
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          error: 'Supabase backend is not configured yet. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
        };
      }

      if (!password) {
        return {
          success: false,
          error: 'Password is required to sign in to Supabase.',
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await ProfilesService.getProfile(data.user.id);
        const resolvedUser: UserProfile = profile
          ? { ...profile, email: data.user.email }
          : {
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || 'Customer',
              role: 'customer',
            };

        setUser(resolvedUser);
        setShowAuthModal(false);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed. No user returned.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          error: 'Supabase backend is not configured yet. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || '',
            role: 'customer',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Insert profile row into Supabase 'profiles' table
        const profile = await ProfilesService.createProfile({
          id: data.user.id,
          full_name: fullName.trim(),
          phone: phone?.trim() || undefined,
          role: 'customer',
        });

        setUser({
          ...(profile || {
            id: data.user.id,
            full_name: fullName.trim(),
            phone: phone?.trim(),
            role: 'customer',
          }),
          email: data.user.email || email,
        });

        setShowAuthModal(false);
        return { success: true };
      }

      return { success: false, error: 'Registration succeeded, but verification may be required.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out notice:', err);
      }
    }
    setUser(null);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          error: 'Supabase backend is not configured yet. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
        };
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase backend is not configured yet.' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return false;
    const updated = await ProfilesService.updateProfile(user.id, data);
    if (updated) {
      setUser({
        ...updated,
        email: user.email,
      });
      return true;
    }
    return false;
  };

  const switchDemoRole = (_targetRole: UserRole) => {
    // Mock role spoofing is strictly disabled.
    // Roles are now authoritative from the Supabase 'profiles' table.
  };

  const role: UserRole = user?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        updateProfile,
        switchDemoRole,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        setAuthModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

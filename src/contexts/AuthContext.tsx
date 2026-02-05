import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  firm_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'user' | 'preparer' | 'approver_l1' | 'approver_l2';
}

interface Firm {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  website: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  firm: Firm | null;
  roles: UserRole[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, firmName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: 'super_admin' | 'admin' | 'user' | 'preparer' | 'approver_l1' | 'approver_l2') => boolean;
  isAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);

        // Fetch firm
        const { data: firmData } = await supabase
          .from('firms')
          .select('*')
          .eq('id', profileData.firm_id)
          .single();

        if (firmData) {
          setFirm(firmData as Firm);
        }
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (rolesData) {
        setRoles(rolesData as UserRole[]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer data fetching to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setFirm(null);
          setRoles([]);
        }

        if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, firmName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          firm_name: firmName,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setFirm(null);
    setRoles([]);
  };

  const hasRole = (role: 'super_admin' | 'admin' | 'user' | 'preparer' | 'approver_l1' | 'approver_l2') => {
    return roles.some(r => r.role === role);
  };

  const isAdmin = () => {
    return hasRole('super_admin') || hasRole('admin');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    firm,
    roles,
    loading,
    signUp,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

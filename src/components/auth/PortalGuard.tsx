import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type PortalType = 'firm' | 'client' | 'employee';

interface PortalGuardProps {
  children: ReactNode;
  allowedPortal: PortalType;
}

interface UserPortalInfo {
  isFirmUser: boolean;
  isClientUser: boolean;
  isEmployeeUser: boolean;
}

export function PortalGuard({ children, allowedPortal }: PortalGuardProps) {
  const [loading, setLoading] = useState(true);
  const [userPortal, setUserPortal] = useState<UserPortalInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkUserPortal();
  }, []);

  const checkUserPortal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const userId = session.user.id;

      // Check all user types in parallel
      const [profileResult, clientUserResult, employeeUserResult] = await Promise.all([
        supabase.from('profiles').select('id').eq('user_id', userId).maybeSingle(),
        supabase.from('client_users').select('id').eq('user_id', userId).maybeSingle(),
        supabase.from('employee_users').select('id').eq('user_id', userId).maybeSingle(),
      ]);

      setUserPortal({
        isFirmUser: !!profileResult.data,
        isClientUser: !!clientUserResult.data,
        isEmployeeUser: !!employeeUserResult.data,
      });
    } catch (error) {
      console.error('Error checking user portal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    const loginRoutes: Record<PortalType, string> = {
      firm: '/auth',
      client: '/client-portal',
      employee: '/employee-portal',
    };
    return <Navigate to={loginRoutes[allowedPortal]} state={{ from: location }} replace />;
  }

  // Determine correct portal based on user type and redirect if needed
  if (userPortal) {
    const getCorrectPortalRedirect = (): string | null => {
      // Employee users can ONLY access employee portal
      if (userPortal.isEmployeeUser && !userPortal.isFirmUser && !userPortal.isClientUser) {
        if (allowedPortal !== 'employee') {
          return '/employee-portal';
        }
        return null;
      }

      // Client users can ONLY access client portal
      if (userPortal.isClientUser && !userPortal.isFirmUser) {
        if (allowedPortal !== 'client') {
          return '/client-portal';
        }
        return null;
      }

      // Firm users can ONLY access firm portal
      if (userPortal.isFirmUser) {
        if (allowedPortal !== 'firm') {
          return '/dashboard';
        }
        return null;
      }

      // User has no recognized role - redirect to auth
      return '/auth';
    };

    const redirect = getCorrectPortalRedirect();
    if (redirect) {
      return <Navigate to={redirect} replace />;
    }
  }

  return <>{children}</>;
}

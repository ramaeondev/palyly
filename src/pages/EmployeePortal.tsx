import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, ArrowLeft, Pencil, Loader2, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import { PortalSidebar } from '@/components/employee-portal/PortalSidebar';
import { NotificationsDrawer } from '@/components/employee-portal/NotificationsDrawer';
import { HomeTab } from '@/components/employee-portal/HomeTab';
import { SalaryStructureTab } from '@/components/employee-portal/SalaryStructureTab';
import { PayslipsTab } from '@/components/employee-portal/PayslipsTab';
import { AnnualEarningsTab } from '@/components/employee-portal/AnnualEarningsTab';
import type { Tables } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type Payslip = Tables<'payslips'>;
type NavItem = 'home' | 'salary' | 'investments' | 'documents';
type SalaryTab = 'structure' | 'payslips' | 'annual';

export default function EmployeePortal() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  // Navigation
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [salaryTab, setSalaryTab] = useState<SalaryTab>('structure');
  const [showNotifications, setShowNotifications] = useState(false);

  // Auth form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Edit profile
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({ phone: '', avatar_url: '' });

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (employee) {
      setEditFormData({
        phone: employee.phone || '',
        avatar_url: employee.avatar_url || '',
      });
    }
  }, [employee]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userId = session.user.id;
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', userId).maybeSingle();
        if (profile) { navigate('/dashboard'); return; }
        const { data: clientUser } = await supabase.from('client_users').select('id').eq('user_id', userId).maybeSingle();
        if (clientUser) { navigate('/client-portal'); return; }
        const { data: employeeUser } = await supabase.from('employee_users').select('*, employees(*)').eq('user_id', userId).single();
        if (employeeUser) {
          setIsAuthenticated(true);
          setEmployee(employeeUser.employees as Employee);
          await fetchPayslips(employeeUser.employee_id);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayslips = async (employeeId: string) => {
    try {
      const { data } = await supabase.from('payslips').select('*').eq('employee_id', employeeId).order('pay_date', { ascending: false });
      if (data) setPayslips(data);
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Welcome!', description: 'You have been logged in.' });
      await checkAuth();
    } catch (error: unknown) {
      toast({ title: 'Login Failed', description: error instanceof Error ? error.message : 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmployee(null);
    setPayslips([]);
  };

  const handleSaveProfile = async () => {
    if (!employee) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('employees').update({
        phone: editFormData.phone || null,
        avatar_url: editFormData.avatar_url || null,
      }).eq('id', employee.id);
      if (error) throw error;
      setEmployee({ ...employee, phone: editFormData.phone || null, avatar_url: editFormData.avatar_url || null });
      setIsEditDialogOpen(false);
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  // Mock notifications
  const notifications = payslips.slice(0, 5).map((p) => ({
    id: p.id,
    message: `Payslip released for the month of ${p.pay_period}.`,
    timestamp: new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
      new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Employee Portal</CardTitle>
            <CardDescription>Secure access for employees to view payslips</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isAuthLoading}>
                {isAuthLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 p-3 rounded-lg bg-slate-50 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">This portal is for invited employees only.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <div className="flex gap-4 text-sm">
              <Link to="/client-portal" className="text-blue-600 hover:underline">Client Portal →</Link>
              <Link to="/auth" className="text-blue-600 hover:underline">Firm Login →</Link>
            </div>
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="h-4 w-4 inline mr-1" />Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const salaryTabs: { id: SalaryTab; label: string }[] = [
    { id: 'structure', label: 'Salary Structure' },
    { id: 'payslips', label: 'Payslips' },
    { id: 'annual', label: 'Annual Earnings' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <PortalSidebar
        employee={{
          full_name: employee?.full_name || '',
          avatar_url: employee?.avatar_url,
          designation: employee?.designation,
        }}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onViewProfile={() => setIsEditDialogOpen(true)}
      />

      <NotificationsDrawer
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />

      {/* Main content */}
      <main className="ml-[220px] p-6 lg:p-8 max-w-5xl">
        {activeNav === 'home' && (
          <HomeTab
            employeeName={employee?.full_name || ''}
            designation={employee?.designation || null}
            department={employee?.department || null}
            payslips={payslips}
            onViewPayslip={() => { setActiveNav('salary'); setSalaryTab('payslips'); }}
          />
        )}

        {activeNav === 'salary' && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
              {salaryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSalaryTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                    salaryTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {salaryTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {salaryTab === 'structure' && <SalaryStructureTab latestPayslip={payslips[0] || null} />}
            {salaryTab === 'payslips' && <PayslipsTab payslips={payslips} />}
            {salaryTab === 'annual' && <AnnualEarningsTab payslips={payslips} />}
          </div>
        )}

        {activeNav === 'investments' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-slate-400 text-sm">Investments module coming soon.</p>
          </div>
        )}

        {activeNav === 'documents' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-slate-400 text-sm">Documents module coming soon.</p>
          </div>
        )}
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <ImageUpload
              bucket="employee-avatars"
              folder={employee?.id || 'new'}
              currentUrl={editFormData.avatar_url}
              onUpload={(url) => setEditFormData({ ...editFormData, avatar_url: url || '' })}
              label="Profile Picture"
              shape="circle"
            />
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="mr-2 h-4 w-4" />Save Changes</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  FileText, 
  Download,
  LogOut,
  ArrowLeft,
  Eye,
  Calendar,
  DollarSign,
  Pencil,
  Loader2,
  Save,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import type { Tables } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type Payslip = Tables<'payslips'>;

export default function EmployeePortal() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Edit profile dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: '',
    avatar_url: '',
  });

  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
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
        
        // Check if user is a FIRM user - if so, redirect to firm dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (profile) {
          navigate('/dashboard');
          return;
        }

        // Check if user is a CLIENT user - if so, redirect to client portal
        const { data: clientUser } = await supabase
          .from('client_users')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (clientUser) {
          navigate('/client-portal');
          return;
        }

        // Check if user is an employee user
        const { data: employeeUser } = await supabase
          .from('employee_users')
          .select('*, employees(*)')
          .eq('user_id', userId)
          .single();

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
      const { data } = await supabase
        .from('payslips')
        .select('*')
        .eq('employee_id', employeeId)
        .order('pay_date', { ascending: false });

      if (data) {
        setPayslips(data);
      }
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({ title: 'Welcome!', description: 'You have been logged in.' });
      await checkAuth();
    } catch (error: unknown) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
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
      // Employees can only update personal details (phone, avatar)
      const { error } = await supabase
        .from('employees')
        .update({
          phone: editFormData.phone || null,
          avatar_url: editFormData.avatar_url || null,
        })
        .eq('id', employee.id);

      if (error) throw error;

      setEmployee({
        ...employee,
        phone: editFormData.phone || null,
        avatar_url: editFormData.avatar_url || null,
      });
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const latestPayslip = payslips[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Employee Portal</CardTitle>
            <CardDescription>
              Secure access for employees to view payslips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-gradient" disabled={isAuthLoading}>
                {isAuthLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This portal is for invited employees only. You can only access your own payslips and profile.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <div className="flex gap-4 text-sm">
              <Link to="/client-portal" className="text-primary hover:underline">Client Portal →</Link>
              <Link to="/auth" className="text-primary hover:underline">Firm Login →</Link>
            </div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={employee?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {employee?.full_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">{employee?.full_name}</h1>
              <p className="text-xs text-muted-foreground">{employee?.designation} • {employee?.department}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-6">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20 flex-shrink-0">
                <AvatarImage src={employee?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {employee?.full_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-4 flex-1 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{employee?.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee?.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{employee?.designation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Joining</p>
                  <p className="font-medium">
                    {employee?.date_of_joining 
                      ? new Date(employee.date_of_joining).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="self-start"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{payslips.length}</p>
                  <p className="text-sm text-muted-foreground">Total Payslips</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {latestPayslip?.currency || 'INR'} {latestPayslip?.net_pay?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Latest Net Pay</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{latestPayslip?.pay_period || '-'}</p>
                  <p className="text-sm text-muted-foreground">Latest Period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Payslips</CardTitle>
            <CardDescription>View and download your salary statements</CardDescription>
          </CardHeader>
          <CardContent>
            {payslips.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payslips Yet</h3>
                <p className="text-muted-foreground">
                  Your payslips will appear here once they are generated.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payslip #</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross Earnings</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-mono">{payslip.payslip_number}</TableCell>
                      <TableCell>{payslip.pay_period}</TableCell>
                      <TableCell className="text-success">
                        {payslip.currency} {payslip.gross_earnings.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-destructive">
                        {payslip.currency} {payslip.total_deductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {payslip.currency} {payslip.net_pay.toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(payslip.pay_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal details. Note: Only phone and profile picture can be edited.
            </DialogDescription>
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
              <Input
                id="phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

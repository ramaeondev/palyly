import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  FileText, 
  Download,
  LogOut,
  ArrowLeft,
  Eye,
  Search,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type Payslip = Tables<'payslips'>;
type Client = Tables<'clients'>;

export default function ClientPortal() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'set-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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

        // Check if user is an EMPLOYEE user - if so, redirect to employee portal
        const { data: employeeUser } = await supabase
          .from('employee_users')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (employeeUser) {
          navigate('/employee-portal');
          return;
        }

        // Check if user is a client user
        const { data: clientUser } = await supabase
          .from('client_users')
          .select('*, clients(*)')
          .eq('user_id', userId)
          .single();

        if (clientUser) {
          setIsAuthenticated(true);
          setClient(clientUser.clients as Client);
          await fetchData(clientUser.client_id);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async (clientId: string) => {
    try {
      // Fetch employees
      const { data: employeesData } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', clientId)
        .order('full_name');

      if (employeesData) {
        setEmployees(employeesData);
        
        // Fetch payslips for all employees
        const employeeIds = employeesData.map(e => e.id);
        const { data: payslipsData } = await supabase
          .from('payslips')
          .select('*')
          .in('employee_id', employeeIds)
          .order('pay_date', { ascending: false });

        if (payslipsData) {
          setPayslips(payslipsData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

      toast({ title: 'Welcome back!', description: 'You have been logged in.' });
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
    setClient(null);
    setEmployees([]);
    setPayslips([]);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Client Portal</CardTitle>
            <CardDescription>
              Secure access for clients to view employees and payslips
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
                This portal is for invited clients only. If you're an employee, please use the Employee Portal.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center">
            <div className="flex gap-4 text-sm">
              <Link to="/employee-portal" className="text-primary hover:underline">Employee Portal →</Link>
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
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{client?.name}</h1>
              <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{employees.length}</p>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-success" />
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
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{employees.filter(e => e.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees">
          <TabsList>
            <TabsTrigger value="employees">
              <Users className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="payslips">
              <FileText className="h-4 w-4 mr-2" />
              Payslips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Employees</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search employees..." 
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payslips</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => {
                      const employeePayslips = payslips.filter(p => p.employee_id === employee.id);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{employee.full_name}</p>
                              <p className="text-sm text-muted-foreground">{employee.employee_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>{employee.designation || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                              {employee.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{employeePayslips.length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payslips" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Payslips</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payslip #</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.map((payslip) => {
                      const employee = employees.find(e => e.id === payslip.employee_id);
                      return (
                        <TableRow key={payslip.id}>
                          <TableCell className="font-mono">{payslip.payslip_number}</TableCell>
                          <TableCell>{employee?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{payslip.pay_period}</TableCell>
                          <TableCell className="font-medium">
                            {payslip.currency} {payslip.net_pay.toLocaleString()}
                          </TableCell>
                          <TableCell>{new Date(payslip.pay_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

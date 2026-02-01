import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, FileText, TrendingUp } from 'lucide-react';

interface DashboardStats {
  clientsCount: number;
  employeesCount: number;
  payslipsCount: number;
  usersCount: number;
}

export default function Dashboard() {
  const { firm, profile, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    clientsCount: 0,
    employeesCount: 0,
    payslipsCount: 0,
    usersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch clients count
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        // Fetch employees count
        const { count: employeesCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });

        // Fetch payslips count
        const { count: payslipsCount } = await supabase
          .from('payslips')
          .select('*', { count: 'exact', head: true });

        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          clientsCount: clientsCount || 0,
          employeesCount: employeesCount || 0,
          payslipsCount: payslipsCount || 0,
          usersCount: usersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.clientsCount,
      description: 'Active clients in your firm',
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Employees',
      value: stats.employeesCount,
      description: 'Employees across all clients',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Payslips Generated',
      value: stats.payslipsCount,
      description: 'Total payslips created',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Team Members',
      value: stats.usersCount,
      description: 'Users in your firm',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <DashboardLayout title="Dashboard" description="Welcome back to your payslip management portal">
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.full_name}!</CardTitle>
            <CardDescription>
              You are managing payrolls for <strong>{firm?.name}</strong>
              {hasRole('super_admin') && ' as a Super Admin'}
              {!hasRole('super_admin') && hasRole('admin') && ' as an Admin'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/clients"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
              >
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Manage Clients</p>
                  <p className="text-sm text-muted-foreground">Add or edit client details</p>
                </div>
              </a>
              <a
                href="/payslips"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
              >
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Generate Payslip</p>
                  <p className="text-sm text-muted-foreground">Create new employee payslips</p>
                </div>
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Firm Settings</p>
                  <p className="text-sm text-muted-foreground">Update your firm details</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Loader2,
  ArrowLeft,
  FileText,
  Mail,
  Upload,
} from 'lucide-react';
import { InviteDialog } from '@/components/InviteDialog';
import { CustomFieldsEditor, type CustomField } from '@/components/CustomFieldsEditor';
import { ImageUpload } from '@/components/ImageUpload';
import { BulkImport } from '@/components/BulkImport';
import type { Json } from '@/integrations/supabase/types';

interface Client {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  client_id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  department: string | null;
  date_of_joining: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  pan_number: string | null;
  uan_number: string | null;
  avatar_url: string | null;
  custom_fields: Json;
  is_active: boolean;
  created_at: string;
}

interface EmployeeFormData {
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  date_of_joining: string;
  bank_name: string;
  bank_account_number: string;
  pan_number: string;
  uan_number: string;
  avatar_url: string;
  custom_fields: CustomField[];
}

interface FormErrors {
  employee_code?: string;
  full_name?: string;
  email?: string;
}

const initialFormData: EmployeeFormData = {
  employee_code: '',
  full_name: '',
  email: '',
  phone: '',
  designation: '',
  department: '',
  date_of_joining: '',
  bank_name: '',
  bank_account_number: '',
  pan_number: '',
  uan_number: '',
  avatar_url: '',
  custom_fields: [],
};

export default function ClientEmployees() {
  const { clientId } = useParams<{ clientId: string }>();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmployee, setInviteEmployee] = useState<Employee | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientAndEmployees();
    }
  }, [clientId]);

  const fetchClientAndEmployees = async () => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', clientId)
        .order('full_name');

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch data',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseCustomFields = (json: Json): CustomField[] => {
    if (!json || !Array.isArray(json)) return [];
    return json.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      return {
        id: String(obj.id || crypto.randomUUID()),
        name: String(obj.name || ''),
        value: String(obj.value || ''),
      };
    });
  };

  const handleOpenDialog = (employee?: Employee) => {
    setFormErrors({});
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        email: employee.email || '',
        phone: employee.phone || '',
        designation: employee.designation || '',
        department: employee.department || '',
        date_of_joining: employee.date_of_joining || '',
        bank_name: employee.bank_name || '',
        bank_account_number: employee.bank_account_number || '',
        pan_number: employee.pan_number || '',
        uan_number: employee.uan_number || '',
        avatar_url: employee.avatar_url || '',
        custom_fields: parseCustomFields(employee.custom_fields),
      });
    } else {
      setSelectedEmployee(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.employee_code.trim()) {
      errors.employee_code = 'Employee code is required';
    }
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    setIsSaving(true);

    try {
      const employeeData = {
        employee_code: formData.employee_code,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        designation: formData.designation || null,
        department: formData.department || null,
        date_of_joining: formData.date_of_joining || null,
        bank_name: formData.bank_name || null,
        bank_account_number: formData.bank_account_number || null,
        pan_number: formData.pan_number || null,
        uan_number: formData.uan_number || null,
        avatar_url: formData.avatar_url || null,
        custom_fields: formData.custom_fields as unknown as Json,
      };

      if (selectedEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', selectedEmployee.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        const { error } = await supabase.from('employees').insert({
          ...employeeData,
          client_id: clientId,
        });

        if (error) {
          if (error.code === '23505') {
            setFormErrors({ email: 'An employee with this email already exists' });
            throw new Error('An employee with this email already exists');
          }
          throw error;
        }

        toast({
          title: 'Success',
          description: 'Employee added successfully',
        });
      }

      setIsDialogOpen(false);
      fetchClientAndEmployees();
    } catch (error: unknown) {
      console.error('Error saving employee:', error);
      if (error instanceof Error && error.message.includes('email')) {
        // Error already set
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save employee',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      fetchClientAndEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete employee',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkImport = async (data: Record<string, string>[]): Promise<{ success: number; errors: string[] }> => {
    const errors: string[] = [];
    let success = 0;

    for (const row of data) {
      try {
        const { error } = await supabase.from('employees').insert({
          client_id: clientId,
          employee_code: row.employee_code,
          full_name: row.full_name,
          email: row.email || null,
          phone: row.phone || null,
          designation: row.designation || null,
          department: row.department || null,
          date_of_joining: row.date_of_joining || null,
          bank_name: row.bank_name || null,
          bank_account_number: row.bank_account_number || null,
          pan_number: row.pan_number || null,
          uan_number: row.uan_number || null,
        });

        if (error) {
          if (error.code === '23505') {
            errors.push(`${row.full_name}: Duplicate email`);
          } else {
            errors.push(`${row.full_name}: ${error.message}`);
          }
        } else {
          success++;
        }
      } catch (e) {
        errors.push(`${row.full_name}: Unknown error`);
      }
    }

    await fetchClientAndEmployees();
    return { success, errors };
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title={client?.name ? `${client.name} - Employees` : 'Employees'}
      description="Manage employees for this client"
    >
      <div className="space-y-4">
        {/* Back Button & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/clients">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {isAdmin() && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/clients/${clientId}/employees/new`, '_blank', 'width=900,height=800')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add (New Window)
              </Button>
            </div>
          )}
        </div>

        {/* Employees Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'No employees found matching your search'
                        : 'No employees yet'}
                    </p>
                    {isAdmin() && !searchQuery && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => handleOpenDialog()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add your first employee
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {employee.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{employee.employee_code}</TableCell>
                    <TableCell>{employee.designation || '-'}</TableCell>
                    <TableCell>{employee.department || '-'}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/payslips?employeeId=${employee.id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        {isAdmin() && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setInviteEmployee(employee);
                                setIsInviteDialogOpen(true);
                              }}
                              title="Send Portal Invite"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/employees/${employee.id}/edit`, '_blank', 'width=900,height=800')}
                              title="Edit in new window"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee
                ? 'Update the employee information below'
                : 'Enter the details for the new employee'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid gap-6 py-4">
              {/* Profile Picture Upload */}
              <ImageUpload
                bucket="employee-avatars"
                folder={selectedEmployee?.id || 'new'}
                currentUrl={formData.avatar_url}
                onUpload={(url) => setFormData({ ...formData, avatar_url: url || '' })}
                label="Profile Picture"
                shape="circle"
              />

              <Separator />

              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_code">
                      Employee Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="employee_code"
                      value={formData.employee_code}
                      onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                      placeholder="EMP001"
                      className={formErrors.employee_code ? 'border-destructive' : ''}
                    />
                    {formErrors.employee_code && (
                      <p className="text-xs text-destructive">{formErrors.employee_code}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      className={formErrors.full_name ? 'border-destructive' : ''}
                    />
                    {formErrors.full_name && (
                      <p className="text-xs text-destructive">{formErrors.full_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Engineering"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_joining">Date of Joining</Label>
                  <Input
                    id="date_of_joining"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Bank Details */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Bank Details</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name" className="text-muted-foreground text-xs">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number" className="text-muted-foreground text-xs">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      placeholder="****1234"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pan_number" className="text-muted-foreground text-xs">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={formData.pan_number}
                      onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                      placeholder="ABCDE1234F"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uan_number" className="text-muted-foreground text-xs">UAN Number</Label>
                    <Input
                      id="uan_number"
                      value={formData.uan_number}
                      onChange={(e) => setFormData({ ...formData, uan_number: e.target.value })}
                      placeholder="100000000000"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Custom Fields */}
              <CustomFieldsEditor
                fields={formData.custom_fields}
                onChange={(fields) => setFormData({ ...formData, custom_fields: fields })}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : selectedEmployee ? (
                'Update Employee'
              ) : (
                'Add Employee'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEmployee?.full_name}"? This
              action cannot be undone. All associated payslips will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Employee'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog - uses stored email */}
      {inviteEmployee && (
        <InviteDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          inviteType="employee"
          targetId={inviteEmployee.id}
          targetName={inviteEmployee.full_name}
          prefillEmail={inviteEmployee.email || undefined}
          prefillName={inviteEmployee.full_name}
        />
      )}

      {/* Bulk Import Dialog */}
      <BulkImport
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        entityType="employee"
        requiredFields={['employee_code', 'full_name', 'email']}
        optionalFields={['phone', 'designation', 'department', 'date_of_joining', 'bank_name', 'bank_account_number', 'pan_number', 'uan_number']}
        onImport={handleBulkImport}
      />
    </DashboardLayout>
  );
}

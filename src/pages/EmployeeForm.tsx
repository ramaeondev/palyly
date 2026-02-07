import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, User } from 'lucide-react';
import { CustomFieldsEditor, type CustomField } from '@/components/CustomFieldsEditor';
import { ImageUpload } from '@/components/ImageUpload';
import type { Json } from '@/integrations/supabase/types';

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

export default function EmployeeForm() {
  const { clientId, employeeId } = useParams<{ clientId: string; employeeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!employeeId;
  const portalMode = searchParams.get('portal'); // 'client' or 'employee'

  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedClientId, setResolvedClientId] = useState<string | null>(clientId || null);

  useEffect(() => {
    loadData();
  }, [employeeId, clientId]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Resolve client ID for client portal users
      if (portalMode === 'client' && !clientId) {
        const { data: clientUser } = await supabase
          .from('client_users')
          .select('client_id')
          .eq('user_id', session.user.id)
          .single();
        if (clientUser) setResolvedClientId(clientUser.client_id);
      }

      if (employeeId) {
        const { data: employee, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .single();

        if (error) throw error;

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
        setResolvedClientId(employee.client_id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load employee data' });
    } finally {
      setIsLoading(false);
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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.employee_code.trim()) errors.employee_code = 'Employee code is required';
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fix errors' });
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

      if (isEditing) {
        const { error } = await supabase.from('employees').update(employeeData).eq('id', employeeId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Employee updated successfully' });
      } else {
        const { error } = await supabase.from('employees').insert({
          ...employeeData,
          client_id: resolvedClientId,
        });
        if (error) {
          if (error.code === '23505') {
            setFormErrors({ email: 'An employee with this email already exists' });
            throw new Error('Duplicate');
          }
          throw error;
        }
        toast({ title: 'Success', description: 'Employee added successfully' });
      }

      if (window.opener) {
        window.opener.postMessage({ type: 'EMPLOYEE_SAVED' }, '*');
        window.close();
      } else {
        handleBack();
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Duplicate') return;
      console.error('Error saving employee:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save employee' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (window.opener) {
      window.close();
    } else if (portalMode === 'client') {
      navigate('/client-portal');
    } else if (portalMode === 'employee') {
      navigate('/employee-portal');
    } else {
      navigate(clientId ? `/clients/${clientId}/employees` : '/clients');
    }
  };

  // Employee portal users can only edit limited fields
  const isEmployeePortal = portalMode === 'employee';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="btn-gradient">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Update' : 'Create'} Employee
          </Button>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 pb-8">
            {/* Photo & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Employee personal and identification information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload
                  bucket="employee-avatars"
                  folder={employeeId || 'new'}
                  currentUrl={formData.avatar_url}
                  onUpload={(url) => setFormData({ ...formData, avatar_url: url || '' })}
                  label="Profile Photo"
                  shape="circle"
                />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Employee Code <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.employee_code}
                      onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                      placeholder="EMP001"
                      disabled={isEmployeePortal}
                      className={formErrors.employee_code ? 'border-destructive' : ''}
                    />
                    {formErrors.employee_code && <p className="text-xs text-destructive">{formErrors.employee_code}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      disabled={isEmployeePortal}
                      className={formErrors.full_name ? 'border-destructive' : ''}
                    />
                    {formErrors.full_name && <p className="text-xs text-destructive">{formErrors.full_name}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email <span className="text-destructive">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      disabled={isEmployeePortal}
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card>
              <CardHeader>
                <CardTitle>Work Details</CardTitle>
                <CardDescription>Department, designation and joining information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="Software Engineer"
                      disabled={isEmployeePortal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Engineering"
                      disabled={isEmployeePortal}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date of Joining</Label>
                  <Input
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    disabled={isEmployeePortal}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Banking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Banking & Tax Details</CardTitle>
                <CardDescription>Financial information for payroll processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="HDFC Bank"
                      disabled={isEmployeePortal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Account Number</Label>
                    <Input
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      placeholder="1234567890"
                      disabled={isEmployeePortal}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>PAN Number</Label>
                    <Input
                      value={formData.pan_number}
                      onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                      placeholder="ABCDE1234F"
                      disabled={isEmployeePortal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UAN Number</Label>
                    <Input
                      value={formData.uan_number}
                      onChange={(e) => setFormData({ ...formData, uan_number: e.target.value })}
                      placeholder="123456789012"
                      disabled={isEmployeePortal}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            {!isEmployeePortal && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>Add any additional employee-specific fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomFieldsEditor
                    fields={formData.custom_fields}
                    onChange={(fields) => setFormData({ ...formData, custom_fields: fields })}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

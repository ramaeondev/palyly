import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Download, Printer, FileJson } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PayslipPreview } from '@/components/payslip/PayslipPreview';
import { usePdfGenerator } from '@/hooks/use-pdf-generator';
import { 
  formatCurrency, 
  numberToWords,
  createSalaryComponent,
  calculateTotalEarnings,
  calculateTotalDeductions,
  calculateNetPay,
  getPeriodDateRange,
  generatePayslip,
  generatePayslipsFromJson,
  parsePayslipJson,
  SAMPLE_JSON_TEMPLATE,
} from '@/lib/payslip-utils';
import type { 
  SalaryComponent, 
  PayslipTemplate,
  Currency,
  Payslip,
  PayslipFormState,
  Organization,
  Employee as PayslipEmployee,
  PayslipPeriod,
} from '@/types/payslip';
import { SUPPORTED_CURRENCIES } from '@/types/payslip';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  business_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  contact_person: string | null;
}

interface Employee {
  id: string;
  client_id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  designation: string | null;
  department: string | null;
  date_of_joining: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  pan_number: string | null;
  uan_number: string | null;
}

export default function Payslips() {
  const [searchParams] = useSearchParams();
  const preselectedEmployeeId = searchParams.get('employeeId');
  
  const { firm, user } = useAuth();
  const { toast } = useToast();
  const { generatePdf, printPayslip, isGenerating } = usePdfGenerator();

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [payMonth, setPayMonth] = useState<number>(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState<number>(new Date().getFullYear());
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[3]); // INR default
  const [template, setTemplate] = useState<PayslipTemplate>('modern');
  const [earnings, setEarnings] = useState<SalaryComponent[]>([
    createSalaryComponent('Basic Salary', 'earning', 0, false),
    createSalaryComponent('House Rent Allowance', 'earning', 0, false),
    createSalaryComponent('Conveyance Allowance', 'earning', 0, false),
  ]);
  const [deductions, setDeductions] = useState<SalaryComponent[]>([
    createSalaryComponent('Provident Fund', 'deduction', 0, false),
    createSalaryComponent('Professional Tax', 'deduction', 0, false),
    createSalaryComponent('Income Tax', 'deduction', 0, false),
  ]);
  const [remarks, setRemarks] = useState<string>('');
  const [authorizedSignatory, setAuthorizedSignatory] = useState<string>('');

  // JSON upload state
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);
  const [uploadedPayslips, setUploadedPayslips] = useState<Payslip[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchEmployees(selectedClientId);
    } else {
      setEmployees([]);
      setSelectedEmployeeId('');
      setSelectedEmployee(null);
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, employees]);

  useEffect(() => {
    // Handle preselected employee
    if (preselectedEmployeeId && clients.length > 0 && !loading) {
      fetchEmployeeAndSelectClient(preselectedEmployeeId);
    }
  }, [preselectedEmployeeId, clients, loading]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEmployeeAndSelectClient = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedClientId(data.client_id);
        setTimeout(() => {
          setSelectedEmployeeId(data.id);
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  const addComponent = (type: 'earning' | 'deduction') => {
    const newComponent = createSalaryComponent('', type, 0, false);
    if (type === 'earning') {
      setEarnings([...earnings, newComponent]);
    } else {
      setDeductions([...deductions, newComponent]);
    }
  };

  const updateComponent = (
    type: 'earning' | 'deduction',
    id: string,
    field: 'name' | 'amount',
    value: string | number
  ) => {
    const updateFn = (components: SalaryComponent[]) =>
      components.map((c) =>
        c.id === id ? { ...c, [field]: field === 'amount' ? Number(value) : value } : c
      );

    if (type === 'earning') {
      setEarnings(updateFn(earnings));
    } else {
      setDeductions(updateFn(deductions));
    }
  };

  const removeComponent = (type: 'earning' | 'deduction', id: string) => {
    if (type === 'earning') {
      setEarnings(earnings.filter((e) => e.id !== id));
    } else {
      setDeductions(deductions.filter((d) => d.id !== id));
    }
  };

  const getFormState = (): PayslipFormState | null => {
    if (!selectedEmployee || !selectedClientId) return null;

    // Find the selected client for organization details
    const selectedClient = clients.find((c) => c.id === selectedClientId);
    if (!selectedClient) return null;

    const { startDate, endDate } = getPeriodDateRange(payMonth, payYear);

    // Use Client details for the payslip header, not Firm
    const organization: Organization = {
      id: selectedClient.id,
      name: selectedClient.name,
      address: selectedClient.address || '',
      city: selectedClient.city || '',
      state: selectedClient.state || '',
      country: selectedClient.country || '',
      postalCode: selectedClient.postal_code || '',
      phone: selectedClient.phone || '',
      email: selectedClient.email || '',
      logoUrl: selectedClient.logo_url || '',
    };

    const employee: PayslipEmployee = {
      id: selectedEmployee.id,
      employeeId: selectedEmployee.employee_code,
      name: selectedEmployee.full_name,
      email: selectedEmployee.email || '',
      designation: selectedEmployee.designation || '',
      department: selectedEmployee.department || '',
      joiningDate: selectedEmployee.date_of_joining || '',
      bankName: selectedEmployee.bank_name || '',
      bankAccountNumber: selectedEmployee.bank_account_number || '',
      panNumber: selectedEmployee.pan_number || '',
      pfNumber: selectedEmployee.uan_number || '',
    };

    const period: PayslipPeriod = {
      month: payMonth,
      year: payYear,
      startDate,
      endDate,
    };

    return {
      organization,
      employee,
      period,
      earnings,
      deductions,
      currency,
      template,
      authorizedSignatory,
      remarks,
    };
  };

  const getPayslip = (): Payslip | null => {
    const formState = getFormState();
    if (!formState) return null;
    return generatePayslip(formState);
  };

  const handleSavePayslip = async () => {
    const payslip = getPayslip();
    if (!payslip || !selectedEmployee) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setIsSaving(true);

    try {
      const insertData = {
        employee_id: selectedEmployee.id,
        payslip_number: payslip.payslipNumber,
        pay_period: `${payslip.period.year}-${String(payslip.period.month).padStart(2, '0')}`,
        pay_date: new Date().toISOString().split('T')[0],
        basic_salary: earnings.find((e) => e.name === 'Basic Salary')?.amount || 0,
        earnings: JSON.parse(JSON.stringify(earnings)),
        deductions: JSON.parse(JSON.stringify(deductions)),
        gross_earnings: payslip.totalEarnings,
        total_deductions: payslip.totalDeductions,
        net_pay: payslip.netPay,
        currency: currency.code,
        notes: remarks || null,
        generated_by: user?.id,
      };
      
      const { error } = await supabase.from('payslips').insert(insertData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payslip saved successfully',
      });
    } catch (error) {
      console.error('Error saving payslip:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save payslip',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    const payslip = getPayslip();
    if (!payslip) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an employee and fill in the required details',
      });
      return;
    }

    await generatePdf(payslip);
    toast({
      title: 'Success',
      description: 'PDF downloaded successfully',
    });
  };

  const handlePrint = async () => {
    const payslip = getPayslip();
    if (!payslip) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an employee and fill in the required details',
      });
      return;
    }

    await printPayslip(payslip);
  };

  const handleJsonUpload = () => {
    setJsonErrors([]);
    const { data, errors } = parsePayslipJson(jsonInput);
    
    if (errors.length > 0) {
      setJsonErrors(errors);
      return;
    }

    if (data) {
      const payslips = generatePayslipsFromJson(data, template, authorizedSignatory);
      setUploadedPayslips(payslips);
      toast({
        title: 'Success',
        description: `Generated ${payslips.length} payslip(s) from JSON`,
      });
    }
  };

  const handleDownloadBulkPdf = async () => {
    for (const payslip of uploadedPayslips) {
      await generatePdf(payslip);
    }
    toast({
      title: 'Success',
      description: `Downloaded ${uploadedPayslips.length} payslip PDF(s)`,
    });
  };

  const downloadSampleJson = () => {
    const jsonStr = JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-payslip-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const grossEarnings = calculateTotalEarnings(earnings);
  const totalDeductions = calculateTotalDeductions(deductions);
  const netPay = calculateNetPay(grossEarnings, totalDeductions);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <DashboardLayout
      title="Generate Payslip"
      description="Create and download payslips for employees"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="json">JSON Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Employee Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Employee</CardTitle>
                  <CardDescription>
                    Choose the client and employee for this payslip
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Select
                        value={selectedClientId}
                        onValueChange={setSelectedClientId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Employee</Label>
                      <Select
                        value={selectedEmployeeId}
                        onValueChange={setSelectedEmployeeId}
                        disabled={!selectedClientId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.full_name} ({emp.employee_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pay Month</Label>
                      <Select
                        value={String(payMonth)}
                        onValueChange={(v) => setPayMonth(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, idx) => (
                            <SelectItem key={idx} value={String(idx + 1)}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Pay Year</Label>
                      <Input
                        type="number"
                        value={payYear}
                        onChange={(e) => setPayYear(Number(e.target.value))}
                        min={2020}
                        max={2100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={currency.code}
                        onValueChange={(code) => {
                          const selected = SUPPORTED_CURRENCIES.find((c) => c.code === code);
                          if (selected) setCurrency(selected);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.code} - {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={template}
                        onValueChange={(v) => setTemplate(v as PayslipTemplate)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Authorized Signatory</Label>
                    <Input
                      value={authorizedSignatory}
                      onChange={(e) => setAuthorizedSignatory(e.target.value)}
                      placeholder="Enter signatory name"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Earnings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Earnings</CardTitle>
                    <CardDescription>Add salary components</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addComponent('earning')}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex gap-2">
                      <Input
                        placeholder="Component name"
                        value={earning.name}
                        onChange={(e) =>
                          updateComponent('earning', earning.id, 'name', e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={earning.amount || ''}
                        onChange={(e) =>
                          updateComponent('earning', earning.id, 'amount', e.target.value)
                        }
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComponent('earning', earning.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Gross Earnings</span>
                    <span>{formatCurrency(grossEarnings, currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Deductions</CardTitle>
                    <CardDescription>Add deduction components</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addComponent('deduction')}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deductions.map((deduction) => (
                    <div key={deduction.id} className="flex gap-2">
                      <Input
                        placeholder="Component name"
                        value={deduction.name}
                        onChange={(e) =>
                          updateComponent('deduction', deduction.id, 'name', e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={deduction.amount || ''}
                        onChange={(e) =>
                          updateComponent('deduction', deduction.id, 'amount', e.target.value)
                        }
                        className="w-32"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComponent('deduction', deduction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(totalDeductions, currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Net Pay Summary */}
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Net Pay</span>
                    <span className="text-primary">
                      {formatCurrency(netPay, currency)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {numberToWords(netPay, currency)}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleSavePayslip} disabled={isSaving || !selectedEmployee}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Payslip'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  disabled={isGenerating || !selectedEmployee}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={isGenerating || !selectedEmployee}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Live preview of the payslip
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedEmployee && firm ? (
                    <div className="border rounded-lg overflow-hidden scale-[0.65] origin-top-left w-[153%]" id="payslip-preview">
                      <PayslipPreview payslip={getPayslip()!} template={template} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      Select an employee to see the preview
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    Bulk Upload (JSON)
                  </CardTitle>
                  <CardDescription>
                    Upload a JSON file containing employee data to generate multiple payslips at once.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSampleJson}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Sample JSON
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Paste JSON Data</Label>
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="Paste your JSON data here..."
                      className="font-mono text-xs h-64"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={template}
                        onValueChange={(v) => setTemplate(v as PayslipTemplate)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Authorized Signatory</Label>
                      <Input
                        value={authorizedSignatory}
                        onChange={(e) => setAuthorizedSignatory(e.target.value)}
                        placeholder="Enter signatory name"
                      />
                    </div>
                  </div>

                  <Button onClick={handleJsonUpload} disabled={!jsonInput.trim()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Generate Payslips
                  </Button>

                  {jsonErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {jsonErrors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadedPayslips.length > 0 && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-green-800">
                          Successfully generated {uploadedPayslips.length} payslip(s)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleDownloadBulkPdf}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download All PDFs
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedPayslips([])}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {uploadedPayslips.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Payslips Preview</CardTitle>
                    <CardDescription>
                      Showing {uploadedPayslips.length} payslip(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {uploadedPayslips.slice(0, 3).map((payslip, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{payslip.employee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {payslip.employee.employeeId} • {payslip.period.month}/{payslip.period.year}
                              </p>
                            </div>
                            <p className="font-bold text-primary">
                              {formatCurrency(payslip.netPay, payslip.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {uploadedPayslips.length > 3 && (
                        <p className="text-center text-muted-foreground">
                          + {uploadedPayslips.length - 3} more payslips
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
                    Upload JSON data to see generated payslips
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

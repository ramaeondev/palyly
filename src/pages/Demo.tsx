import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye,
  ArrowLeft,
  Building2,
  User,
  DollarSign,
  Settings,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { PayslipPreview } from '@/components/payslip/PayslipPreview';
import { usePdfGenerator } from '@/hooks/use-pdf-generator';
import { SUPPORTED_CURRENCIES, type Payslip, type PayslipTemplate, type Currency, type SalaryComponent } from '@/types/payslip';
import { numberToWords, getMonthName } from '@/lib/payslip-utils';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface DemoFormState {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyCountry: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  bankName: string;
  bankAccount: string;
  panNumber: string;
  month: number;
  year: number;
  currency: Currency;
  template: PayslipTemplate;
  authorizedSignatory: string;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

const initialState: DemoFormState = {
  companyName: 'Acme Corporation',
  companyAddress: '123 Business Street',
  companyCity: 'Mumbai',
  companyState: 'Maharashtra',
  companyCountry: 'India',
  employeeName: 'John Doe',
  employeeId: 'EMP001',
  designation: 'Software Engineer',
  department: 'Engineering',
  joiningDate: '2023-01-15',
  bankName: 'HDFC Bank',
  bankAccount: '****1234',
  panNumber: 'ABCDE1234F',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  currency: SUPPORTED_CURRENCIES.find(c => c.code === 'INR') || SUPPORTED_CURRENCIES[0],
  template: 'modern',
  authorizedSignatory: 'HR Manager',
  earnings: [
    { id: uuidv4(), name: 'Basic Salary', type: 'earning', amount: 50000, isPercentage: false },
    { id: uuidv4(), name: 'House Rent Allowance', type: 'earning', amount: 20000, isPercentage: false },
    { id: uuidv4(), name: 'Conveyance', type: 'earning', amount: 5000, isPercentage: false },
    { id: uuidv4(), name: 'Medical Allowance', type: 'earning', amount: 5000, isPercentage: false },
  ],
  deductions: [
    { id: uuidv4(), name: 'Provident Fund', type: 'deduction', amount: 6000, isPercentage: false },
    { id: uuidv4(), name: 'Professional Tax', type: 'deduction', amount: 200, isPercentage: false },
    { id: uuidv4(), name: 'Income Tax', type: 'deduction', amount: 5000, isPercentage: false },
  ],
};

export default function Demo() {
  const [formState, setFormState] = useState<DemoFormState>(initialState);
  const [generatedPayslip, setGeneratedPayslip] = useState<Payslip | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { generatePdf, printPayslip, isGenerating } = usePdfGenerator();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const updateField = (field: keyof DemoFormState, value: unknown) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const addEarning = () => {
    const newEarning: SalaryComponent = {
      id: uuidv4(),
      name: 'New Allowance',
      type: 'earning',
      amount: 0,
      isPercentage: false
    };
    setFormState(prev => ({ ...prev, earnings: [...prev.earnings, newEarning] }));
  };

  const updateEarning = (id: string, field: keyof SalaryComponent, value: unknown) => {
    setFormState(prev => ({
      ...prev,
      earnings: prev.earnings.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEarning = (id: string) => {
    setFormState(prev => ({
      ...prev,
      earnings: prev.earnings.filter(e => e.id !== id)
    }));
  };

  const addDeduction = () => {
    const newDeduction: SalaryComponent = {
      id: uuidv4(),
      name: 'New Deduction',
      type: 'deduction',
      amount: 0,
      isPercentage: false
    };
    setFormState(prev => ({ ...prev, deductions: [...prev.deductions, newDeduction] }));
  };

  const updateDeduction = (id: string, field: keyof SalaryComponent, value: unknown) => {
    setFormState(prev => ({
      ...prev,
      deductions: prev.deductions.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const removeDeduction = (id: string) => {
    setFormState(prev => ({
      ...prev,
      deductions: prev.deductions.filter(d => d.id !== id)
    }));
  };

  const totalEarnings = formState.earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = formState.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  const handleGeneratePreview = () => {
    const startDate = new Date(formState.year, formState.month - 1, 1);
    const endDate = new Date(formState.year, formState.month, 0);
    const monthStr = formState.month.toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const payslipNumber = `PS-${formState.year}${monthStr}-DEMO-${randomSuffix}`;

    const payslip: Payslip = {
      id: uuidv4(),
      payslipNumber,
      organization: {
        id: uuidv4(),
        name: formState.companyName,
        address: formState.companyAddress,
        city: formState.companyCity,
        state: formState.companyState,
        postalCode: '',
        country: formState.companyCountry,
        phone: '',
        email: '',
      },
      employee: {
        id: uuidv4(),
        employeeId: formState.employeeId,
        name: formState.employeeName,
        designation: formState.designation,
        department: formState.department,
        joiningDate: formState.joiningDate,
        bankAccountNumber: formState.bankAccount,
        bankName: formState.bankName,
        panNumber: formState.panNumber,
      },
      period: {
        month: formState.month,
        year: formState.year,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      earnings: formState.earnings,
      deductions: formState.deductions,
      currency: formState.currency,
      totalEarnings,
      totalDeductions,
      netPay,
      netPayInWords: numberToWords(netPay, formState.currency),
      generatedAt: new Date().toISOString(),
      authorizedSignatory: formState.authorizedSignatory,
    };

    setGeneratedPayslip(payslip);
    setIsPreviewMode(true);
    toast({
      title: 'Payslip Generated',
      description: `Payslip #${payslip.payslipNumber} created successfully.`,
    });
  };

  const handleDownloadPdf = async () => {
    if (generatedPayslip) {
      await generatePdf(generatedPayslip, formState.template);
      toast({
        title: 'PDF Downloaded',
        description: 'Your payslip has been downloaded.',
      });
    }
  };

  const handlePrint = () => {
    if (generatedPayslip) {
      printPayslip(generatedPayslip, formState.template);
    }
  };

  const handleReset = () => {
    setFormState(initialState);
    setGeneratedPayslip(null);
    setIsPreviewMode(false);
    toast({
      title: 'Form Reset',
      description: 'All fields have been reset to defaults.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 no-print">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Payly Demo</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPreviewMode && generatedPayslip && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={isGenerating}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button size="sm" onClick={handleDownloadPdf} disabled={isGenerating} className="btn-gradient">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {isPreviewMode && generatedPayslip ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                ← Back to Form
              </Button>
              <p className="text-sm text-muted-foreground">
                Payslip #{generatedPayslip.payslipNumber}
              </p>
            </div>
            
            <div ref={containerRef} className="print:m-0" id="payslip-preview">
              <PayslipPreview payslip={generatedPayslip} template={formState.template} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Demo Mode:</strong> Edit the fields below to customize your payslip. 
                  No login required! Your data is not saved.
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="company">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Company</span>
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Employee</span>
                </TabsTrigger>
                <TabsTrigger value="salary" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Salary</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Company Name</Label>
                      <Input 
                        value={formState.companyName} 
                        onChange={(e) => updateField('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Address</Label>
                      <Input 
                        value={formState.companyAddress} 
                        onChange={(e) => updateField('companyAddress', e.target.value)}
                        placeholder="Enter address"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input 
                        value={formState.companyCity} 
                        onChange={(e) => updateField('companyCity', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input 
                        value={formState.companyState} 
                        onChange={(e) => updateField('companyState', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Country</Label>
                      <Input 
                        value={formState.companyCountry} 
                        onChange={(e) => updateField('companyCountry', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employee" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Employee Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={formState.employeeName} 
                        onChange={(e) => updateField('employeeName', e.target.value)}
                        placeholder="Enter employee name"
                      />
                    </div>
                    <div>
                      <Label>Employee ID</Label>
                      <Input 
                        value={formState.employeeId} 
                        onChange={(e) => updateField('employeeId', e.target.value)}
                        placeholder="Enter employee ID"
                      />
                    </div>
                    <div>
                      <Label>Designation</Label>
                      <Input 
                        value={formState.designation} 
                        onChange={(e) => updateField('designation', e.target.value)}
                        placeholder="Enter designation"
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input 
                        value={formState.department} 
                        onChange={(e) => updateField('department', e.target.value)}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label>Date of Joining</Label>
                      <Input 
                        type="date"
                        value={formState.joiningDate} 
                        onChange={(e) => updateField('joiningDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Bank Name</Label>
                      <Input 
                        value={formState.bankName} 
                        onChange={(e) => updateField('bankName', e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <Label>Bank Account</Label>
                      <Input 
                        value={formState.bankAccount} 
                        onChange={(e) => updateField('bankAccount', e.target.value)}
                        placeholder="Enter bank account"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>PAN Number</Label>
                      <Input 
                        value={formState.panNumber} 
                        onChange={(e) => updateField('panNumber', e.target.value)}
                        placeholder="Enter PAN number"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="salary" className="space-y-4 mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Earnings */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg text-success">Earnings</CardTitle>
                      <Button variant="outline" size="sm" onClick={addEarning}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {formState.earnings.map((earning) => (
                        <div key={earning.id} className="flex items-center gap-2">
                          <Input 
                            value={earning.name}
                            onChange={(e) => updateEarning(earning.id, 'name', e.target.value)}
                            placeholder="Name"
                            className="flex-1"
                          />
                          <Input 
                            type="number"
                            value={earning.amount}
                            onChange={(e) => updateEarning(earning.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-28"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeEarning(earning.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total Earnings</span>
                        <span className="text-success">
                          {formState.currency.symbol}{totalEarnings.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deductions */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg text-destructive">Deductions</CardTitle>
                      <Button variant="outline" size="sm" onClick={addDeduction}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {formState.deductions.map((deduction) => (
                        <div key={deduction.id} className="flex items-center gap-2">
                          <Input 
                            value={deduction.name}
                            onChange={(e) => updateDeduction(deduction.id, 'name', e.target.value)}
                            placeholder="Name"
                            className="flex-1"
                          />
                          <Input 
                            type="number"
                            value={deduction.amount}
                            onChange={(e) => updateDeduction(deduction.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-28"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeDeduction(deduction.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total Deductions</span>
                        <span className="text-destructive">
                          {formState.currency.symbol}{totalDeductions.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Net Pay</span>
                      <span className="text-2xl font-bold text-primary">
                        {formState.currency.symbol}{netPay.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Payslip Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Month</Label>
                      <Select 
                        value={formState.month.toString()} 
                        onValueChange={(v) => updateField('month', parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, index) => (
                            <SelectItem key={month} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Select 
                        value={formState.year.toString()} 
                        onValueChange={(v) => updateField('year', parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select 
                        value={formState.currency.code} 
                        onValueChange={(v) => updateField('currency', SUPPORTED_CURRENCIES.find(c => c.code === v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Template</Label>
                      <Select 
                        value={formState.template} 
                        onValueChange={(v) => updateField('template', v as PayslipTemplate)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Authorized Signatory</Label>
                      <Input 
                        value={formState.authorizedSignatory} 
                        onChange={(e) => updateField('authorizedSignatory', e.target.value)}
                        placeholder="Enter signatory name"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleGeneratePreview}
                className="btn-gradient px-8"
              >
                <Eye className="h-5 w-5 mr-2" />
                Generate & Preview Payslip
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

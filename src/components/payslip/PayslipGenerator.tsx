import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Printer, Eye, FileText, RefreshCw } from 'lucide-react';
import { usePayslipForm } from '@/hooks/use-payslip-form';
import { usePdfGenerator } from '@/hooks/use-pdf-generator';
import { OrganizationForm } from './OrganizationForm';
import { EmployeeForm } from './EmployeeForm';
import { SalaryComponentsForm } from './SalaryComponentsForm';
import { PayslipSettings } from './PayslipSettings';
import { PayslipPreview } from './PayslipPreview';
import type { Payslip } from '@/types/payslip';
import { toast } from '@/hooks/use-toast';

export function PayslipGenerator() {
  const [activeTab, setActiveTab] = useState('organization');
  const [generatedPayslip, setGeneratedPayslip] = useState<Payslip | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const {
    formState,
    errors,
    updateOrganizationField,
    updateEmployeeField,
    updatePeriodField,
    addEarning,
    updateEarning,
    removeEarning,
    addDeduction,
    updateDeduction,
    removeDeduction,
    setCurrency,
    setTemplate,
    setAuthorizedSignatory,
    generatePayslipFromForm,
    resetForm,
    totalEarnings,
    totalDeductions,
    netPay,
  } = usePayslipForm();

  const { generatePdf, printPayslip, containerRef } = usePdfGenerator();

  const handleGeneratePreview = () => {
    const payslip = generatePayslipFromForm();
    if (payslip) {
      setGeneratedPayslip(payslip);
      setIsPreviewMode(true);
      toast({
        title: 'Payslip Generated',
        description: `Payslip #${payslip.payslipNumber} created successfully.`,
      });
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (generatedPayslip) {
      await generatePdf([generatedPayslip]);
      toast({
        title: 'PDF Downloaded',
        description: 'Your payslip has been downloaded as a PDF.',
      });
    }
  };

  const handlePrint = () => {
    printPayslip();
  };

  const handleReset = () => {
    resetForm();
    setGeneratedPayslip(null);
    setIsPreviewMode(false);
    setActiveTab('organization');
    toast({
      title: 'Form Reset',
      description: 'All fields have been cleared.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 no-print">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold font-display">Payslip Generator</h1>
              <p className="text-xs text-muted-foreground">Create professional payslips</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPreviewMode && generatedPayslip && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button size="sm" onClick={handleDownloadPdf} className="btn-gradient">
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
            
            <div ref={containerRef} className="print:m-0">
              <PayslipPreview payslip={generatedPayslip} template={formState.template} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="employee">Employee</TabsTrigger>
                <TabsTrigger value="salary">Salary</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="organization" className="animate-fade-in">
                <OrganizationForm
                  organization={formState.organization}
                  errors={errors}
                  onUpdate={updateOrganizationField}
                />
              </TabsContent>

              <TabsContent value="employee" className="animate-fade-in">
                <EmployeeForm
                  employee={formState.employee}
                  errors={errors}
                  onUpdate={updateEmployeeField}
                />
              </TabsContent>

              <TabsContent value="salary" className="animate-fade-in">
                <SalaryComponentsForm
                  earnings={formState.earnings}
                  deductions={formState.deductions}
                  currency={formState.currency}
                  errors={errors}
                  onAddEarning={addEarning}
                  onUpdateEarning={updateEarning}
                  onRemoveEarning={removeEarning}
                  onAddDeduction={addDeduction}
                  onUpdateDeduction={updateDeduction}
                  onRemoveDeduction={removeDeduction}
                  totalEarnings={totalEarnings}
                  totalDeductions={totalDeductions}
                  netPay={netPay}
                />
              </TabsContent>

              <TabsContent value="settings" className="animate-fade-in">
                <PayslipSettings
                  period={formState.period}
                  currency={formState.currency}
                  template={formState.template}
                  authorizedSignatory={formState.authorizedSignatory}
                  onUpdatePeriod={updatePeriodField}
                  onSetCurrency={setCurrency}
                  onSetTemplate={setTemplate}
                  onSetAuthorizedSignatory={setAuthorizedSignatory}
                />
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

import { Payslip } from '@/types/payslip';
import { formatCurrency, formatPeriod } from '@/lib/payslip-utils';

interface PayslipDetailedTemplateProps {
  payslip: Payslip;
}

export function PayslipDetailedTemplate({ payslip }: PayslipDetailedTemplateProps) {
  const { organization, employee, period, earnings, deductions, currency } = payslip;

  return (
    <div
      data-payslip
      className="payslip-container bg-white w-full max-w-[800px] mx-auto payslip-shadow rounded-lg overflow-hidden"
      style={{ minHeight: '1000px' }}
    >
      {/* Header with gradient accent */}
      <div className="h-2 bg-gradient-to-r from-primary via-info to-success"></div>
      
      <header className="p-6 border-b border-payslip">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
              <p>{organization.address}</p>
              <p>{organization.city}, {organization.state} {organization.postalCode}</p>
              <p>{organization.country}</p>
              <div className="flex gap-4 mt-2">
                <span>📞 {organization.phone}</span>
                <span>✉️ {organization.email}</span>
              </div>
              {organization.registrationNumber && (
                <p className="text-xs">Reg: {organization.registrationNumber}</p>
              )}
              {organization.taxId && (
                <p className="text-xs">Tax ID: {organization.taxId}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              <p className="text-lg font-bold">PAYSLIP</p>
            </div>
            <p className="text-lg font-semibold mt-2">{formatPeriod(period)}</p>
            <p className="text-xs text-muted-foreground">
              Period: {period.startDate} to {period.endDate}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Payslip #: {payslip.payslipNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              Generated: {new Date(payslip.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </header>

      {/* Employee Information */}
      <section className="p-6 bg-muted/30 border-b border-payslip">
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary mb-4">
          Employee Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Full Name</p>
              <p className="font-semibold">{employee.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Employee ID</p>
              <p className="font-semibold">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Email</p>
              <p className="font-medium">{employee.email || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Designation</p>
              <p className="font-semibold">{employee.designation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Department</p>
              <p className="font-medium">{employee.department}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Date of Joining</p>
              <p className="font-medium">{employee.joiningDate || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Bank Name</p>
              <p className="font-medium">{employee.bankName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Bank Account</p>
              <p className="font-medium">{employee.bankAccountNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">PAN / PF Number</p>
              <p className="font-medium">
                {employee.panNumber || 'N/A'} / {employee.pfNumber || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Salary Breakdown */}
      <section className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-success mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success"></span>
              Earnings
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-success/30">
                  <th className="text-left py-2 font-semibold">Component</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-success-light/20' : ''}>
                    <td className="py-2 px-2">{item.name}</td>
                    <td className="py-2 px-2 text-right currency-value font-medium">
                      {formatCurrency(item.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-success bg-success-light">
                  <td className="py-3 px-2 font-bold">Total Earnings</td>
                  <td className="py-3 px-2 text-right font-bold text-success currency-value">
                    {formatCurrency(payslip.totalEarnings, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-destructive mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive"></span>
              Deductions
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-destructive/30">
                  <th className="text-left py-2 font-semibold">Component</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {deductions.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-muted-foreground italic">
                      No deductions
                    </td>
                  </tr>
                ) : (
                  deductions.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-destructive/5' : ''}>
                      <td className="py-2 px-2">{item.name}</td>
                      <td className="py-2 px-2 text-right currency-value font-medium">
                        {formatCurrency(item.amount, currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-destructive bg-destructive/10">
                  <td className="py-3 px-2 font-bold">Total Deductions</td>
                  <td className="py-3 px-2 text-right font-bold text-destructive currency-value">
                    {formatCurrency(payslip.totalDeductions, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Summary & Net Pay */}
      <section className="mx-6 mb-6 rounded-lg overflow-hidden border-2 border-primary">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm opacity-80">Net Payable Amount</p>
              <p className="text-4xl font-bold currency-value">{formatCurrency(payslip.netPay, currency)}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-xs opacity-70">Gross Earnings</p>
                <p className="text-lg font-semibold currency-value">{formatCurrency(payslip.totalEarnings, currency)}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Total Deductions</p>
                <p className="text-lg font-semibold currency-value">{formatCurrency(payslip.totalDeductions, currency)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted p-4">
          <p className="text-sm">
            <span className="font-semibold">Amount in Words: </span>
            <span className="italic">{payslip.netPayInWords}</span>
          </p>
        </div>
      </section>

      {/* Signature Section */}
      <footer className="px-6 pb-6 mt-auto">
        <div className="flex justify-between items-end mb-6">
          <div className="text-center">
            <div className="w-44 border-b-2 border-foreground mb-2 pt-12"></div>
            <p className="text-sm font-medium">Employee Signature</p>
            <p className="text-xs text-muted-foreground">Date: _______________</p>
          </div>
          {payslip.authorizedSignatory && (
            <div className="text-center">
              <div className="w-44 border-b-2 border-foreground mb-2 pt-12"></div>
              <p className="text-sm font-medium">{payslip.authorizedSignatory}</p>
              <p className="text-xs text-muted-foreground">Authorized Signatory</p>
            </div>
          )}
        </div>

        {payslip.remarks && (
          <div className="mb-4 p-4 rounded-lg bg-warning-light border border-warning text-sm">
            <p className="font-semibold text-warning">Remarks:</p>
            <p className="text-foreground">{payslip.remarks}</p>
          </div>
        )}

        <div className="border-t pt-4 text-center text-xs text-muted-foreground space-y-1">
          <p className="font-medium">{organization.name}</p>
          <p>{organization.address}, {organization.city}, {organization.country}</p>
          <p>{organization.phone} | {organization.email}{organization.website && ` | ${organization.website}`}</p>
          <p className="mt-2 italic">
            This is a system-generated payslip. For any discrepancies, please contact the HR department.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Payslip } from '@/types/payslip';
import { formatCurrency, formatPeriod } from '@/lib/payslip-utils';

interface PayslipModernTemplateProps {
  payslip: Payslip;
}

export function PayslipModernTemplate({ payslip }: PayslipModernTemplateProps) {
  const { organization, employee, period, earnings, deductions, currency } = payslip;

  return (
    <div
      data-payslip
      className="payslip-container bg-white w-full max-w-[800px] mx-auto payslip-shadow rounded-lg overflow-hidden"
      style={{ minHeight: '1000px' }}
    >
      {/* Header */}
      <header className="payslip-header-gradient text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold font-display">{organization.name}</h1>
            <p className="text-sm opacity-80 mt-1">{organization.address}</p>
            <p className="text-sm opacity-80">
              {organization.city}, {organization.state} {organization.postalCode}
            </p>
            <p className="text-sm opacity-80">{organization.country}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">PAYSLIP</p>
            <p className="text-sm opacity-80 mt-1">{formatPeriod(period)}</p>
            <p className="text-xs opacity-70 mt-2">#{payslip.payslipNumber}</p>
          </div>
        </div>
      </header>

      {/* Employee Info */}
      <section className="p-6 border-b border-payslip">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Employee Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{employee.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employee ID</p>
            <p className="font-medium">{employee.employeeId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Designation</p>
            <p className="font-medium">{employee.designation}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="font-medium">{employee.department}</p>
          </div>
          {employee.joiningDate && (
            <div>
              <p className="text-xs text-muted-foreground">Joining Date</p>
              <p className="font-medium">{employee.joiningDate}</p>
            </div>
          )}
          {employee.bankName && (
            <div>
              <p className="text-xs text-muted-foreground">Bank</p>
              <p className="font-medium">{employee.bankName}</p>
            </div>
          )}
          {employee.bankAccountNumber && (
            <div>
              <p className="text-xs text-muted-foreground">Account</p>
              <p className="font-medium">{employee.bankAccountNumber}</p>
            </div>
          )}
          {employee.panNumber && (
            <div>
              <p className="text-xs text-muted-foreground">PAN</p>
              <p className="font-medium">{employee.panNumber}</p>
            </div>
          )}
        </div>
      </section>

      {/* Salary Breakdown */}
      <section className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div>
            <h3 className="text-sm font-semibold text-success uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Earnings
            </h3>
            <div className="space-y-2">
              {earnings.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center py-2 px-3 rounded ${
                    idx % 2 === 0 ? 'bg-success-light/30' : ''
                  }`}
                >
                  <span className="text-sm">{item.name}</span>
                  <span className="font-medium currency-value">{formatCurrency(item.amount, currency)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 px-3 rounded bg-success-light border-t-2 border-success mt-2">
                <span className="font-semibold">Total Earnings</span>
                <span className="font-bold text-success currency-value">
                  {formatCurrency(payslip.totalEarnings, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              Deductions
            </h3>
            <div className="space-y-2">
              {deductions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">No deductions</p>
              ) : (
                deductions.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center py-2 px-3 rounded ${
                      idx % 2 === 0 ? 'bg-destructive/5' : ''
                    }`}
                  >
                    <span className="text-sm">{item.name}</span>
                    <span className="font-medium currency-value">{formatCurrency(item.amount, currency)}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-3 px-3 rounded bg-destructive/10 border-t-2 border-destructive mt-2">
                <span className="font-semibold">Total Deductions</span>
                <span className="font-bold text-destructive currency-value">
                  {formatCurrency(payslip.totalDeductions, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Net Pay */}
      <section className="mx-6 mb-6 p-6 rounded-lg payslip-header-gradient text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm opacity-80">Net Payable Amount</p>
            <p className="text-3xl font-bold currency-value">{formatCurrency(payslip.netPay, currency)}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs opacity-70">In Words</p>
            <p className="text-sm font-medium max-w-md">{payslip.netPayInWords}</p>
          </div>
        </div>
      </section>

      {/* Signature & Footer */}
      <footer className="px-6 pb-6 mt-auto">
        {payslip.authorizedSignatory && (
          <div className="flex justify-end mb-8">
            <div className="text-center">
              <div className="w-48 border-b border-foreground mb-2 pt-8"></div>
              <p className="text-sm font-medium">{payslip.authorizedSignatory}</p>
              <p className="text-xs text-muted-foreground">Authorized Signatory</p>
            </div>
          </div>
        )}

        {payslip.remarks && (
          <div className="mb-4 p-3 rounded bg-muted text-sm">
            <p className="font-medium">Remarks:</p>
            <p className="text-muted-foreground">{payslip.remarks}</p>
          </div>
        )}

        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          <p className="font-medium">{organization.name}</p>
          <p>
            {organization.phone} | {organization.email}
            {organization.website && ` | ${organization.website}`}
          </p>
          {organization.registrationNumber && <p>Reg: {organization.registrationNumber}</p>}
          {organization.taxId && <p>Tax ID: {organization.taxId}</p>}
          <p className="mt-2 italic">
            This is a computer-generated payslip and does not require a physical signature.
          </p>
        </div>
      </footer>
    </div>
  );
}

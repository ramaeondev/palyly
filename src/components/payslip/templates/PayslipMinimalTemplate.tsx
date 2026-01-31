import { Payslip } from '@/types/payslip';
import { formatCurrency, formatPeriod } from '@/lib/payslip-utils';

interface PayslipMinimalTemplateProps {
  payslip: Payslip;
}

export function PayslipMinimalTemplate({ payslip }: PayslipMinimalTemplateProps) {
  const { organization, employee, period, earnings, deductions, currency } = payslip;

  return (
    <div
      data-payslip
      className="payslip-container bg-white w-full max-w-[800px] mx-auto p-8"
      style={{ minHeight: '1000px' }}
    >
      {/* Header */}
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{organization.name}</h1>
          <p className="text-muted-foreground mt-1">{organization.address}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-light text-muted-foreground">Payslip</p>
          <p className="text-lg font-medium">{formatPeriod(period)}</p>
          <p className="text-xs text-muted-foreground mt-1">#{payslip.payslipNumber}</p>
        </div>
      </header>

      {/* Employee Info */}
      <section className="mb-12">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Employee</p>
            <p className="text-lg font-semibold">{employee.name}</p>
            <p className="text-sm text-muted-foreground">{employee.designation}</p>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Employee ID</p>
            <p className="text-lg font-semibold">{employee.employeeId}</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-border mb-8"></div>

      {/* Salary Breakdown */}
      <section className="mb-12">
        <div className="space-y-6">
          {/* Earnings */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">Earnings</h3>
            {earnings.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span className="text-foreground">{item.name}</span>
                <span className="font-medium currency-value">{formatCurrency(item.amount, currency)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t mt-2">
              <span className="font-semibold">Total Earnings</span>
              <span className="font-bold text-success currency-value">
                {formatCurrency(payslip.totalEarnings, currency)}
              </span>
            </div>
          </div>

          {/* Deductions */}
          {deductions.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">Deductions</h3>
              {deductions.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-medium currency-value">{formatCurrency(item.amount, currency)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-t mt-2">
                <span className="font-semibold">Total Deductions</span>
                <span className="font-bold text-destructive currency-value">
                  {formatCurrency(payslip.totalDeductions, currency)}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Net Pay */}
      <section className="py-8 border-y-2 border-foreground mb-12">
        <div className="flex justify-between items-center">
          <span className="text-xl">Net Pay</span>
          <span className="text-3xl font-bold currency-value">{formatCurrency(payslip.netPay, currency)}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{payslip.netPayInWords}</p>
      </section>

      {/* Signature */}
      {payslip.authorizedSignatory && (
        <section className="flex justify-end mb-12">
          <div className="text-center">
            <div className="w-48 border-b border-foreground mb-2 pt-8"></div>
            <p className="text-sm">{payslip.authorizedSignatory}</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto text-center text-xs text-muted-foreground">
        <p>{organization.email} · {organization.phone}</p>
      </footer>
    </div>
  );
}

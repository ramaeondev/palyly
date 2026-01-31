import { Payslip } from '@/types/payslip';
import { formatCurrency, formatPeriod } from '@/lib/payslip-utils';

interface PayslipClassicTemplateProps {
  payslip: Payslip;
}

export function PayslipClassicTemplate({ payslip }: PayslipClassicTemplateProps) {
  const { organization, employee, period, earnings, deductions, currency } = payslip;

  return (
    <div
      data-payslip
      className="payslip-container bg-white w-full max-w-[800px] mx-auto border-2 border-foreground"
      style={{ minHeight: '1000px' }}
    >
      {/* Header */}
      <header className="border-b-2 border-foreground p-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{organization.name}</h1>
        <p className="text-sm mt-1">{organization.address}</p>
        <p className="text-sm">
          {organization.city}, {organization.state} {organization.postalCode}, {organization.country}
        </p>
        <div className="mt-4 inline-block px-6 py-2 border-2 border-foreground">
          <p className="text-lg font-bold">SALARY SLIP</p>
          <p className="text-sm">{formatPeriod(period)}</p>
        </div>
      </header>

      {/* Employee Info Table */}
      <section className="p-6 border-b-2 border-foreground">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-2 font-semibold w-1/4">Employee Name:</td>
              <td className="py-2 w-1/4">{employee.name}</td>
              <td className="py-2 font-semibold w-1/4">Employee ID:</td>
              <td className="py-2 w-1/4">{employee.employeeId}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Designation:</td>
              <td className="py-2">{employee.designation}</td>
              <td className="py-2 font-semibold">Department:</td>
              <td className="py-2">{employee.department}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Date of Joining:</td>
              <td className="py-2">{employee.joiningDate || 'N/A'}</td>
              <td className="py-2 font-semibold">Bank Account:</td>
              <td className="py-2">{employee.bankAccountNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">PAN Number:</td>
              <td className="py-2">{employee.panNumber || 'N/A'}</td>
              <td className="py-2 font-semibold">PF Number:</td>
              <td className="py-2">{employee.pfNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Payslip No:</td>
              <td className="py-2" colSpan={3}>{payslip.payslipNumber}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Salary Breakdown */}
      <section className="p-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border border-foreground p-2 text-left w-1/2">EARNINGS</th>
              <th className="border border-foreground p-2 text-right w-1/4">AMOUNT ({currency.symbol})</th>
              <th className="border border-foreground p-2 text-left w-1/4">DEDUCTIONS</th>
              <th className="border border-foreground p-2 text-right">AMOUNT ({currency.symbol})</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(earnings.length, deductions.length, 5) }).map((_, idx) => {
              const earning = earnings[idx];
              const deduction = deductions[idx];
              return (
                <tr key={idx}>
                  <td className="border border-foreground p-2">{earning?.name || ''}</td>
                  <td className="border border-foreground p-2 text-right currency-value">
                    {earning ? formatCurrency(earning.amount, currency) : ''}
                  </td>
                  <td className="border border-foreground p-2">{deduction?.name || ''}</td>
                  <td className="border border-foreground p-2 text-right currency-value">
                    {deduction ? formatCurrency(deduction.amount, currency) : ''}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-muted font-bold">
              <td className="border border-foreground p-2">TOTAL EARNINGS</td>
              <td className="border border-foreground p-2 text-right currency-value">
                {formatCurrency(payslip.totalEarnings, currency)}
              </td>
              <td className="border border-foreground p-2">TOTAL DEDUCTIONS</td>
              <td className="border border-foreground p-2 text-right currency-value">
                {formatCurrency(payslip.totalDeductions, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Net Pay */}
      <section className="mx-6 mb-6 p-4 border-2 border-foreground bg-muted">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">NET PAY:</span>
          <span className="text-2xl font-bold currency-value">{formatCurrency(payslip.netPay, currency)}</span>
        </div>
        <p className="text-sm mt-2">
          <span className="font-semibold">In Words:</span> {payslip.netPayInWords}
        </p>
      </section>

      {/* Signature */}
      <footer className="px-6 pb-6 mt-auto">
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="w-40 border-b border-foreground mb-2 pt-12"></div>
            <p className="text-sm">Employee Signature</p>
          </div>
          {payslip.authorizedSignatory && (
            <div className="text-center">
              <div className="w-40 border-b border-foreground mb-2 pt-12"></div>
              <p className="text-sm font-medium">{payslip.authorizedSignatory}</p>
              <p className="text-xs text-muted-foreground">Authorized Signatory</p>
            </div>
          )}
        </div>

        {payslip.remarks && (
          <div className="mt-6 p-3 border border-foreground text-sm">
            <p className="font-semibold">Remarks:</p>
            <p>{payslip.remarks}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>{organization.phone} | {organization.email}</p>
          <p className="mt-1 italic">This is a computer-generated document.</p>
        </div>
      </footer>
    </div>
  );
}

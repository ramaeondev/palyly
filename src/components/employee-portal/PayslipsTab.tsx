import { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Payslip = Tables<'payslips'>;

interface PayslipsTabProps {
  payslips: Payslip[];
}

export function PayslipsTab({ payslips }: PayslipsTabProps) {
  const [fy, setFy] = useState('2025-26');

  const fmt = (n: number, cur: string) =>
    `${cur}${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-blue-600">🔽</span>
        <span className="text-sm font-medium text-slate-700">Financial Year :</span>
        <select
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="text-sm font-bold text-slate-900 bg-transparent border-none cursor-pointer focus:outline-none"
        >
          <option value="2025-26">2025 - 26</option>
          <option value="2024-25">2024 - 25</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Month</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Pay</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Reimbursements</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Deductions</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Take Home</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Payslips</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Tax Worksheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No payslips found for this period.
                  </td>
                </tr>
              ) : (
                payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline font-medium">
                        {p.pay_period}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {fmt(p.gross_earnings, p.currency)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {p.currency}0.00
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900">
                      {fmt(p.total_deductions, p.currency)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {fmt(p.net_pay, p.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { EarningsLineChart } from './EarningsLineChart';
import type { Tables } from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';

type Payslip = Tables<'payslips'>;

interface AnnualEarningsTabProps {
  payslips: Payslip[];
}

interface SalaryItem {
  name: string;
  amount: number;
}

function parseJsonArray(val: Json): SalaryItem[] {
  if (Array.isArray(val)) {
    return val.map((v: Json) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        const obj = v as Record<string, Json>;
        return { name: String(obj.name || ''), amount: Number(obj.amount || 0) };
      }
      return { name: '', amount: 0 };
    });
  }
  return [];
}

export function AnnualEarningsTab({ payslips }: AnnualEarningsTabProps) {
  const [fy, setFy] = useState('2025-26');
  const sorted = [...payslips].reverse();

  // Chart data
  const chartData = sorted.map((p) => ({
    month: p.pay_period?.split(' ').slice(0, 1).join('') || '',
    amount: p.net_pay,
  }));

  // Aggregate earnings by component
  const componentMap: Record<string, { ytd: number; monthly: Record<string, number> }> = {};
  sorted.forEach((p) => {
    const items = parseJsonArray(p.earnings);
    items.forEach((item) => {
      if (!componentMap[item.name]) componentMap[item.name] = { ytd: 0, monthly: {} };
      componentMap[item.name].ytd += item.amount;
      componentMap[item.name].monthly[p.pay_period] = item.amount;
    });
    // Include basic if no earnings
    if (items.length === 0) {
      if (!componentMap['Basic']) componentMap['Basic'] = { ytd: 0, monthly: {} };
      componentMap['Basic'].ytd += p.basic_salary;
      componentMap['Basic'].monthly[p.pay_period] = p.basic_salary;
    }
  });

  const currency = payslips[0]?.currency || '₹';
  const fmt = (n: number) => `${currency}${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const periods = sorted.map((p) => p.pay_period);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">For the financial year: {fy}</p>
        <div className="flex items-center gap-2">
          <span className="text-blue-600">🔽</span>
          <span className="text-sm text-slate-500">Financial Year :</span>
          <select
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="text-sm font-bold text-slate-900 bg-transparent border-none cursor-pointer focus:outline-none"
          >
            <option value="2025-26">2025 - 26</option>
            <option value="2024-25">2024 - 25</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {chartData.length > 0 ? (
          <EarningsLineChart data={chartData} />
        ) : (
          <p className="text-sm text-slate-400 text-center py-12">No data for chart</p>
        )}
      </div>

      {/* Data table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase sticky left-0 bg-white z-10">Earnings</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-700 uppercase">YTD Total</th>
                {periods.map((period) => (
                  <th key={period} className="text-right px-6 py-3 text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">
                    {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(componentMap).map(([name, data]) => (
                <tr key={name} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-600 sticky left-0 bg-white z-10">{name}</td>
                  <td className="px-6 py-3 text-right font-semibold text-slate-900">{fmt(data.ytd)}</td>
                  {periods.map((period) => (
                    <td key={period} className="px-6 py-3 text-right text-slate-700 whitespace-nowrap">
                      {fmt(data.monthly[period] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

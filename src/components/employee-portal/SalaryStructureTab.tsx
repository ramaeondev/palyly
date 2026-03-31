import { SalaryDonutChart } from './SalaryDonutChart';
import type { Tables } from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';

type Payslip = Tables<'payslips'>;

interface SalaryStructureTabProps {
  latestPayslip: Payslip | null;
}

interface SalaryItem {
  name: string;
  amount: number;
}

function parseJson(val: Json): SalaryItem[] {
  if (Array.isArray(val)) {
    return val.map((v: Json) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        const obj = v as Record<string, Json>;
        return {
          name: String(obj.name || ''),
          amount: Number(obj.amount || 0),
        };
      }
      return { name: '', amount: 0 };
    });
  }
  return [];
}

export function SalaryStructureTab({ latestPayslip }: SalaryStructureTabProps) {
  if (!latestPayslip) {
    return <p className="text-sm text-slate-400 py-12 text-center">No salary data available.</p>;
  }

  const p = latestPayslip;
  const currency = p.currency || '₹';
  const fmt = (n: number) => `${currency}${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const earnings = parseJson(p.earnings);
  const deductions = parseJson(p.deductions);
  const yearlyCTC = p.gross_earnings * 12;

  return (
    <div className="space-y-6">
      {/* Top summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <SalaryDonutChart
            earnings={p.gross_earnings}
            deductions={p.total_deductions}
            centerLabel="Salary Breakup"
            size={160}
          />
          <div className="flex-1 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold text-slate-900">
                Monthly CTC: {fmt(p.gross_earnings)}
              </span>
              <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                ⬇ Salary Structure
              </button>
            </div>
            <p className="text-sm text-slate-500">Yearly CTC: {fmt(yearlyCTC)}</p>
            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs text-slate-400">Earnings</p>
                  <p className="text-sm font-semibold">{fmt(p.gross_earnings)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-amber-500" />
                <div>
                  <p className="text-xs text-slate-400">Reimbursements</p>
                  <p className="text-sm font-semibold">{currency}0.00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-yellow-500" />
                <div>
                  <p className="text-xs text-slate-400">Benefits</p>
                  <p className="text-sm font-semibold">{currency}0.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Earnings</h3>
        <div className="space-y-3">
          {earnings.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-600">{e.name}</span>
              <span className="text-sm font-semibold text-slate-900">{fmt(e.amount)}</span>
            </div>
          ))}
          {earnings.length === 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-600">Basic Salary</span>
              <span className="text-sm font-semibold text-slate-900">{fmt(p.basic_salary)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 mt-4 pt-3 flex justify-between">
          <span className="text-sm font-medium text-slate-500">Monthly CTC</span>
          <span className="text-base font-bold text-slate-900">{fmt(p.gross_earnings)}</span>
        </div>
      </div>

      {/* Deductions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Other Deductions</h3>
        <div className="space-y-4">
          {deductions.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{d.name}</p>
                <p className="text-xs text-slate-400">(₹{(d.amount * 12).toLocaleString('en-IN')} has been deducted)</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{fmt(d.amount)}</span>
            </div>
          ))}
          {deductions.length === 0 && (
            <p className="text-sm text-slate-400">No deductions recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

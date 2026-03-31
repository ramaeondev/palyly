import { useState } from 'react';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { SalaryDonutChart } from './SalaryDonutChart';
import type { Tables } from '@/integrations/supabase/types';

type Payslip = Tables<'payslips'>;

interface HomeTabProps {
  employeeName: string;
  designation: string | null;
  department: string | null;
  payslips: Payslip[];
  onViewPayslip: () => void;
}

export function HomeTab({ employeeName, designation, department, payslips, onViewPayslip }: HomeTabProps) {
  const months = payslips.slice(0, 4);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = months[selectedIdx];

  const formatMonth = (period: string) => {
    return period || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome {employeeName?.split(' ')[0]}!</h1>
        <p className="text-sm text-slate-500">
          {designation || 'Employee'} at {department || 'Company'}
        </p>
      </div>

      {/* Payslip Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">📋</span>
          Your Payslips
        </h2>

        {months.length > 0 ? (
          <>
            {/* Month tabs */}
            <div className="flex gap-1 border-b border-slate-200 mb-6">
              {months.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    selectedIdx === idx
                      ? 'text-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {formatMonth(p.pay_period)}
                  {selectedIdx === idx && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {selected && (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <SalaryDonutChart
                  earnings={selected.gross_earnings}
                  deductions={selected.total_deductions}
                  centerLabel={formatMonth(selected.pay_period).toUpperCase()}
                />
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-1 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm text-slate-500">Take Home</p>
                      <p className="text-lg font-bold text-slate-900">
                        {selected.currency} {selected.net_pay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-1 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm text-slate-500">Deductions</p>
                      <p className="text-lg font-bold text-slate-900">
                        {selected.currency} {selected.total_deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-1 rounded-full bg-blue-400" />
                    <div>
                      <p className="text-sm text-slate-500">Gross Pay</p>
                      <p className="text-lg font-bold text-slate-900">
                        {selected.currency} {selected.gross_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 mt-6 pt-4 text-center">
              <button
                onClick={onViewPayslip}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View Payslip <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 py-8 text-center">No payslips available yet.</p>
        )}
      </div>

      {/* Tax Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
            Tax Summary: FY 2025 – 2026
          </h2>
          <span className="text-xs text-slate-400">You've opted for the New Regime (POI Based)</span>
        </div>
        <div className="flex items-center gap-3">
          <PartyPopper className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-semibold text-slate-900">You're tax free!</p>
            <p className="text-sm text-slate-500">
              Since your taxable income is within the no-tax slab, you don't have to pay any income tax this financial year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

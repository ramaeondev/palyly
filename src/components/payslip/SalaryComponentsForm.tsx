import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { SalaryComponent } from '@/types/payslip';
import { formatCurrency } from '@/lib/payslip-utils';
import { Currency } from '@/types/payslip';

interface SalaryComponentsFormProps {
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  currency: Currency;
  errors: Record<string, string[]>;
  onAddEarning: (name?: string) => void;
  onUpdateEarning: (id: string, field: keyof SalaryComponent, value: string | number | boolean) => void;
  onRemoveEarning: (id: string) => void;
  onAddDeduction: (name?: string) => void;
  onUpdateDeduction: (id: string, field: keyof SalaryComponent, value: string | number | boolean) => void;
  onRemoveDeduction: (id: string) => void;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

export function SalaryComponentsForm({
  earnings,
  deductions,
  currency,
  errors,
  onAddEarning,
  onUpdateEarning,
  onRemoveEarning,
  onAddDeduction,
  onUpdateDeduction,
  onRemoveDeduction,
  totalEarnings,
  totalDeductions,
  netPay,
}: SalaryComponentsFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Earnings Section */}
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold text-success">
              <TrendingUp className="h-5 w-5" />
              Earnings
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddEarning()}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {errors.earnings && (
            <p className="text-xs text-destructive">{errors.earnings[0]}</p>
          )}
          
          {earnings.map((earning, index) => (
            <div
              key={earning.id}
              className="flex items-center gap-2 p-3 rounded-lg bg-success-light/50 animate-fade-in"
            >
              <div className="flex-1 min-w-0">
                <Input
                  value={earning.name}
                  onChange={(e) => onUpdateEarning(earning.id, 'name', e.target.value)}
                  placeholder="Component name"
                  className="h-9 text-sm bg-background"
                />
              </div>
              <div className="w-32 flex-shrink-0">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currency.symbol}
                  </span>
                  <Input
                    type="number"
                    value={earning.amount || ''}
                    onChange={(e) => onUpdateEarning(earning.id, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="h-9 text-sm pl-8 bg-background currency-value"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveEarning(earning.id)}
                className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive"
                disabled={earnings.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Total Earnings</span>
              <span className="text-success currency-value">{formatCurrency(totalEarnings, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions Section */}
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold text-destructive">
              <TrendingDown className="h-5 w-5" />
              Deductions
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddDeduction()}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {deductions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No deductions added. Click "Add" to add deductions.
            </p>
          ) : (
            deductions.map((deduction) => (
              <div
                key={deduction.id}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 animate-fade-in"
              >
                <div className="flex-1 min-w-0">
                  <Input
                    value={deduction.name}
                    onChange={(e) => onUpdateDeduction(deduction.id, 'name', e.target.value)}
                    placeholder="Component name"
                    className="h-9 text-sm bg-background"
                  />
                </div>
                <div className="w-32 flex-shrink-0">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {currency.symbol}
                    </span>
                    <Input
                      type="number"
                      value={deduction.amount || ''}
                      onChange={(e) => onUpdateDeduction(deduction.id, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="h-9 text-sm pl-8 bg-background currency-value"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveDeduction(deduction.id)}
                  className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}

          {errors.totalDeductions && (
            <p className="text-xs text-destructive">{errors.totalDeductions[0]}</p>
          )}

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Total Deductions</span>
              <span className="text-destructive currency-value">{formatCurrency(totalDeductions, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Pay Summary */}
      <Card className="lg:col-span-2 payslip-header-gradient text-white">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm opacity-80">Net Pay</p>
              <p className="text-3xl font-bold currency-value">{formatCurrency(netPay, currency)}</p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <p className="text-xs opacity-70">Gross</p>
                <p className="text-lg font-semibold currency-value">{formatCurrency(totalEarnings, currency)}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Deductions</p>
                <p className="text-lg font-semibold currency-value">{formatCurrency(totalDeductions, currency)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Settings2 } from 'lucide-react';
import { PayslipPeriod, Currency, PayslipTemplate, SUPPORTED_CURRENCIES, PAYSLIP_TEMPLATES } from '@/types/payslip';
import { getMonthName, getPeriodDateRange } from '@/lib/payslip-utils';

interface PayslipSettingsProps {
  period: PayslipPeriod;
  currency: Currency;
  template: PayslipTemplate;
  authorizedSignatory: string;
  onUpdatePeriod: (field: keyof PayslipPeriod, value: number | string) => void;
  onSetCurrency: (currency: Currency) => void;
  onSetTemplate: (template: PayslipTemplate) => void;
  onSetAuthorizedSignatory: (value: string) => void;
}

export function PayslipSettings({
  period,
  currency,
  template,
  authorizedSignatory,
  onUpdatePeriod,
  onSetCurrency,
  onSetTemplate,
  onSetAuthorizedSignatory,
}: PayslipSettingsProps) {
  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    const { startDate, endDate } = getPeriodDateRange(month, period.year);
    onUpdatePeriod('month', month);
    onUpdatePeriod('startDate', startDate);
    onUpdatePeriod('endDate', endDate);
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    const { startDate, endDate } = getPeriodDateRange(period.month, year);
    onUpdatePeriod('year', year);
    onUpdatePeriod('startDate', startDate);
    onUpdatePeriod('endDate', endDate);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Period Settings */}
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            Pay Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Month</Label>
              <Select value={period.month.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Year</Label>
              <Select value={period.year.toString()} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted text-sm">
            <p className="text-muted-foreground">
              Period: <span className="text-foreground font-medium">{period.startDate}</span> to{' '}
              <span className="text-foreground font-medium">{period.endDate}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold">
            <Settings2 className="h-5 w-5 text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Currency</Label>
            <Select
              value={currency.code}
              onValueChange={(value) => {
                const selected = SUPPORTED_CURRENCIES.find((c) => c.code === value);
                if (selected) onSetCurrency(selected);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Template</Label>
            <Select value={template} onValueChange={(value) => onSetTemplate(value as PayslipTemplate)}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {PAYSLIP_TEMPLATES.map((tmpl) => (
                  <SelectItem key={tmpl.id} value={tmpl.id}>
                    {tmpl.name} - {tmpl.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatory" className="text-sm font-medium">
              Authorized Signatory
            </Label>
            <Input
              id="signatory"
              value={authorizedSignatory}
              onChange={(e) => onSetAuthorizedSignatory(e.target.value)}
              placeholder="HR Manager"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

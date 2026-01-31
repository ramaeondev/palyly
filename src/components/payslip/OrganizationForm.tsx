import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Organization } from '@/types/payslip';

interface OrganizationFormProps {
  organization: Organization;
  errors: Record<string, string[]>;
  onUpdate: (field: keyof Organization, value: string) => void;
}

export function OrganizationForm({ organization, errors, onUpdate }: OrganizationFormProps) {
  const getError = (field: string): string | undefined => {
    const key = `organization.${field}`;
    return errors[key]?.[0];
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          Organization Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-name" className="text-sm font-medium">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-name"
              value={organization.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="Acme Corporation"
              className={getError('name') ? 'border-destructive' : ''}
            />
            {getError('name') && (
              <p className="text-xs text-destructive">{getError('name')}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-address" className="text-sm font-medium">
              Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="org-address"
              value={organization.address}
              onChange={(e) => onUpdate('address', e.target.value)}
              placeholder="123 Business Park, Tech Hub"
              rows={2}
              className={getError('address') ? 'border-destructive' : ''}
            />
            {getError('address') && (
              <p className="text-xs text-destructive">{getError('address')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-city" className="text-sm font-medium">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-city"
              value={organization.city}
              onChange={(e) => onUpdate('city', e.target.value)}
              placeholder="Mumbai"
              className={getError('city') ? 'border-destructive' : ''}
            />
            {getError('city') && (
              <p className="text-xs text-destructive">{getError('city')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-state" className="text-sm font-medium">
              State
            </Label>
            <Input
              id="org-state"
              value={organization.state}
              onChange={(e) => onUpdate('state', e.target.value)}
              placeholder="Maharashtra"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-postal" className="text-sm font-medium">
              Postal Code
            </Label>
            <Input
              id="org-postal"
              value={organization.postalCode}
              onChange={(e) => onUpdate('postalCode', e.target.value)}
              placeholder="400001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-country" className="text-sm font-medium">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-country"
              value={organization.country}
              onChange={(e) => onUpdate('country', e.target.value)}
              placeholder="India"
              className={getError('country') ? 'border-destructive' : ''}
            />
            {getError('country') && (
              <p className="text-xs text-destructive">{getError('country')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-phone" className="text-sm font-medium">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-phone"
              type="tel"
              value={organization.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              placeholder="+91 22 1234 5678"
              className={getError('phone') ? 'border-destructive' : ''}
            />
            {getError('phone') && (
              <p className="text-xs text-destructive">{getError('phone')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-email"
              type="email"
              value={organization.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="hr@acmecorp.com"
              className={getError('email') ? 'border-destructive' : ''}
            />
            {getError('email') && (
              <p className="text-xs text-destructive">{getError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-website" className="text-sm font-medium">
              Website
            </Label>
            <Input
              id="org-website"
              value={organization.website || ''}
              onChange={(e) => onUpdate('website', e.target.value)}
              placeholder="https://acmecorp.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-reg" className="text-sm font-medium">
              Registration Number
            </Label>
            <Input
              id="org-reg"
              value={organization.registrationNumber || ''}
              onChange={(e) => onUpdate('registrationNumber', e.target.value)}
              placeholder="CIN-U12345MH2020PLC123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-tax" className="text-sm font-medium">
              Tax ID / GSTIN
            </Label>
            <Input
              id="org-tax"
              value={organization.taxId || ''}
              onChange={(e) => onUpdate('taxId', e.target.value)}
              placeholder="GSTIN-27AABCU9603R1ZM"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

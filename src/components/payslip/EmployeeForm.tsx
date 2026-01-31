import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Employee } from '@/types/payslip';

interface EmployeeFormProps {
  employee: Employee;
  errors: Record<string, string[]>;
  onUpdate: (field: keyof Employee, value: string) => void;
}

export function EmployeeForm({ employee, errors, onUpdate }: EmployeeFormProps) {
  const getError = (field: string): string | undefined => {
    const key = `employee.${field}`;
    return errors[key]?.[0];
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-sans font-semibold">
          <User className="h-5 w-5 text-primary" />
          Employee Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emp-id" className="text-sm font-medium">
              Employee ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-id"
              value={employee.employeeId}
              onChange={(e) => onUpdate('employeeId', e.target.value)}
              placeholder="EMP001"
              className={getError('employeeId') ? 'border-destructive' : ''}
            />
            {getError('employeeId') && (
              <p className="text-xs text-destructive">{getError('employeeId')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-name"
              value={employee.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="John Doe"
              className={getError('name') ? 'border-destructive' : ''}
            />
            {getError('name') && (
              <p className="text-xs text-destructive">{getError('name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="emp-email"
              type="email"
              value={employee.email || ''}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="john.doe@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-designation" className="text-sm font-medium">
              Designation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-designation"
              value={employee.designation}
              onChange={(e) => onUpdate('designation', e.target.value)}
              placeholder="Senior Software Engineer"
              className={getError('designation') ? 'border-destructive' : ''}
            />
            {getError('designation') && (
              <p className="text-xs text-destructive">{getError('designation')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-dept" className="text-sm font-medium">
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-dept"
              value={employee.department}
              onChange={(e) => onUpdate('department', e.target.value)}
              placeholder="Engineering"
              className={getError('department') ? 'border-destructive' : ''}
            />
            {getError('department') && (
              <p className="text-xs text-destructive">{getError('department')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-joining" className="text-sm font-medium">
              Joining Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emp-joining"
              type="date"
              value={employee.joiningDate}
              onChange={(e) => onUpdate('joiningDate', e.target.value)}
              className={getError('joiningDate') ? 'border-destructive' : ''}
            />
            {getError('joiningDate') && (
              <p className="text-xs text-destructive">{getError('joiningDate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-bank" className="text-sm font-medium">
              Bank Name
            </Label>
            <Input
              id="emp-bank"
              value={employee.bankName || ''}
              onChange={(e) => onUpdate('bankName', e.target.value)}
              placeholder="HDFC Bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-account" className="text-sm font-medium">
              Account Number
            </Label>
            <Input
              id="emp-account"
              value={employee.bankAccountNumber || ''}
              onChange={(e) => onUpdate('bankAccountNumber', e.target.value)}
              placeholder="XXXX-XXXX-1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-pan" className="text-sm font-medium">
              PAN Number
            </Label>
            <Input
              id="emp-pan"
              value={employee.panNumber || ''}
              onChange={(e) => onUpdate('panNumber', e.target.value)}
              placeholder="ABCDE1234F"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emp-pf" className="text-sm font-medium">
              PF Number
            </Label>
            <Input
              id="emp-pf"
              value={employee.pfNumber || ''}
              onChange={(e) => onUpdate('pfNumber', e.target.value)}
              placeholder="MH/BAN/12345/67890"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

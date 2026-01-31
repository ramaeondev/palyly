// Core interfaces for the Payslip Generator application
// Strict typing - no 'any' types allowed

export interface Organization {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  registrationNumber?: string;
  taxId?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  designation: string;
  department: string;
  joiningDate: string;
  bankAccountNumber?: string;
  bankName?: string;
  panNumber?: string;
  pfNumber?: string;
}

export type SalaryComponentType = 'earning' | 'deduction';

export interface SalaryComponent {
  id: string;
  name: string;
  type: SalaryComponentType;
  amount: number;
  isPercentage: boolean;
  percentageOf?: string; // Reference to another component ID (usually basic salary)
  description?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
];

export interface PayslipPeriod {
  month: number; // 1-12
  year: number;
  startDate: string;
  endDate: string;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  organization: Organization;
  employee: Employee;
  period: PayslipPeriod;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  currency: Currency;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
  generatedAt: string;
  authorizedSignatory?: string;
  remarks?: string;
}

export type PayslipTemplate = 'classic' | 'modern' | 'minimal' | 'detailed';

export interface PayslipTemplateConfig {
  id: PayslipTemplate;
  name: string;
  description: string;
  preview: string;
}

export const PAYSLIP_TEMPLATES: PayslipTemplateConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional corporate payslip with structured layout',
    preview: '/templates/classic.png',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design with accent colors',
    preview: '/templates/modern.png',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant with focus on essential information',
    preview: '/templates/minimal.png',
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive breakdown with all salary components',
    preview: '/templates/detailed.png',
  },
];

// Default salary components for quick setup
export const DEFAULT_EARNING_COMPONENTS: Omit<SalaryComponent, 'id' | 'amount'>[] = [
  { name: 'Basic Salary', type: 'earning', isPercentage: false },
  { name: 'House Rent Allowance', type: 'earning', isPercentage: true, percentageOf: 'basic', description: 'HRA' },
  { name: 'Conveyance Allowance', type: 'earning', isPercentage: false },
  { name: 'Medical Allowance', type: 'earning', isPercentage: false },
  { name: 'Special Allowance', type: 'earning', isPercentage: false },
];

export const DEFAULT_DEDUCTION_COMPONENTS: Omit<SalaryComponent, 'id' | 'amount'>[] = [
  { name: 'Provident Fund', type: 'deduction', isPercentage: true, percentageOf: 'basic', description: 'PF' },
  { name: 'Professional Tax', type: 'deduction', isPercentage: false, description: 'PT' },
  { name: 'Income Tax', type: 'deduction', isPercentage: false, description: 'TDS' },
  { name: 'ESI', type: 'deduction', isPercentage: true, percentageOf: 'gross', description: 'Employee State Insurance' },
];

// JSON schema for bulk upload
export interface PayslipJsonData {
  organization: Omit<Organization, 'id'>;
  employees: Array<{
    employee: Omit<Employee, 'id'>;
    periods: Array<{
      period: Omit<PayslipPeriod, 'startDate' | 'endDate'>;
      earnings: Array<{ name: string; amount: number }>;
      deductions: Array<{ name: string; amount: number }>;
      remarks?: string;
    }>;
  }>;
  currency?: string;
  authorizedSignatory?: string;
}

// Form state types
export interface PayslipFormState {
  organization: Organization;
  employee: Employee;
  period: PayslipPeriod;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  currency: Currency;
  template: PayslipTemplate;
  authorizedSignatory: string;
  remarks: string;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

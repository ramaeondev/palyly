import { toWords } from 'number-to-words';
import { v4 as uuidv4 } from 'uuid';
import type {
  Currency,
  Employee,
  Organization,
  Payslip,
  PayslipFormState,
  PayslipJsonData,
  PayslipPeriod,
  SalaryComponent,
  ValidationResult,
} from '@/types/payslip';
import { SUPPORTED_CURRENCIES } from '@/types/payslip';

/**
 * Format currency amount based on locale and currency code
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert number to words with currency
 */
export function numberToWords(amount: number, currency: Currency): string {
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);

  let words = capitalizeFirstLetter(toWords(wholePart));

  // Add currency name
  const currencyName = getCurrencyWordName(currency.code);
  words += ` ${currencyName}`;

  if (decimalPart > 0) {
    words += ` and ${capitalizeFirstLetter(toWords(decimalPart))} ${getCurrencySubunitName(currency.code)}`;
  }

  return words + ' Only';
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCurrencyWordName(code: string): string {
  const names: Record<string, string> = {
    USD: 'Dollars',
    EUR: 'Euros',
    GBP: 'Pounds Sterling',
    INR: 'Rupees',
    AUD: 'Australian Dollars',
    CAD: 'Canadian Dollars',
    JPY: 'Yen',
    CNY: 'Yuan',
    SGD: 'Singapore Dollars',
    AED: 'Dirhams',
  };
  return names[code] || code;
}

function getCurrencySubunitName(code: string): string {
  const subunits: Record<string, string> = {
    USD: 'Cents',
    EUR: 'Cents',
    GBP: 'Pence',
    INR: 'Paise',
    AUD: 'Cents',
    CAD: 'Cents',
    JPY: 'Sen',
    CNY: 'Fen',
    SGD: 'Cents',
    AED: 'Fils',
  };
  return subunits[code] || 'Cents';
}

/**
 * Generate unique payslip number
 */
export function generatePayslipNumber(employeeId: string, period: PayslipPeriod): string {
  const monthStr = period.month.toString().padStart(2, '0');
  const yearStr = period.year.toString();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PS-${yearStr}${monthStr}-${employeeId}-${randomSuffix}`;
}

/**
 * Calculate total earnings
 */
export function calculateTotalEarnings(earnings: SalaryComponent[]): number {
  return earnings.reduce((sum, comp) => sum + comp.amount, 0);
}

/**
 * Calculate total deductions
 */
export function calculateTotalDeductions(deductions: SalaryComponent[]): number {
  return deductions.reduce((sum, comp) => sum + comp.amount, 0);
}

/**
 * Calculate net pay
 */
export function calculateNetPay(totalEarnings: number, totalDeductions: number): number {
  return Math.max(0, totalEarnings - totalDeductions);
}

/**
 * Get period date range
 */
export function getPeriodDateRange(month: number, year: number): { startDate: string; endDate: string } {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || '';
}

/**
 * Format period as string
 */
export function formatPeriod(period: PayslipPeriod): string {
  return `${getMonthName(period.month)} ${period.year}`;
}

/**
 * Create a new salary component
 */
export function createSalaryComponent(
  name: string,
  type: 'earning' | 'deduction',
  amount: number = 0,
  isPercentage: boolean = false
): SalaryComponent {
  return {
    id: uuidv4(),
    name,
    type,
    amount,
    isPercentage,
  };
}

/**
 * Create default organization
 */
export function createDefaultOrganization(): Organization {
  return {
    id: uuidv4(),
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    registrationNumber: '',
    taxId: '',
  };
}

/**
 * Create default employee
 */
export function createDefaultEmployee(): Employee {
  return {
    id: uuidv4(),
    employeeId: '',
    name: '',
    email: '',
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    bankAccountNumber: '',
    bankName: '',
    panNumber: '',
    pfNumber: '',
  };
}

/**
 * Create default period (current month)
 */
export function createDefaultPeriod(): PayslipPeriod {
  const now = new Date();
  const { startDate, endDate } = getPeriodDateRange(now.getMonth() + 1, now.getFullYear());
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    startDate,
    endDate,
  };
}

/**
 * Generate payslip from form state
 */
export function generatePayslip(formState: PayslipFormState): Payslip {
  const totalEarnings = calculateTotalEarnings(formState.earnings);
  const totalDeductions = calculateTotalDeductions(formState.deductions);
  const netPay = calculateNetPay(totalEarnings, totalDeductions);

  return {
    id: uuidv4(),
    payslipNumber: generatePayslipNumber(formState.employee.employeeId, formState.period),
    organization: formState.organization,
    employee: formState.employee,
    period: formState.period,
    earnings: formState.earnings,
    deductions: formState.deductions,
    currency: formState.currency,
    totalEarnings,
    totalDeductions,
    netPay,
    netPayInWords: numberToWords(netPay, formState.currency),
    generatedAt: new Date().toISOString(),
    authorizedSignatory: formState.authorizedSignatory,
    remarks: formState.remarks,
  };
}

/**
 * Validate organization data
 */
export function validateOrganization(org: Organization): ValidationResult {
  const errors: Record<string, string[]> = {};

  if (!org.name.trim()) {
    errors.name = ['Organization name is required'];
  }
  if (!org.address.trim()) {
    errors.address = ['Address is required'];
  }
  if (!org.city.trim()) {
    errors.city = ['City is required'];
  }
  if (!org.country.trim()) {
    errors.country = ['Country is required'];
  }
  if (!org.phone.trim()) {
    errors.phone = ['Phone number is required'];
  }
  if (!org.email.trim()) {
    errors.email = ['Email is required'];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(org.email)) {
    errors.email = ['Invalid email format'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate employee data
 */
export function validateEmployee(emp: Employee): ValidationResult {
  const errors: Record<string, string[]> = {};

  if (!emp.employeeId.trim()) {
    errors.employeeId = ['Employee ID is required'];
  }
  if (!emp.name.trim()) {
    errors.name = ['Employee name is required'];
  }
  if (!emp.designation.trim()) {
    errors.designation = ['Designation is required'];
  }
  if (!emp.department.trim()) {
    errors.department = ['Department is required'];
  }
  if (!emp.joiningDate) {
    errors.joiningDate = ['Joining date is required'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate salary components
 */
export function validateSalaryComponents(
  earnings: SalaryComponent[],
  deductions: SalaryComponent[]
): ValidationResult {
  const errors: Record<string, string[]> = {};

  if (earnings.length === 0) {
    errors.earnings = ['At least one earning component is required'];
  }

  const totalEarnings = calculateTotalEarnings(earnings);
  if (totalEarnings <= 0) {
    errors.totalEarnings = ['Total earnings must be greater than zero'];
  }

  const totalDeductions = calculateTotalDeductions(deductions);
  if (totalDeductions > totalEarnings) {
    errors.totalDeductions = ['Total deductions cannot exceed total earnings'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Parse and validate JSON data for bulk upload
 */
export function parsePayslipJson(jsonString: string): { data: PayslipJsonData | null; errors: string[] } {
  const errors: string[] = [];

  try {
    const data = JSON.parse(jsonString) as PayslipJsonData;

    // Validate required fields
    if (!data.organization) {
      errors.push('Organization data is required');
    } else {
      if (!data.organization.name) errors.push('Organization name is required');
      if (!data.organization.address) errors.push('Organization address is required');
    }

    if (!data.employees || !Array.isArray(data.employees) || data.employees.length === 0) {
      errors.push('At least one employee is required');
    } else {
      data.employees.forEach((emp, idx) => {
        if (!emp.employee?.name) {
          errors.push(`Employee ${idx + 1}: Name is required`);
        }
        if (!emp.employee?.employeeId) {
          errors.push(`Employee ${idx + 1}: Employee ID is required`);
        }
        if (!emp.periods || emp.periods.length === 0) {
          errors.push(`Employee ${idx + 1}: At least one period is required`);
        }
      });
    }

    if (errors.length > 0) {
      return { data: null, errors };
    }

    return { data, errors: [] };
  } catch (parseError: unknown) {
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
    return { data: null, errors: [`Invalid JSON format: ${errorMessage}`] };
  }
}

/**
 * Generate payslips from JSON data
 */
export function generatePayslipsFromJson(
  jsonData: PayslipJsonData,
  template: string,
  authorizedSignatory: string
): Payslip[] {
  const payslips: Payslip[] = [];
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === jsonData.currency) || SUPPORTED_CURRENCIES[3]; // Default to INR

  const organization: Organization = {
    id: uuidv4(),
    ...jsonData.organization,
    city: jsonData.organization.city || '',
    state: jsonData.organization.state || '',
    postalCode: jsonData.organization.postalCode || '',
    country: jsonData.organization.country || '',
    phone: jsonData.organization.phone || '',
    email: jsonData.organization.email || '',
  };

  jsonData.employees.forEach((empData) => {
    const employee: Employee = {
      id: uuidv4(),
      employeeId: empData.employee.employeeId,
      name: empData.employee.name,
      email: empData.employee.email,
      designation: empData.employee.designation || '',
      department: empData.employee.department || '',
      joiningDate: empData.employee.joiningDate || '',
      bankAccountNumber: empData.employee.bankAccountNumber,
      bankName: empData.employee.bankName,
      panNumber: empData.employee.panNumber,
      pfNumber: empData.employee.pfNumber,
    };

    empData.periods.forEach((periodData) => {
      const { startDate, endDate } = getPeriodDateRange(periodData.period.month, periodData.period.year);
      const period: PayslipPeriod = {
        month: periodData.period.month,
        year: periodData.period.year,
        startDate,
        endDate,
      };

      const earnings: SalaryComponent[] = periodData.earnings.map((e) => ({
        id: uuidv4(),
        name: e.name,
        type: 'earning' as const,
        amount: e.amount,
        isPercentage: false,
      }));

      const deductions: SalaryComponent[] = periodData.deductions.map((d) => ({
        id: uuidv4(),
        name: d.name,
        type: 'deduction' as const,
        amount: d.amount,
        isPercentage: false,
      }));

      const totalEarnings = calculateTotalEarnings(earnings);
      const totalDeductions = calculateTotalDeductions(deductions);
      const netPay = calculateNetPay(totalEarnings, totalDeductions);

      payslips.push({
        id: uuidv4(),
        payslipNumber: generatePayslipNumber(employee.employeeId, period),
        organization,
        employee,
        period,
        earnings,
        deductions,
        currency,
        totalEarnings,
        totalDeductions,
        netPay,
        netPayInWords: numberToWords(netPay, currency),
        generatedAt: new Date().toISOString(),
        authorizedSignatory: authorizedSignatory || jsonData.authorizedSignatory,
        remarks: periodData.remarks,
      });
    });
  });

  return payslips;
}

/**
 * Sample JSON template for documentation
 */
export const SAMPLE_JSON_TEMPLATE: PayslipJsonData = {
  organization: {
    name: 'Acme Corporation',
    address: '123 Business Park, Tech Hub',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phone: '+91 22 1234 5678',
    email: 'hr@acmecorp.com',
    website: 'https://acmecorp.com',
    registrationNumber: 'CIN-U12345MH2020PLC123456',
    taxId: 'GSTIN-27AABCU9603R1ZM',
  },
  employees: [
    {
      employee: {
        employeeId: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@acmecorp.com',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        joiningDate: '2022-03-15',
        bankAccountNumber: 'XXXX-XXXX-1234',
        bankName: 'HDFC Bank',
        panNumber: 'ABCDE1234F',
        pfNumber: 'MH/BAN/12345/67890',
      },
      periods: [
        {
          period: { month: 1, year: 2026 },
          earnings: [
            { name: 'Basic Salary', amount: 50000 },
            { name: 'House Rent Allowance', amount: 20000 },
            { name: 'Conveyance Allowance', amount: 3000 },
            { name: 'Special Allowance', amount: 15000 },
          ],
          deductions: [
            { name: 'Provident Fund', amount: 6000 },
            { name: 'Professional Tax', amount: 200 },
            { name: 'Income Tax', amount: 8500 },
          ],
          remarks: 'Regular monthly salary',
        },
      ],
    },
  ],
  currency: 'INR',
  authorizedSignatory: 'HR Manager',
};

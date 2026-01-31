import { useState, useCallback } from 'react';
import type { 
  Organization, 
  Employee, 
  SalaryComponent, 
  PayslipPeriod,
  Currency,
  PayslipTemplate,
  PayslipFormState,
  Payslip,
} from '@/types/payslip';
import { SUPPORTED_CURRENCIES } from '@/types/payslip';
import {
  createDefaultOrganization,
  createDefaultEmployee,
  createDefaultPeriod,
  createSalaryComponent,
  generatePayslip,
  validateOrganization,
  validateEmployee,
  validateSalaryComponents,
} from '@/lib/payslip-utils';

interface UsePayslipFormResult {
  formState: PayslipFormState;
  errors: Record<string, string[]>;
  
  // Organization
  setOrganization: (org: Organization) => void;
  updateOrganizationField: (field: keyof Organization, value: string) => void;
  
  // Employee
  setEmployee: (emp: Employee) => void;
  updateEmployeeField: (field: keyof Employee, value: string) => void;
  
  // Period
  setPeriod: (period: PayslipPeriod) => void;
  updatePeriodField: (field: keyof PayslipPeriod, value: number | string) => void;
  
  // Salary Components
  addEarning: (name?: string) => void;
  updateEarning: (id: string, field: keyof SalaryComponent, value: string | number | boolean) => void;
  removeEarning: (id: string) => void;
  addDeduction: (name?: string) => void;
  updateDeduction: (id: string, field: keyof SalaryComponent, value: string | number | boolean) => void;
  removeDeduction: (id: string) => void;
  
  // Currency & Template
  setCurrency: (currency: Currency) => void;
  setTemplate: (template: PayslipTemplate) => void;
  
  // Misc
  setAuthorizedSignatory: (value: string) => void;
  setRemarks: (value: string) => void;
  
  // Actions
  validate: () => boolean;
  generatePayslipFromForm: () => Payslip | null;
  resetForm: () => void;
  loadFormState: (state: Partial<PayslipFormState>) => void;
  
  // Computed
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

const initialFormState: PayslipFormState = {
  organization: createDefaultOrganization(),
  employee: createDefaultEmployee(),
  period: createDefaultPeriod(),
  earnings: [createSalaryComponent('Basic Salary', 'earning')],
  deductions: [],
  currency: SUPPORTED_CURRENCIES[3], // INR default
  template: 'modern',
  authorizedSignatory: '',
  remarks: '',
};

export function usePayslipForm(): UsePayslipFormResult {
  const [formState, setFormState] = useState<PayslipFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Organization handlers
  const setOrganization = useCallback((org: Organization) => {
    setFormState((prev) => ({ ...prev, organization: org }));
  }, []);

  const updateOrganizationField = useCallback((field: keyof Organization, value: string) => {
    setFormState((prev) => ({
      ...prev,
      organization: { ...prev.organization, [field]: value },
    }));
  }, []);

  // Employee handlers
  const setEmployee = useCallback((emp: Employee) => {
    setFormState((prev) => ({ ...prev, employee: emp }));
  }, []);

  const updateEmployeeField = useCallback((field: keyof Employee, value: string) => {
    setFormState((prev) => ({
      ...prev,
      employee: { ...prev.employee, [field]: value },
    }));
  }, []);

  // Period handlers
  const setPeriod = useCallback((period: PayslipPeriod) => {
    setFormState((prev) => ({ ...prev, period }));
  }, []);

  const updatePeriodField = useCallback((field: keyof PayslipPeriod, value: number | string) => {
    setFormState((prev) => ({
      ...prev,
      period: { ...prev.period, [field]: value },
    }));
  }, []);

  // Earnings handlers
  const addEarning = useCallback((name: string = 'New Earning') => {
    setFormState((prev) => ({
      ...prev,
      earnings: [...prev.earnings, createSalaryComponent(name, 'earning')],
    }));
  }, []);

  const updateEarning = useCallback((id: string, field: keyof SalaryComponent, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      earnings: prev.earnings.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  }, []);

  const removeEarning = useCallback((id: string) => {
    setFormState((prev) => ({
      ...prev,
      earnings: prev.earnings.filter((e) => e.id !== id),
    }));
  }, []);

  // Deductions handlers
  const addDeduction = useCallback((name: string = 'New Deduction') => {
    setFormState((prev) => ({
      ...prev,
      deductions: [...prev.deductions, createSalaryComponent(name, 'deduction')],
    }));
  }, []);

  const updateDeduction = useCallback((id: string, field: keyof SalaryComponent, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      deductions: prev.deductions.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));
  }, []);

  const removeDeduction = useCallback((id: string) => {
    setFormState((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((d) => d.id !== id),
    }));
  }, []);

  // Currency & Template
  const setCurrency = useCallback((currency: Currency) => {
    setFormState((prev) => ({ ...prev, currency }));
  }, []);

  const setTemplate = useCallback((template: PayslipTemplate) => {
    setFormState((prev) => ({ ...prev, template }));
  }, []);

  // Misc
  const setAuthorizedSignatory = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, authorizedSignatory: value }));
  }, []);

  const setRemarks = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, remarks: value }));
  }, []);

  // Validation
  const validate = useCallback((): boolean => {
    const allErrors: Record<string, string[]> = {};

    const orgValidation = validateOrganization(formState.organization);
    if (!orgValidation.isValid) {
      Object.entries(orgValidation.errors).forEach(([key, value]) => {
        allErrors[`organization.${key}`] = value;
      });
    }

    const empValidation = validateEmployee(formState.employee);
    if (!empValidation.isValid) {
      Object.entries(empValidation.errors).forEach(([key, value]) => {
        allErrors[`employee.${key}`] = value;
      });
    }

    const salaryValidation = validateSalaryComponents(formState.earnings, formState.deductions);
    if (!salaryValidation.isValid) {
      Object.entries(salaryValidation.errors).forEach(([key, value]) => {
        allErrors[key] = value;
      });
    }

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }, [formState]);

  // Generate payslip
  const generatePayslipFromForm = useCallback((): Payslip | null => {
    if (!validate()) {
      return null;
    }
    return generatePayslip(formState);
  }, [formState, validate]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setErrors({});
  }, []);

  // Load form state
  const loadFormState = useCallback((state: Partial<PayslipFormState>) => {
    setFormState((prev) => ({ ...prev, ...state }));
  }, []);

  // Computed values
  const totalEarnings = formState.earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = formState.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = Math.max(0, totalEarnings - totalDeductions);

  return {
    formState,
    errors,
    setOrganization,
    updateOrganizationField,
    setEmployee,
    updateEmployeeField,
    setPeriod,
    updatePeriodField,
    addEarning,
    updateEarning,
    removeEarning,
    addDeduction,
    updateDeduction,
    removeDeduction,
    setCurrency,
    setTemplate,
    setAuthorizedSignatory,
    setRemarks,
    validate,
    generatePayslipFromForm,
    resetForm,
    loadFormState,
    totalEarnings,
    totalDeductions,
    netPay,
  };
}

import { useCallback, useRef, useState } from 'react';
import { parsePayslipJson, generatePayslipsFromJson } from '@/lib/payslip-utils';
import type { Payslip, PayslipTemplate } from '@/types/payslip';

interface UseJsonUploadResult {
  uploadedPayslips: Payslip[];
  isLoading: boolean;
  errors: string[];
  handleFileUpload: (file: File, template: PayslipTemplate, signatory: string) => Promise<void>;
  clearUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function useJsonUpload(): UseJsonUploadResult {
  const [uploadedPayslips, setUploadedPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File, template: PayslipTemplate, signatory: string) => {
    setIsLoading(true);
    setErrors([]);
    setUploadedPayslips([]);

    try {
      const text = await file.text();
      const { data, errors: parseErrors } = parsePayslipJson(text);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        return;
      }

      if (data) {
        const payslips = generatePayslipsFromJson(data, template, signatory);
        setUploadedPayslips(payslips);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors([`Failed to read file: ${errorMessage}`]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUpload = useCallback(() => {
    setUploadedPayslips([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    uploadedPayslips,
    isLoading,
    errors,
    handleFileUpload,
    clearUpload,
    fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>,
  };
}

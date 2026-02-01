import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Payslip, PayslipTemplate } from '@/types/payslip';
import { formatPeriod } from '@/lib/payslip-utils';

interface UsePdfGeneratorOptions {
  quality?: number;
  scale?: number;
}

interface PdfGeneratorResult {
  generatePdf: (payslip: Payslip, template?: PayslipTemplate) => Promise<void>;
  printPayslip: (payslip: Payslip, template?: PayslipTemplate) => Promise<void>;
  isGenerating: boolean;
}

export function usePdfGenerator(options: UsePdfGeneratorOptions = {}): PdfGeneratorResult {
  const { quality = 2, scale = 2 } = options;
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async (payslip: Payslip, template: PayslipTemplate = 'modern') => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      // Find the payslip preview element
      const element = document.getElementById('payslip-preview');
      
      if (!element) {
        console.error('No payslip preview element found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;

      const imgData = canvas.toDataURL('image/jpeg', quality);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center vertically if smaller than page
      const yOffset = imgHeight < pageHeight - 2 * margin 
        ? margin + (pageHeight - 2 * margin - imgHeight) / 2 
        : margin;

      pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight);

      // Generate filename
      const filename = `payslip-${payslip.employee.employeeId}-${formatPeriod(payslip.period).replace(' ', '-')}`;
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [quality, scale, isGenerating]);

  const printPayslip = useCallback(async (payslip: Payslip, template: PayslipTemplate = 'modern') => {
    window.print();
  }, []);

  return {
    generatePdf,
    printPayslip,
    isGenerating,
  };
}

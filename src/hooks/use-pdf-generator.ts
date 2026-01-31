import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Payslip } from '@/types/payslip';
import { formatPeriod } from '@/lib/payslip-utils';

interface UsePdfGeneratorOptions {
  quality?: number;
  scale?: number;
}

interface PdfGeneratorResult {
  generatePdf: (payslips: Payslip[]) => Promise<void>;
  printPayslip: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
}

export function usePdfGenerator(options: UsePdfGeneratorOptions = {}): PdfGeneratorResult {
  const { quality = 2, scale = 2 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const isGeneratingRef = useRef(false);

  const generatePdf = useCallback(async (payslips: Payslip[]) => {
    if (!containerRef.current || isGeneratingRef.current) return;

    isGeneratingRef.current = true;

    try {
      const payslipElements = containerRef.current.querySelectorAll('[data-payslip]');
      
      if (payslipElements.length === 0) {
        console.error('No payslip elements found');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;

      for (let i = 0; i < payslipElements.length; i++) {
        const element = payslipElements[i] as HTMLElement;

        const canvas = await html2canvas(element, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', quality);
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        // Center vertically if smaller than page
        const yOffset = imgHeight < pageHeight - 2 * margin 
          ? margin + (pageHeight - 2 * margin - imgHeight) / 2 
          : margin;

        pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight);
      }

      // Generate filename
      const firstPayslip = payslips[0];
      let filename = 'payslip';
      
      if (payslips.length === 1) {
        filename = `payslip-${firstPayslip.employee.employeeId}-${formatPeriod(firstPayslip.period).replace(' ', '-')}`;
      } else {
        filename = `payslips-${formatPeriod(firstPayslip.period).replace(' ', '-')}-batch-${payslips.length}`;
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [quality, scale]);

  const printPayslip = useCallback(() => {
    window.print();
  }, []);

  return {
    generatePdf,
    printPayslip,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    isGenerating: isGeneratingRef.current,
  };
}

import { Payslip, PayslipTemplate } from '@/types/payslip';
import { PayslipModernTemplate } from './templates/PayslipModernTemplate';
import { PayslipClassicTemplate } from './templates/PayslipClassicTemplate';
import { PayslipMinimalTemplate } from './templates/PayslipMinimalTemplate';
import { PayslipDetailedTemplate } from './templates/PayslipDetailedTemplate';

interface PayslipPreviewProps {
  payslip: Payslip;
  template: PayslipTemplate;
}

export function PayslipPreview({ payslip, template }: PayslipPreviewProps) {
  switch (template) {
    case 'classic':
      return <PayslipClassicTemplate payslip={payslip} />;
    case 'minimal':
      return <PayslipMinimalTemplate payslip={payslip} />;
    case 'detailed':
      return <PayslipDetailedTemplate payslip={payslip} />;
    case 'modern':
    default:
      return <PayslipModernTemplate payslip={payslip} />;
  }
}

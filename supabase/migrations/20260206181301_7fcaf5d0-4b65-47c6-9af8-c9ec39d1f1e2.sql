
-- Create payslip_templates table
CREATE TABLE public.payslip_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  header TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  footer TEXT NOT NULL DEFAULT '',
  signatory_name TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Only one default template per firm
CREATE UNIQUE INDEX idx_payslip_templates_default ON public.payslip_templates (firm_id) WHERE is_default = true;

-- Enable RLS
ALTER TABLE public.payslip_templates ENABLE ROW LEVEL SECURITY;

-- Firm users can manage templates in their firm
CREATE POLICY "Firm users can view templates"
  ON public.payslip_templates FOR SELECT
  USING (firm_id = get_user_firm_id(auth.uid()));

CREATE POLICY "Firm admins can insert templates"
  ON public.payslip_templates FOR INSERT
  WITH CHECK (firm_id = get_user_firm_id(auth.uid()) AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Firm admins can update templates"
  ON public.payslip_templates FOR UPDATE
  USING (firm_id = get_user_firm_id(auth.uid()) AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Firm admins can delete non-default templates"
  ON public.payslip_templates FOR DELETE
  USING (firm_id = get_user_firm_id(auth.uid()) AND has_role(auth.uid(), 'super_admin'::app_role) AND is_default = false);

-- Client users can view templates from their firm (for selection)
CREATE POLICY "Client users can view firm templates"
  ON public.payslip_templates FOR SELECT
  USING (
    firm_id IN (
      SELECT c.firm_id FROM clients c WHERE c.id = get_client_user_client_id(auth.uid())
    )
  );

-- Add template columns to clients table
ALTER TABLE public.clients
  ADD COLUMN assigned_template_id UUID REFERENCES public.payslip_templates(id) ON DELETE SET NULL,
  ADD COLUMN selected_template_id UUID REFERENCES public.payslip_templates(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_payslip_templates_updated_at
  BEFORE UPDATE ON public.payslip_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

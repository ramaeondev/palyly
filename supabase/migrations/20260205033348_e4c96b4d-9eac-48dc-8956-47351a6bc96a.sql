-- Create payroll status enum
CREATE TYPE public.payroll_status AS ENUM ('draft', 'review', 'approved', 'published');

-- Create component type enum
CREATE TYPE public.salary_component_type AS ENUM ('earning', 'deduction');

-- Create payroll_runs table for scheduled payroll
CREATE TABLE public.payroll_runs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    pay_period TEXT NOT NULL,
    pay_date DATE NOT NULL,
    status public.payroll_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    published_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, pay_period)
);

-- Create recurring salary components table (template components)
CREATE TABLE public.salary_component_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    component_type public.salary_component_type NOT NULL,
    default_amount NUMERIC NOT NULL DEFAULT 0,
    is_percentage BOOLEAN NOT NULL DEFAULT false,
    percentage_of TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee fixed salary components (recurring components per employee)
CREATE TABLE public.employee_salary_components (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.salary_component_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    component_type public.salary_component_type NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    is_percentage BOOLEAN NOT NULL DEFAULT false,
    percentage_of TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create permissions matrix table
CREATE TABLE public.role_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    resource TEXT NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT false,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    can_approve BOOLEAN NOT NULL DEFAULT false,
    can_publish BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(firm_id, role, resource)
);

-- Create workflow history/audit table
CREATE TABLE public.payroll_workflow_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    from_status public.payroll_status,
    to_status public.payroll_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_component_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_workflow_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payroll_runs
CREATE POLICY "Firm users can view payroll runs" ON public.payroll_runs
FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE firm_id = get_user_firm_id(auth.uid()))
);

CREATE POLICY "Firm users can create payroll runs" ON public.payroll_runs
FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE firm_id = get_user_firm_id(auth.uid()))
);

CREATE POLICY "Firm users can update payroll runs" ON public.payroll_runs
FOR UPDATE USING (
    client_id IN (SELECT id FROM public.clients WHERE firm_id = get_user_firm_id(auth.uid()))
    AND status != 'published'
);

CREATE POLICY "Client users can view their payroll runs" ON public.payroll_runs
FOR SELECT USING (
    client_id = get_client_user_client_id(auth.uid())
);

-- RLS Policies for salary_component_templates
CREATE POLICY "Firm users can manage salary templates" ON public.salary_component_templates
FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE firm_id = get_user_firm_id(auth.uid()))
);

CREATE POLICY "Client users can view their salary templates" ON public.salary_component_templates
FOR SELECT USING (
    client_id = get_client_user_client_id(auth.uid())
);

-- RLS Policies for employee_salary_components
CREATE POLICY "Firm users can manage employee salary components" ON public.employee_salary_components
FOR ALL USING (
    employee_id IN (
        SELECT e.id FROM public.employees e
        JOIN public.clients c ON e.client_id = c.id
        WHERE c.firm_id = get_user_firm_id(auth.uid())
    )
);

CREATE POLICY "Client users can manage their employee salary components" ON public.employee_salary_components
FOR ALL USING (
    employee_id IN (
        SELECT id FROM public.employees WHERE client_id = get_client_user_client_id(auth.uid())
    )
);

CREATE POLICY "Employee users can view their own salary components" ON public.employee_salary_components
FOR SELECT USING (
    employee_id = get_employee_user_employee_id(auth.uid())
);

-- RLS Policies for role_permissions
CREATE POLICY "Firm users can view their role permissions" ON public.role_permissions
FOR SELECT USING (
    firm_id = get_user_firm_id(auth.uid())
);

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
FOR ALL USING (
    firm_id = get_user_firm_id(auth.uid()) 
    AND has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for payroll_workflow_history
CREATE POLICY "Firm users can view workflow history" ON public.payroll_workflow_history
FOR SELECT USING (
    payroll_run_id IN (
        SELECT pr.id FROM public.payroll_runs pr
        JOIN public.clients c ON pr.client_id = c.id
        WHERE c.firm_id = get_user_firm_id(auth.uid())
    )
);

CREATE POLICY "Firm users can insert workflow history" ON public.payroll_workflow_history
FOR INSERT WITH CHECK (
    payroll_run_id IN (
        SELECT pr.id FROM public.payroll_runs pr
        JOIN public.clients c ON pr.client_id = c.id
        WHERE c.firm_id = get_user_firm_id(auth.uid())
    )
);

-- Add triggers for updated_at
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_salary_component_templates_updated_at BEFORE UPDATE ON public.salary_component_templates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_employee_salary_components_updated_at BEFORE UPDATE ON public.employee_salary_components
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
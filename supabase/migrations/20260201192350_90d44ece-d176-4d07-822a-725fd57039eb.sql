-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- Create firms table
CREATE TABLE public.firms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (users linked to firms)
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create clients table (clients belong to a firm)
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    business_type TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    contact_person TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table (employees belong to a client)
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    employee_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    designation TEXT,
    department TEXT,
    date_of_joining DATE,
    bank_name TEXT,
    bank_account_number TEXT,
    pan_number TEXT,
    uan_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payslips table to store generated payslips
CREATE TABLE public.payslips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    payslip_number TEXT NOT NULL UNIQUE,
    pay_period TEXT NOT NULL,
    pay_date DATE NOT NULL,
    basic_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
    earnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    deductions JSONB NOT NULL DEFAULT '[]'::jsonb,
    gross_earnings DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    notes TEXT,
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Security definer function to get user's firm_id
CREATE OR REPLACE FUNCTION public.get_user_firm_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT firm_id
    FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- RLS Policies for firms
CREATE POLICY "Users can view their own firm"
ON public.firms FOR SELECT
USING (id = public.get_user_firm_id(auth.uid()));

CREATE POLICY "Super admins can update their firm"
ON public.firms FOR UPDATE
USING (id = public.get_user_firm_id(auth.uid()) AND public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their firm"
ON public.profiles FOR SELECT
USING (firm_id = public.get_user_firm_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Super admins can insert profiles for their firm"
ON public.profiles FOR INSERT
WITH CHECK (firm_id = public.get_user_firm_id(auth.uid()) AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete profiles in their firm"
ON public.profiles FOR DELETE
USING (firm_id = public.get_user_firm_id(auth.uid()) AND public.has_role(auth.uid(), 'super_admin') AND user_id != auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their firm"
ON public.user_roles FOR SELECT
USING (
    user_id IN (
        SELECT p.user_id FROM public.profiles p 
        WHERE p.firm_id = public.get_user_firm_id(auth.uid())
    )
);

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for clients
CREATE POLICY "Users can view clients in their firm"
ON public.clients FOR SELECT
USING (firm_id = public.get_user_firm_id(auth.uid()));

CREATE POLICY "Admins can insert clients"
ON public.clients FOR INSERT
WITH CHECK (
    firm_id = public.get_user_firm_id(auth.uid()) 
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can update clients"
ON public.clients FOR UPDATE
USING (
    firm_id = public.get_user_firm_id(auth.uid()) 
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Super admins can delete clients"
ON public.clients FOR DELETE
USING (firm_id = public.get_user_firm_id(auth.uid()) AND public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for employees
CREATE POLICY "Users can view employees of their firm's clients"
ON public.employees FOR SELECT
USING (
    client_id IN (
        SELECT c.id FROM public.clients c 
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
);

CREATE POLICY "Admins can insert employees"
ON public.employees FOR INSERT
WITH CHECK (
    client_id IN (
        SELECT c.id FROM public.clients c 
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can update employees"
ON public.employees FOR UPDATE
USING (
    client_id IN (
        SELECT c.id FROM public.clients c 
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Super admins can delete employees"
ON public.employees FOR DELETE
USING (
    client_id IN (
        SELECT c.id FROM public.clients c 
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
    AND public.has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for payslips
CREATE POLICY "Users can view payslips of their firm's clients' employees"
ON public.payslips FOR SELECT
USING (
    employee_id IN (
        SELECT e.id FROM public.employees e
        JOIN public.clients c ON e.client_id = c.id
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
);

CREATE POLICY "Users can insert payslips"
ON public.payslips FOR INSERT
WITH CHECK (
    employee_id IN (
        SELECT e.id FROM public.employees e
        JOIN public.clients c ON e.client_id = c.id
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
);

CREATE POLICY "Admins can update payslips"
ON public.payslips FOR UPDATE
USING (
    employee_id IN (
        SELECT e.id FROM public.employees e
        JOIN public.clients c ON e.client_id = c.id
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Super admins can delete payslips"
ON public.payslips FOR DELETE
USING (
    employee_id IN (
        SELECT e.id FROM public.employees e
        JOIN public.clients c ON e.client_id = c.id
        WHERE c.firm_id = public.get_user_firm_id(auth.uid())
    )
    AND public.has_role(auth.uid(), 'super_admin')
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_firms_updated_at
    BEFORE UPDATE ON public.firms
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payslips_updated_at
    BEFORE UPDATE ON public.payslips
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_profiles_firm_id ON public.profiles(firm_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_clients_firm_id ON public.clients(firm_id);
CREATE INDEX idx_employees_client_id ON public.employees(client_id);
CREATE INDEX idx_payslips_employee_id ON public.payslips(employee_id);
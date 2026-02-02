-- First create the update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create tables for client and employee portal authentication

-- Table for client portal users (linked to clients table)
CREATE TABLE public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(client_id, email)
);

-- Table for employee portal users (linked to employees table)
CREATE TABLE public.employee_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(employee_id)
);

-- Table for invitations
CREATE TYPE public.invite_type AS ENUM ('client', 'employee');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_type invite_type NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status invite_status NOT NULL DEFAULT 'pending',
  full_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_invite CHECK (
    (invite_type = 'client' AND client_id IS NOT NULL AND employee_id IS NULL) OR
    (invite_type = 'employee' AND employee_id IS NOT NULL AND client_id IS NULL)
  )
);

-- Enable RLS
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_client_users_client_id ON public.client_users(client_id);
CREATE INDEX idx_client_users_user_id ON public.client_users(user_id);
CREATE INDEX idx_employee_users_employee_id ON public.employee_users(employee_id);
CREATE INDEX idx_employee_users_user_id ON public.employee_users(user_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- Helper function to get client_id for a client portal user
CREATE OR REPLACE FUNCTION public.get_client_user_client_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.client_users WHERE user_id = _user_id AND is_active = true LIMIT 1
$$;

-- Helper function to get employee_id for an employee portal user
CREATE OR REPLACE FUNCTION public.get_employee_user_employee_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT employee_id FROM public.employee_users WHERE user_id = _user_id AND is_active = true LIMIT 1
$$;

-- Helper function to check if user is a client portal user
CREATE OR REPLACE FUNCTION public.is_client_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.client_users WHERE user_id = _user_id AND is_active = true)
$$;

-- Helper function to check if user is an employee portal user
CREATE OR REPLACE FUNCTION public.is_employee_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.employee_users WHERE user_id = _user_id AND is_active = true)
$$;

-- RLS Policies for client_users
CREATE POLICY "Firm users can view client users of their clients"
  ON public.client_users FOR SELECT
  USING (
    client_id IN (SELECT id FROM public.clients WHERE firm_id = get_user_firm_id(auth.uid()))
  );

CREATE POLICY "Firm admins can manage client users"
  ON public.client_users FOR ALL
  USING (
    client_id IN (SELECT id FROM public.clients WHERE firm_id = get_user_firm_id(auth.uid()))
    AND (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Client users can view themselves"
  ON public.client_users FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for employee_users
CREATE POLICY "Firm users can view employee users"
  ON public.employee_users FOR SELECT
  USING (
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.clients c ON e.client_id = c.id
      WHERE c.firm_id = get_user_firm_id(auth.uid())
    )
  );

CREATE POLICY "Firm admins can manage employee users"
  ON public.employee_users FOR ALL
  USING (
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.clients c ON e.client_id = c.id
      WHERE c.firm_id = get_user_firm_id(auth.uid())
    )
    AND (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Client users can manage their employees users"
  ON public.employee_users FOR ALL
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE client_id = get_client_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Employee users can view themselves"
  ON public.employee_users FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for invitations
CREATE POLICY "Firm users can view invitations they created"
  ON public.invitations FOR SELECT
  USING (invited_by = auth.uid() OR get_user_firm_id(auth.uid()) IS NOT NULL);

CREATE POLICY "Firm admins can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'))
    OR is_client_user(auth.uid())
  );

CREATE POLICY "Firm admins can update invitations"
  ON public.invitations FOR UPDATE
  USING (
    invited_by = auth.uid() 
    OR (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'))
    OR is_client_user(auth.uid())
  );

-- Update triggers
CREATE TRIGGER update_client_users_updated_at
  BEFORE UPDATE ON public.client_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employee_users_updated_at
  BEFORE UPDATE ON public.employee_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Allow employees table to be viewed by employee portal users (their own record)
CREATE POLICY "Employee users can view their own employee record"
  ON public.employees FOR SELECT
  USING (id = get_employee_user_employee_id(auth.uid()));

-- Allow payslips to be viewed by employee portal users (their own payslips)
CREATE POLICY "Employee users can view their own payslips"
  ON public.payslips FOR SELECT
  USING (employee_id = get_employee_user_employee_id(auth.uid()));

-- Allow client portal users to view their client's employees
CREATE POLICY "Client users can view their employees"
  ON public.employees FOR SELECT
  USING (client_id = get_client_user_client_id(auth.uid()));

-- Allow client portal users to view payslips of their employees
CREATE POLICY "Client users can view their employees payslips"
  ON public.payslips FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE client_id = get_client_user_client_id(auth.uid())
    )
  );

-- Allow client portal users to view their client record
CREATE POLICY "Client users can view their own client"
  ON public.clients FOR SELECT
  USING (id = get_client_user_client_id(auth.uid()));
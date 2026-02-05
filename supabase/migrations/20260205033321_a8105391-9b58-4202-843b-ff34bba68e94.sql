-- Add new role values to the existing enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'preparer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'approver_l1';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'approver_l2';
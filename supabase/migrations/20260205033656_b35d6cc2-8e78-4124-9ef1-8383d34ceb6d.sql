-- Add 'firm_user' invite type to support inviting firm users
ALTER TYPE public.invite_type ADD VALUE IF NOT EXISTS 'firm_user';
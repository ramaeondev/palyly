-- Fix function search_path for handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create a signup handler function that creates firm, profile, and role
-- This runs with elevated privileges to bypass RLS during signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_firm_id UUID;
    firm_name_val TEXT;
    user_name_val TEXT;
BEGIN
    -- Extract metadata from the new user
    firm_name_val := COALESCE(NEW.raw_user_meta_data->>'firm_name', 'My Firm');
    user_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    
    -- Create the firm
    INSERT INTO public.firms (name)
    VALUES (firm_name_val)
    RETURNING id INTO new_firm_id;
    
    -- Create the profile
    INSERT INTO public.profiles (user_id, firm_id, full_name, email)
    VALUES (NEW.id, new_firm_id, user_name_val, NEW.email);
    
    -- Assign super_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();
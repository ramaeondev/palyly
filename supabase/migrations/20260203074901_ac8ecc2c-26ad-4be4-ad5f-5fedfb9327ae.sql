-- Add custom_fields JSONB column to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '[]'::jsonb;

-- Add custom_fields JSONB column to employees table  
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '[]'::jsonb;

-- Add avatar_url to employees table for profile pictures
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage buckets for logos and profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('firm-logos', 'firm-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('client-logos', 'client-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('employee-avatars', 'employee-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for firm-logos bucket
CREATE POLICY "Firm users can upload their firm logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'firm-logos' 
  AND (storage.foldername(name))[1] = get_user_firm_id(auth.uid())::text
);

CREATE POLICY "Firm users can update their firm logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'firm-logos' 
  AND (storage.foldername(name))[1] = get_user_firm_id(auth.uid())::text
);

CREATE POLICY "Firm users can delete their firm logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'firm-logos' 
  AND (storage.foldername(name))[1] = get_user_firm_id(auth.uid())::text
);

CREATE POLICY "Firm logos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'firm-logos');

-- Storage policies for client-logos bucket
CREATE POLICY "Firm users can upload client logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-logos'
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id::text = (storage.foldername(name))[1]
    AND c.firm_id = get_user_firm_id(auth.uid())
  )
);

CREATE POLICY "Client users can upload their own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-logos'
  AND (storage.foldername(name))[1] = get_client_user_client_id(auth.uid())::text
);

CREATE POLICY "Firm users can update client logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-logos'
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id::text = (storage.foldername(name))[1]
    AND c.firm_id = get_user_firm_id(auth.uid())
  )
);

CREATE POLICY "Client users can update their own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-logos'
  AND (storage.foldername(name))[1] = get_client_user_client_id(auth.uid())::text
);

CREATE POLICY "Firm users can delete client logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-logos'
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.id::text = (storage.foldername(name))[1]
    AND c.firm_id = get_user_firm_id(auth.uid())
  )
);

CREATE POLICY "Client logos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'client-logos');

-- Storage policies for employee-avatars bucket
CREATE POLICY "Firm users can upload employee avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND EXISTS (
    SELECT 1 FROM employees e
    JOIN clients c ON e.client_id = c.id
    WHERE e.id::text = (storage.foldername(name))[1]
    AND c.firm_id = get_user_firm_id(auth.uid())
  )
);

CREATE POLICY "Client users can upload their employee avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id::text = (storage.foldername(name))[1]
    AND e.client_id = get_client_user_client_id(auth.uid())
  )
);

CREATE POLICY "Employees can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND (storage.foldername(name))[1] = get_employee_user_employee_id(auth.uid())::text
);

CREATE POLICY "Firm users can update employee avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND EXISTS (
    SELECT 1 FROM employees e
    JOIN clients c ON e.client_id = c.id
    WHERE e.id::text = (storage.foldername(name))[1]
    AND c.firm_id = get_user_firm_id(auth.uid())
  )
);

CREATE POLICY "Client users can update their employee avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id::text = (storage.foldername(name))[1]
    AND e.client_id = get_client_user_client_id(auth.uid())
  )
);

CREATE POLICY "Employees can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND (storage.foldername(name))[1] = get_employee_user_employee_id(auth.uid())::text
);

CREATE POLICY "Firm users can delete employee avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND EXISTS (
    SELECT 1 FROM employees e
    JOIN clients c ON e.client_id = c.id
    WHERE e.id::text = (storage.foldername(name))[1]
    AND c.firm_id = get_user_firm_id(auth.uid())
  )
);

CREATE POLICY "Employee avatars are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-avatars');

-- Add unique constraint on email within firm for clients
CREATE UNIQUE INDEX IF NOT EXISTS clients_firm_email_unique 
ON public.clients (firm_id, email) 
WHERE email IS NOT NULL;

-- Add unique constraint on email within client for employees
CREATE UNIQUE INDEX IF NOT EXISTS employees_client_email_unique 
ON public.employees (client_id, email) 
WHERE email IS NOT NULL;
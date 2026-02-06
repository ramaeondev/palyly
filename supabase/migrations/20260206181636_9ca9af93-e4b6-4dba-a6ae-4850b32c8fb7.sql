
-- Allow client users to update their own client's selected_template_id
CREATE POLICY "Client users can update their template selection"
  ON public.clients FOR UPDATE
  USING (id = get_client_user_client_id(auth.uid()))
  WITH CHECK (id = get_client_user_client_id(auth.uid()));

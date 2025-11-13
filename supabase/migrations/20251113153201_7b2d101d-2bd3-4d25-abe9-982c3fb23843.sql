-- Arreglar función para tener search_path seguro
CREATE OR REPLACE FUNCTION update_email_drafts_updated_at()
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
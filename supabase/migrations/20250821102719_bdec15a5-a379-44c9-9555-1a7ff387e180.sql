-- Fix the function security issue by setting search_path
DROP FUNCTION IF EXISTS public.update_blog_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_blog_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
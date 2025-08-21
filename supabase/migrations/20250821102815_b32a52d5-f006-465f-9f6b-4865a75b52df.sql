-- Drop triggers first, then function, then recreate with proper security
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON public.blog_categories;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
DROP FUNCTION IF EXISTS public.update_blog_updated_at_column();

-- Recreate function with proper security definer settings
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

-- Recreate triggers
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at_column();
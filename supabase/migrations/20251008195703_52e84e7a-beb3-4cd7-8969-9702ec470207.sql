-- Drop existing broken function
DROP FUNCTION IF EXISTS public.trigger_sitemap_rebuild() CASCADE;

-- Recreate with correct namespace (net.http_post, not extensions.http_post)
CREATE OR REPLACE FUNCTION public.trigger_sitemap_rebuild()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public', 'net', 'extensions'
AS $$
BEGIN
  -- Call edge function using net.http_post (the correct namespace for pg_net)
  PERFORM net.http_post(
    url := 'https://qvrvcvmoudxchipvzksh.supabase.co/functions/v1/rebuild-sitemaps',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnZjdm1vdWR4Y2hpcHZ6a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIyMzksImV4cCI6MjA2ODE4ODIzOX0.4EPE_-5OsZGC10Jeg90q4um8Rdsc1-hXoy5S_gPhl6Q',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'trigger_time', now(),
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP
    )
  );
  
  RETURN NEW;
END;
$$;

-- Recreate triggers on qa_articles
DROP TRIGGER IF EXISTS qa_articles_sitemap_rebuild ON public.qa_articles;
CREATE TRIGGER qa_articles_sitemap_rebuild
  AFTER INSERT OR UPDATE OF title, slug, content, publish_status, updated_at
  ON public.qa_articles
  FOR EACH ROW
  WHEN (NEW.publish_status = 'published')
  EXECUTE FUNCTION public.trigger_sitemap_rebuild();

-- Recreate triggers on blog_posts
DROP TRIGGER IF EXISTS blog_posts_sitemap_rebuild ON public.blog_posts;
CREATE TRIGGER blog_posts_sitemap_rebuild
  AFTER INSERT OR UPDATE OF title, slug, content, status, updated_at
  ON public.blog_posts
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION public.trigger_sitemap_rebuild();

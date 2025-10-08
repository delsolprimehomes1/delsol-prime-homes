-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger sitemap rebuild via edge function
CREATE OR REPLACE FUNCTION trigger_sitemap_rebuild()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to rebuild sitemaps (async, fire-and-forget)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for QA articles (only when published)
DROP TRIGGER IF EXISTS qa_articles_sitemap_trigger ON qa_articles;
CREATE TRIGGER qa_articles_sitemap_trigger
AFTER INSERT OR UPDATE ON qa_articles
FOR EACH ROW
WHEN (NEW.published = true)
EXECUTE FUNCTION trigger_sitemap_rebuild();

-- Trigger for blog posts (only when published)
DROP TRIGGER IF EXISTS blog_posts_sitemap_trigger ON blog_posts;
CREATE TRIGGER blog_posts_sitemap_trigger
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION trigger_sitemap_rebuild();
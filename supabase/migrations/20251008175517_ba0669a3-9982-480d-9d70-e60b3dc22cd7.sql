-- Fix security warning: Set search_path on trigger function
CREATE OR REPLACE FUNCTION trigger_sitemap_rebuild()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, extensions
AS $$
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
$$;
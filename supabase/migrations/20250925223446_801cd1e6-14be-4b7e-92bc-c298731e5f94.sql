-- Fix security warnings from duplicate cleanup migration

-- Fix 1: Update function to have immutable search_path
CREATE OR REPLACE FUNCTION check_duplicate_title()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a very similar title already exists
  IF EXISTS (
    SELECT 1 FROM qa_articles 
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND language = NEW.language
    AND similarity(
      LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g'))),
      LOWER(TRIM(regexp_replace(NEW.title, '[^\w\s]', '', 'g')))
    ) > 0.9
  ) THEN
    RAISE WARNING 'Potential duplicate title detected: %', NEW.title;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp;

-- Fix 2: Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
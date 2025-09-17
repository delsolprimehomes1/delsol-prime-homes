-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION public.link_multilingual_articles(
  english_id UUID,
  translation_ids UUID[]
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Set the English version as parent for all translations
  UPDATE public.qa_articles 
  SET parent_id = english_id 
  WHERE id = ANY(translation_ids);
  
  -- Ensure English version has no parent (it is the parent)
  UPDATE public.qa_articles 
  SET parent_id = NULL 
  WHERE id = english_id;
END;
$$;
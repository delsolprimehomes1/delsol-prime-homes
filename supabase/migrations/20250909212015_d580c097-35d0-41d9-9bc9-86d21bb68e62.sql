-- Fix security warnings: Set search_path for functions to prevent search path mutable warnings

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS public.increment_faq_view_count(text);
DROP FUNCTION IF EXISTS public.get_related_faqs(uuid, text, integer);

-- Function to update FAQ view count (with fixed search_path)
CREATE OR REPLACE FUNCTION public.increment_faq_view_count(faq_slug text)
RETURNS void AS $$
BEGIN
  -- Increment view count in faqs table
  UPDATE public.faqs 
  SET view_count = view_count + 1 
  WHERE slug = faq_slug;
  
  -- Insert or update analytics record
  INSERT INTO public.faq_analytics (faq_id, date, views)
  SELECT id, CURRENT_DATE, 1
  FROM public.faqs 
  WHERE slug = faq_slug
  ON CONFLICT (faq_id, date) 
  DO UPDATE SET views = faq_analytics.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get related FAQs based on category and funnel stage (with fixed search_path)
CREATE OR REPLACE FUNCTION public.get_related_faqs(
  current_faq_id uuid,
  current_language text DEFAULT 'en',
  limit_count integer DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  slug text,
  question text,
  answer_short text,
  funnel_stage text,
  category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.slug, f.question, f.answer_short, f.funnel_stage, f.category
  FROM public.faqs f
  WHERE f.id != current_faq_id
    AND f.language = current_language
    AND (
      -- Same category, different funnel stage
      (f.category = (SELECT category FROM public.faqs WHERE public.faqs.id = current_faq_id))
      OR
      -- Same funnel stage, different category
      (f.funnel_stage = (SELECT funnel_stage FROM public.faqs WHERE public.faqs.id = current_faq_id))
    )
  ORDER BY f.view_count DESC, f.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Fix the ambiguous column reference in get_related_faqs function
CREATE OR REPLACE FUNCTION public.get_related_faqs(current_faq_id uuid, current_language text DEFAULT 'en'::text, limit_count integer DEFAULT 3)
 RETURNS TABLE(id uuid, slug text, question text, answer_short text, funnel_stage text, category text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT f.id, f.slug, f.question, f.answer_short, f.funnel_stage, f.category
  FROM public.faqs f
  WHERE f.id != current_faq_id
    AND f.language = current_language
    AND (
      -- Same category, different funnel stage
      (f.category = (SELECT faqs.category FROM public.faqs WHERE faqs.id = current_faq_id))
      OR
      -- Same funnel stage, different category  
      (f.funnel_stage = (SELECT faqs.funnel_stage FROM public.faqs WHERE faqs.id = current_faq_id))
    )
  ORDER BY f.view_count DESC, f.created_at DESC
  LIMIT limit_count;
END;
$function$

-- Add sample internal links for TOFU questions to complete the funnel
UPDATE public.faqs 
SET internal_links = '{
  "mofu": {
    "text": "Compare the best remote working areas on the Costa del Sol",
    "url": "/qa/best-areas-remote-working-expats-costa-del-sol"
  }
}'::jsonb
WHERE slug = 'average-property-price-costa-del-sol' AND language = 'en';

UPDATE public.faqs 
SET internal_links = '{
  "mofu": {
    "text": "Discover which Costa del Sol areas work best for remote professionals", 
    "url": "/qa/best-areas-remote-working-expats-costa-del-sol"
  }
}'::jsonb
WHERE slug = 'golden-visa-spain-program' AND language = 'en';

UPDATE public.faqs 
SET internal_links = '{
  "mofu": {
    "text": "Learn about setting up reliable internet for remote work",
    "url": "/qa/set-up-reliable-home-network-costa-del-sol" 
  }
}'::jsonb
WHERE slug = 'spanish-property-buying-timeline' AND language = 'en';
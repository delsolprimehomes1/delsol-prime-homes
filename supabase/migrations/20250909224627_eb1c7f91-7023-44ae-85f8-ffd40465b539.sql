-- Drop all FAQ-related database functions first
DROP FUNCTION IF EXISTS public.increment_faq_view_count(text);
DROP FUNCTION IF EXISTS public.get_related_faqs(uuid, text, integer);

-- Drop all FAQ-related tables
DROP TABLE IF EXISTS public.faq_relations CASCADE;
DROP TABLE IF EXISTS public.faq_category_enhancements CASCADE;
DROP TABLE IF EXISTS public.faq_analytics CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.faq_categories CASCADE;
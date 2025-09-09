-- Phase 1: Enhance existing faqs table and add new tables for SEO/AEO system

-- Add new columns to existing faqs table for enhanced functionality
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS funnel_stage text CHECK (funnel_stage IN ('TOFU', 'MOFU', 'BOFU'));
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS author_url text;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS reviewed_at date DEFAULT CURRENT_DATE;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS related_faqs uuid[];
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS is_speakable boolean DEFAULT true;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS internal_links jsonb;

-- Create authors table for expert attribution
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text,
  bio text,
  profile_url text,
  avatar_url text,
  expertise_areas text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create FAQ analytics table for tracking engagement
CREATE TABLE IF NOT EXISTS public.faq_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faq_id uuid REFERENCES public.faqs(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views integer DEFAULT 0,
  time_spent integer DEFAULT 0, -- in seconds
  clicks_to_detail integer DEFAULT 0,
  funnel_conversions integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(faq_id, date)
);

-- Create FAQ categories enhancement table (extends existing categories)
CREATE TABLE IF NOT EXISTS public.faq_category_enhancements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key text NOT NULL,
  language text NOT NULL,
  seo_title text,
  seo_description text,
  hero_text text,
  speakable_intro text,
  funnel_description jsonb, -- {TOFU: "...", MOFU: "...", BOFU: "..."}
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_key, language)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_faqs_funnel_stage ON public.faqs(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_faqs_language_category ON public.faqs(language, category);
CREATE INDEX IF NOT EXISTS idx_faqs_view_count ON public.faqs(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_faq_analytics_date ON public.faq_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_faq_analytics_faq_id ON public.faq_analytics(faq_id);

-- Enable RLS on new tables
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_category_enhancements ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "Anyone can view authors" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Anyone can view FAQ analytics" ON public.faq_analytics FOR SELECT USING (true);
CREATE POLICY "Anyone can view FAQ category enhancements" ON public.faq_category_enhancements FOR SELECT USING (true);

-- Insert sample authors
INSERT INTO public.authors (name, title, expertise_areas) VALUES 
('Sarah Mitchell', 'Senior Property Consultant', ARRAY['luxury properties', 'investment guidance', 'Costa del Sol market']),
('Marcus Rodriguez', 'Legal & Finance Specialist', ARRAY['property law', 'financing', 'tax optimization']),
('Elena Fernandez', 'Lifestyle & Relocation Expert', ARRAY['expat services', 'remote working', 'Spanish residency'])
ON CONFLICT DO NOTHING;

-- Function to update FAQ view count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related FAQs based on category and funnel stage
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
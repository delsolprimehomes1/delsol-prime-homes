-- Add enhanced CTA management fields for BOFU articles
CREATE TYPE cta_type AS ENUM ('booking', 'consultation', 'download', 'newsletter', 'custom');

-- Add new columns to qa_articles table
ALTER TABLE public.qa_articles 
ADD COLUMN final_cta_type cta_type DEFAULT 'booking',
ADD COLUMN final_cta_url text,
ADD COLUMN linking_notes text,
ADD COLUMN last_linked_by uuid,
ADD COLUMN last_linked_at timestamp with time zone DEFAULT now();

-- Add index for better performance on CTA queries
CREATE INDEX idx_qa_articles_cta_type ON public.qa_articles(final_cta_type);
CREATE INDEX idx_qa_articles_funnel_topic ON public.qa_articles(funnel_stage, topic);

-- Update existing BOFU articles to have proper CTA type
UPDATE public.qa_articles 
SET final_cta_type = 'booking'
WHERE funnel_stage = 'BOFU' AND appointment_booking_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN public.qa_articles.final_cta_type IS 'Type of final call-to-action for BOFU articles';
COMMENT ON COLUMN public.qa_articles.final_cta_url IS 'Custom URL for CTA when type is custom';
COMMENT ON COLUMN public.qa_articles.linking_notes IS 'Manual notes about funnel linking decisions';
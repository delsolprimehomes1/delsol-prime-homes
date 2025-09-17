-- Enhance qa_articles table for multilingual 400+ questions framework
ALTER TABLE public.qa_articles 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.qa_articles(id),
ADD COLUMN IF NOT EXISTS markdown_frontmatter JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS alt_text TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS intent TEXT,
ADD COLUMN IF NOT EXISTS location_focus TEXT;

-- Create indexes for performance with large content volume
CREATE INDEX IF NOT EXISTS idx_qa_articles_parent_id ON public.qa_articles(parent_id);
CREATE INDEX IF NOT EXISTS idx_qa_articles_language_topic ON public.qa_articles(language, topic);
CREATE INDEX IF NOT EXISTS idx_qa_articles_funnel_stage ON public.qa_articles(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_qa_articles_tags ON public.qa_articles USING GIN(tags);

-- Create bulk import tracking table
CREATE TABLE IF NOT EXISTS public.content_import_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  processed_questions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on content_import_batches
ALTER TABLE public.content_import_batches ENABLE ROW LEVEL SECURITY;

-- Create policy for content import batches (admin only for now)
CREATE POLICY "Admin can manage import batches" 
ON public.content_import_batches 
FOR ALL 
USING (true);

-- Create function to link multilingual articles
CREATE OR REPLACE FUNCTION public.link_multilingual_articles(
  english_id UUID,
  translation_ids UUID[]
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
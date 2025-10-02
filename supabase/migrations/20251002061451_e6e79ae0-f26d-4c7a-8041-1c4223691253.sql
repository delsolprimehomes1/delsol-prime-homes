-- Create internal_links table for tracking internal link suggestions
CREATE TABLE IF NOT EXISTS public.internal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_article_id UUID NOT NULL,
  source_article_type TEXT NOT NULL CHECK (source_article_type IN ('blog', 'qa')),
  target_article_id UUID NOT NULL,
  target_article_type TEXT NOT NULL CHECK (target_article_type IN ('blog', 'qa')),
  anchor_text TEXT NOT NULL,
  context_snippet TEXT,
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  position_in_text INTEGER,
  verified BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create link_generation_batches table for tracking bulk operations
CREATE TABLE IF NOT EXISTS public.link_generation_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL,
  total_articles INTEGER DEFAULT 0,
  processed_articles INTEGER DEFAULT 0,
  successful_links INTEGER DEFAULT 0,
  failed_articles INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  link_type TEXT NOT NULL CHECK (link_type IN ('external', 'internal', 'both')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_generation_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for internal_links
CREATE POLICY "Allow content management for internal_links"
  ON public.internal_links
  FOR ALL
  USING (true);

CREATE POLICY "Anyone can view approved internal links"
  ON public.internal_links
  FOR SELECT
  USING (verified = true);

-- RLS Policies for link_generation_batches
CREATE POLICY "Allow content management for link_generation_batches"
  ON public.link_generation_batches
  FOR ALL
  USING (true);

CREATE POLICY "Anyone can view link generation batches"
  ON public.link_generation_batches
  FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internal_links_source ON public.internal_links(source_article_id, source_article_type);
CREATE INDEX IF NOT EXISTS idx_internal_links_target ON public.internal_links(target_article_id, target_article_type);
CREATE INDEX IF NOT EXISTS idx_internal_links_verified ON public.internal_links(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_link_batches_status ON public.link_generation_batches(status);

-- Add trigger for updated_at
CREATE TRIGGER update_internal_links_updated_at
  BEFORE UPDATE ON public.internal_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
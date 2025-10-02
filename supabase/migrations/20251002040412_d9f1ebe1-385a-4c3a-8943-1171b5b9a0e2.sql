-- Create external_links table for AI-powered link management
CREATE TABLE IF NOT EXISTS public.external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  article_type TEXT NOT NULL CHECK (article_type IN ('qa', 'blog')),
  url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  context_snippet TEXT,
  authority_score INTEGER CHECK (authority_score BETWEEN 1 AND 100),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 100),
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence BETWEEN 0.00 AND 1.00),
  position_in_text INTEGER,
  insertion_method TEXT DEFAULT 'ai_generated',
  verified BOOLEAN DEFAULT FALSE,
  rejected BOOLEAN DEFAULT FALSE,
  rejected_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;

-- Create policies for external links management
CREATE POLICY "Allow content management for external_links"
  ON public.external_links
  FOR ALL
  USING (true);

CREATE POLICY "Anyone can view approved external links"
  ON public.external_links
  FOR SELECT
  USING (verified = true);

-- Create indexes for performance
CREATE INDEX idx_external_links_article_id ON public.external_links(article_id);
CREATE INDEX idx_external_links_verified ON public.external_links(verified);
CREATE INDEX idx_external_links_article_type ON public.external_links(article_type);
CREATE INDEX idx_external_links_created_at ON public.external_links(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_external_links_updated_at
  BEFORE UPDATE ON public.external_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
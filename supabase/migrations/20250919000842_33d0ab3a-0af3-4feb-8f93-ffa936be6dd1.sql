-- Add indexes for better AI optimization query performance
CREATE INDEX IF NOT EXISTS idx_qa_articles_content_length ON qa_articles USING btree ((length(content)));
CREATE INDEX IF NOT EXISTS idx_qa_articles_ai_optimization ON qa_articles USING btree (target_audience, location_focus, language);
CREATE INDEX IF NOT EXISTS idx_qa_articles_tags_gin ON qa_articles USING gin (tags);

-- Update articles with missing target_audience based on funnel_stage and topic
UPDATE qa_articles 
SET target_audience = CASE 
  WHEN funnel_stage = 'TOFU' AND topic ILIKE '%investment%' THEN 'International Property Investors'
  WHEN funnel_stage = 'TOFU' AND topic ILIKE '%lifestyle%' THEN 'Expatriate Families'
  WHEN funnel_stage = 'MOFU' AND topic ILIKE '%legal%' THEN 'International Property Buyers'
  WHEN funnel_stage = 'BOFU' THEN 'Ready Property Purchasers'
  ELSE 'International Property Buyers'
END
WHERE target_audience IS NULL OR target_audience = '';

-- Update articles with missing location_focus based on content analysis
UPDATE qa_articles 
SET location_focus = CASE 
  WHEN content ILIKE '%marbella%' THEN 'Marbella'
  WHEN content ILIKE '%estepona%' THEN 'Estepona'
  WHEN content ILIKE '%fuengirola%' THEN 'Fuengirola'
  WHEN content ILIKE '%benalmadena%' THEN 'Benalmádena'
  WHEN content ILIKE '%torremolinos%' THEN 'Torremolinos'
  WHEN content ILIKE '%nerja%' THEN 'Nerja'
  ELSE 'Costa del Sol'
END
WHERE location_focus IS NULL OR location_focus = '';

-- Add intent field for better AI targeting if it doesn't exist
ALTER TABLE qa_articles ADD COLUMN IF NOT EXISTS ai_optimization_score INTEGER DEFAULT 0;
ALTER TABLE qa_articles ADD COLUMN IF NOT EXISTS voice_search_ready BOOLEAN DEFAULT false;
ALTER TABLE qa_articles ADD COLUMN IF NOT EXISTS citation_ready BOOLEAN DEFAULT false;
ALTER TABLE qa_articles ADD COLUMN IF NOT EXISTS multilingual_parent_id UUID REFERENCES qa_articles(id);

-- Create multilingual content mapping table
CREATE TABLE IF NOT EXISTS qa_article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_article_id UUID REFERENCES qa_articles(id) NOT NULL,
  target_language TEXT NOT NULL,
  translated_title TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  translated_excerpt TEXT NOT NULL,
  translation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_article_id, target_language)
);

-- Enable RLS on translations table
ALTER TABLE qa_article_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations table
CREATE POLICY "Translations are viewable by everyone" 
ON qa_article_translations FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage translations" 
ON qa_article_translations FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update translations" 
ON qa_article_translations FOR UPDATE USING (true);
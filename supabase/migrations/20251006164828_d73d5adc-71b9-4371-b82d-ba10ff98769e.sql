-- Phase 1: Enhance Image Metadata Storage
-- Add AI-specific metadata fields to image_metadata table

ALTER TABLE image_metadata 
ADD COLUMN IF NOT EXISTS ai_citability_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visual_accessibility_ready BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS context_relevance TEXT,
ADD COLUMN IF NOT EXISTS embedded_exif_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS canonical_image_url TEXT,
ADD COLUMN IF NOT EXISTS seo_optimized BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_ai_citability 
  ON image_metadata(ai_citability_score DESC);
  
CREATE INDEX IF NOT EXISTS idx_image_article 
  ON image_metadata(article_id, article_type);

CREATE INDEX IF NOT EXISTS idx_image_embedded_status
  ON image_metadata(embedded_exif_status) WHERE embedded_exif_status = 'embedded';

-- Add comments for documentation
COMMENT ON COLUMN image_metadata.ai_citability_score IS 'Score 0-100 indicating how suitable this image is for AI citation';
COMMENT ON COLUMN image_metadata.visual_accessibility_ready IS 'Whether image has complete accessibility metadata';
COMMENT ON COLUMN image_metadata.context_relevance IS 'AI-generated context about how image relates to article content';
COMMENT ON COLUMN image_metadata.embedded_exif_status IS 'Status of EXIF embedding: pending, embedded, failed';
COMMENT ON COLUMN image_metadata.canonical_image_url IS 'Canonical URL for AI citation purposes';
COMMENT ON COLUMN image_metadata.seo_optimized IS 'Whether image metadata is fully optimized for SEO';
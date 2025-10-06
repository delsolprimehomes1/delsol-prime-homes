-- Add scheduling fields to qa_clusters
ALTER TABLE qa_clusters 
ADD COLUMN scheduled_publish_at TIMESTAMPTZ,
ADD COLUMN publish_status TEXT DEFAULT 'draft' 
  CHECK (publish_status IN ('draft', 'scheduled', 'published')),
ADD COLUMN auto_published_at TIMESTAMPTZ;

-- Add scheduling fields to qa_articles  
ALTER TABLE qa_articles
ADD COLUMN scheduled_publish_at TIMESTAMPTZ,
ADD COLUMN publish_status TEXT DEFAULT 'draft' 
  CHECK (publish_status IN ('draft', 'scheduled', 'published')),
ADD COLUMN auto_published_at TIMESTAMPTZ;

-- Performance indexes for scheduled content queries
CREATE INDEX idx_qa_clusters_scheduled 
  ON qa_clusters(scheduled_publish_at, publish_status) 
  WHERE publish_status = 'scheduled';

CREATE INDEX idx_qa_articles_scheduled 
  ON qa_articles(scheduled_publish_at, publish_status) 
  WHERE publish_status = 'scheduled';

-- Set existing content to 'published' status
UPDATE qa_clusters SET publish_status = 'published' WHERE publish_status IS NULL OR publish_status = 'draft';
UPDATE qa_articles SET publish_status = 'published' WHERE publish_status IS NULL OR publish_status = 'draft';
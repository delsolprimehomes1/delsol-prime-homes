-- Create image_metadata table with localized fields and EXIF geolocation
CREATE TABLE public.image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT UNIQUE NOT NULL,
  article_id UUID,
  article_type TEXT CHECK (article_type IN ('qa', 'blog')),
  
  -- Localized metadata (multilingual support)
  alt_text JSONB NOT NULL DEFAULT '{}'::jsonb,
  caption JSONB DEFAULT '{}'::jsonb,
  
  -- SEO metadata
  title TEXT,
  description TEXT,
  
  -- EXIF Geolocation (embedded in image file)
  exif_latitude DECIMAL(9,6),
  exif_longitude DECIMAL(9,6),
  exif_location_name TEXT,
  
  -- Technical metadata
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type VARCHAR(50),
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view image metadata"
  ON public.image_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Allow content management for image_metadata"
  ON public.image_metadata
  FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_image_metadata_article_id ON public.image_metadata(article_id);
CREATE INDEX idx_image_metadata_storage_path ON public.image_metadata(storage_path);
CREATE INDEX idx_image_metadata_article_type ON public.image_metadata(article_type);

-- Create trigger for updated_at
CREATE TRIGGER update_image_metadata_updated_at
  BEFORE UPDATE ON public.image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
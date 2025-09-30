-- Create storage bucket for article images and diagrams
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-visuals',
  'article-visuals',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);

-- Create RLS policies for article visuals bucket
CREATE POLICY "Anyone can view article visuals"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-visuals');

CREATE POLICY "Authenticated users can upload article visuals"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-visuals' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update article visuals"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-visuals' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete article visuals"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-visuals' AND auth.role() = 'authenticated');
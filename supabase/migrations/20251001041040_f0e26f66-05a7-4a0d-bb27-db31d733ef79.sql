-- Create blog_links table for explicit QA/Blog relationships
CREATE TABLE IF NOT EXISTS public.blog_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  target_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('QA', 'Blog')),
  relation text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_blog_link UNIQUE (blog_post_id, target_id, target_type)
);

-- Enable RLS
ALTER TABLE public.blog_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view blog links
CREATE POLICY "Anyone can view blog links"
ON public.blog_links
FOR SELECT
TO public
USING (true);

-- Allow content management for blog links
CREATE POLICY "Allow content management for blog_links"
ON public.blog_links
FOR ALL
TO public
USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_links_blog_post ON public.blog_links(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_links_target ON public.blog_links(target_id);
CREATE INDEX IF NOT EXISTS idx_blog_links_type ON public.blog_links(target_type);

-- Add blog_images table for multi-image support
CREATE TABLE IF NOT EXISTS public.blog_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  filename text NOT NULL,
  alt text NOT NULL,
  caption text,
  description text,
  exif jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_blog_image_filename UNIQUE (blog_post_id, filename)
);

-- Enable RLS
ALTER TABLE public.blog_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view blog images
CREATE POLICY "Anyone can view blog images"
ON public.blog_images
FOR SELECT
TO public
USING (true);

-- Allow content management for blog images
CREATE POLICY "Allow content management for blog_images"
ON public.blog_images
FOR ALL
TO public
USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_blog_images_blog_post ON public.blog_images(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_sort_order ON public.blog_images(sort_order);
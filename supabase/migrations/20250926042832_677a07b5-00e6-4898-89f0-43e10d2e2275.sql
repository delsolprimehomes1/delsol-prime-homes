-- Add funnel_stage column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS funnel_stage text DEFAULT 'TOFU'::text;

-- Add ai_generated_image flag
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS ai_generated_image boolean DEFAULT false;

-- Add toc_data JSON field for table of contents
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS toc_data jsonb DEFAULT '{}'::jsonb;

-- Add reading_time_minutes field
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 0;

-- Add custom_cta_text and custom_cta_url for mid-post CTAs
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS custom_cta_text text,
ADD COLUMN IF NOT EXISTS custom_cta_url text;

-- Create index for funnel_stage filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_funnel_stage ON public.blog_posts(funnel_stage);

-- Create index for ai_generated_image filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_ai_generated ON public.blog_posts(ai_generated_image);
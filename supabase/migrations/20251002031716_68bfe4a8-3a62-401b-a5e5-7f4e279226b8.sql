-- Extend qa_articles and blog_posts for GitHub markdown sync
ALTER TABLE public.qa_articles
ADD COLUMN IF NOT EXISTS frontmatter_yaml TEXT,
ADD COLUMN IF NOT EXISTS markdown_hash TEXT,
ADD COLUMN IF NOT EXISTS github_path TEXT,
ADD COLUMN IF NOT EXISTS speakable_questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS speakable_answer TEXT,
ADD COLUMN IF NOT EXISTS geo_coordinates JSONB,
ADD COLUMN IF NOT EXISTS area_served TEXT[];

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS frontmatter_yaml TEXT,
ADD COLUMN IF NOT EXISTS markdown_hash TEXT,
ADD COLUMN IF NOT EXISTS github_path TEXT,
ADD COLUMN IF NOT EXISTS speakable_questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS speakable_answer TEXT,
ADD COLUMN IF NOT EXISTS geo_coordinates JSONB,
ADD COLUMN IF NOT EXISTS area_served TEXT[];

-- Create content_authors table for E-E-A-T
CREATE TABLE IF NOT EXISTS public.content_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credentials TEXT,
  bio TEXT,
  profile_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create content_reviewers table for E-E-A-T
CREATE TABLE IF NOT EXISTS public.content_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credentials TEXT,
  review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Link authors to content
ALTER TABLE public.qa_articles
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.content_authors(id),
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.content_reviewers(id);

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.content_authors(id),
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.content_reviewers(id);

-- Enable RLS on new tables
ALTER TABLE public.content_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reviewers ENABLE ROW LEVEL SECURITY;

-- RLS policies for authors and reviewers
CREATE POLICY "Anyone can view authors"
ON public.content_authors
FOR SELECT
USING (true);

CREATE POLICY "Allow content management for authors"
ON public.content_authors
FOR ALL
USING (true);

CREATE POLICY "Anyone can view reviewers"
ON public.content_reviewers
FOR SELECT
USING (true);

CREATE POLICY "Allow content management for reviewers"
ON public.content_reviewers
FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qa_articles_github_path ON public.qa_articles(github_path);
CREATE INDEX IF NOT EXISTS idx_qa_articles_markdown_hash ON public.qa_articles(markdown_hash);
CREATE INDEX IF NOT EXISTS idx_blog_posts_github_path ON public.blog_posts(github_path);
CREATE INDEX IF NOT EXISTS idx_blog_posts_markdown_hash ON public.blog_posts(markdown_hash);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_content_authors_updated_at
BEFORE UPDATE ON public.content_authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_reviewers_updated_at
BEFORE UPDATE ON public.content_reviewers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
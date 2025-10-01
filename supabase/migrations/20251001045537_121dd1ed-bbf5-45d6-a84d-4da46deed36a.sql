-- Add RLS policies for blog_posts content management
CREATE POLICY "Allow content management for blog_posts"
ON public.blog_posts
FOR ALL
USING (true);

-- Note: This allows all operations on blog_posts. 
-- If you need user-specific restrictions, modify the USING clause accordingly.
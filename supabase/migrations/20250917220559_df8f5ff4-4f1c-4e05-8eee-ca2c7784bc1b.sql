-- Add INSERT policy for qa_articles to allow content import
CREATE POLICY "Allow content import for qa_articles" 
ON public.qa_articles 
FOR INSERT 
WITH CHECK (true);

-- Add UPDATE policy for qa_articles to allow content updates
CREATE POLICY "Allow content updates for qa_articles" 
ON public.qa_articles 
FOR UPDATE 
USING (true);

-- Add DELETE policy for qa_articles to allow content deletion
CREATE POLICY "Allow content deletion for qa_articles" 
ON public.qa_articles 
FOR DELETE 
USING (true);
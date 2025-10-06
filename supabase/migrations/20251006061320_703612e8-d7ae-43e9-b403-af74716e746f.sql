-- Add health monitoring columns to external_links table
ALTER TABLE public.external_links
ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'unchecked',
ADD COLUMN IF NOT EXISTS status_code INTEGER,
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS check_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Create index for faster health status queries
CREATE INDEX IF NOT EXISTS idx_external_links_health_status ON public.external_links(health_status);
CREATE INDEX IF NOT EXISTS idx_external_links_domain ON public.external_links(domain);
CREATE INDEX IF NOT EXISTS idx_external_links_last_health_check ON public.external_links(last_health_check);

-- Add comment for documentation
COMMENT ON COLUMN public.external_links.health_status IS 'Link health status: unchecked, healthy, broken, redirect, timeout, ssl_error';
COMMENT ON COLUMN public.external_links.status_code IS 'HTTP status code from last health check';
COMMENT ON COLUMN public.external_links.redirect_url IS 'Final URL if link redirects';
COMMENT ON COLUMN public.external_links.check_count IS 'Number of times link has been checked';
COMMENT ON COLUMN public.external_links.domain IS 'Extracted domain for grouping and analysis';
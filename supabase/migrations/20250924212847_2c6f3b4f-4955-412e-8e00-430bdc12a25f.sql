-- Phase 1: Database Schema Enhancement for Clustered QA System
-- Add cluster-based fields to qa_articles table

ALTER TABLE public.qa_articles 
ADD COLUMN cluster_id UUID,
ADD COLUMN cluster_title TEXT,
ADD COLUMN cluster_position INTEGER CHECK (cluster_position >= 1 AND cluster_position <= 6),
ADD COLUMN h1_title TEXT,
ADD COLUMN h2_title TEXT,
ADD COLUMN h3_title TEXT,
ADD COLUMN variation_group TEXT,
ADD COLUMN points_to_mofu_id UUID,
ADD COLUMN points_to_bofu_id UUID,
ADD COLUMN appointment_booking_enabled BOOLEAN DEFAULT false;

-- Create index for efficient cluster queries
CREATE INDEX idx_qa_articles_cluster_id ON public.qa_articles(cluster_id);
CREATE INDEX idx_qa_articles_cluster_position ON public.qa_articles(cluster_id, cluster_position);
CREATE INDEX idx_qa_articles_variation_group ON public.qa_articles(variation_group);

-- Create clusters table to manage cluster metadata
CREATE TABLE public.qa_clusters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on qa_clusters
ALTER TABLE public.qa_clusters ENABLE ROW LEVEL SECURITY;

-- Create policy for qa_clusters (public read access)
CREATE POLICY "Anyone can view active QA clusters" 
ON public.qa_clusters 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow content management for qa_clusters" 
ON public.qa_clusters 
FOR ALL 
USING (true);

-- Add foreign key constraint
ALTER TABLE public.qa_articles 
ADD CONSTRAINT fk_qa_articles_cluster_id 
FOREIGN KEY (cluster_id) REFERENCES public.qa_clusters(id);

-- Add foreign key constraints for TOFU→MOFU→BOFU flow
ALTER TABLE public.qa_articles 
ADD CONSTRAINT fk_qa_articles_points_to_mofu 
FOREIGN KEY (points_to_mofu_id) REFERENCES public.qa_articles(id);

ALTER TABLE public.qa_articles 
ADD CONSTRAINT fk_qa_articles_points_to_bofu 
FOREIGN KEY (points_to_bofu_id) REFERENCES public.qa_articles(id);

-- Create webhook_integrations table for n8n/GHL
CREATE TABLE public.webhook_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('n8n', 'ghl', 'zapier', 'custom')),
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_integrations
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for webhook_integrations (public read for active integrations)
CREATE POLICY "Anyone can view active webhook integrations" 
ON public.webhook_integrations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow webhook integration management" 
ON public.webhook_integrations 
FOR ALL 
USING (true);

-- Add trigger for qa_clusters updated_at
CREATE TRIGGER update_qa_clusters_updated_at
BEFORE UPDATE ON public.qa_clusters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for webhook_integrations updated_at
CREATE TRIGGER update_webhook_integrations_updated_at
BEFORE UPDATE ON public.webhook_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
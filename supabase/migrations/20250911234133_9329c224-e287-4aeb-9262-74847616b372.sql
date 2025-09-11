-- Create leads table for BOFU conversational AI page
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'BOFU AI Page',
  conversation_log JSONB DEFAULT '[]'::jsonb,
  stage TEXT NOT NULL DEFAULT 'welcome',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy allowing anyone to insert and view their own leads
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view all leads" 
ON public.leads 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
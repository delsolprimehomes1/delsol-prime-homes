-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  category_key TEXT NOT NULL,
  author TEXT DEFAULT 'DelSolPrimeHomes',
  status TEXT DEFAULT 'published',
  language TEXT NOT NULL DEFAULT 'en',
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  canonical_url TEXT,
  city_tags TEXT[],
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(slug, language)
);

-- Enable Row Level Security
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view blog categories" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_blog_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at_column();

-- Insert blog categories for all languages
INSERT INTO public.blog_categories (key, name, description, icon, sort_order, language) VALUES
-- English categories
('market-update', 'Market Update', 'Latest market trends and analysis', 'TrendingUp', 1, 'en'),
('buying-guides', 'Buying Guides', 'Step-by-step guides for property buyers', 'BookOpen', 2, 'en'),
('investment', 'Investment', 'Investment opportunities and analysis', 'Target', 3, 'en'),
('luxury-living', 'Luxury Living', 'Luxury lifestyle and premium properties', 'Crown', 4, 'en'),
('costa-del-sol-lifestyle', 'Costa del Sol Lifestyle', 'Life on the Costa del Sol', 'Sun', 5, 'en'),

-- Dutch categories
('market-update', 'Markt Update', 'Laatste markttrends en analyse', 'TrendingUp', 1, 'nl'),
('buying-guides', 'Koopgidsen', 'Stap-voor-stap gidsen voor vastgoedkopers', 'BookOpen', 2, 'nl'),
('investment', 'Investering', 'Investeringsmogelijkheden en analyse', 'Target', 3, 'nl'),
('luxury-living', 'Luxe Leven', 'Luxe levensstijl en premium eigendommen', 'Crown', 4, 'nl'),
('costa-del-sol-lifestyle', 'Costa del Sol Levensstijl', 'Leven aan de Costa del Sol', 'Sun', 5, 'nl'),

-- French categories
('market-update', 'Actualité du Marché', 'Dernières tendances et analyses du marché', 'TrendingUp', 1, 'fr'),
('buying-guides', 'Guides d''Achat', 'Guides étape par étape pour les acheteurs', 'BookOpen', 2, 'fr'),
('investment', 'Investissement', 'Opportunités et analyses d''investissement', 'Target', 3, 'fr'),
('luxury-living', 'Vie de Luxe', 'Style de vie luxueux et propriétés premium', 'Crown', 4, 'fr'),
('costa-del-sol-lifestyle', 'Style de Vie Costa del Sol', 'La vie sur la Costa del Sol', 'Sun', 5, 'fr'),

-- German categories
('market-update', 'Markt Update', 'Neueste Markttrends und Analysen', 'TrendingUp', 1, 'de'),
('buying-guides', 'Kaufleitfäden', 'Schritt-für-Schritt Leitfäden für Käufer', 'BookOpen', 2, 'de'),
('investment', 'Investition', 'Investitionsmöglichkeiten und Analysen', 'Target', 3, 'de'),
('luxury-living', 'Luxuriöses Leben', 'Luxuriöser Lebensstil und Premium-Immobilien', 'Crown', 4, 'de'),
('costa-del-sol-lifestyle', 'Costa del Sol Lebensstil', 'Leben an der Costa del Sol', 'Sun', 5, 'de'),

-- Polish categories
('market-update', 'Aktualizacja Rynku', 'Najnowsze trendy i analizy rynkowe', 'TrendingUp', 1, 'pl'),
('buying-guides', 'Przewodniki Kupującego', 'Przewodniki krok po kroku dla kupujących', 'BookOpen', 2, 'pl'),
('investment', 'Inwestycje', 'Możliwości inwestycyjne i analizy', 'Target', 3, 'pl'),
('luxury-living', 'Luksusowe Życie', 'Luksusowy styl życia i nieruchomości premium', 'Crown', 4, 'pl'),
('costa-del-sol-lifestyle', 'Styl Życia Costa del Sol', 'Życie na Costa del Sol', 'Sun', 5, 'pl'),

-- Swedish categories
('market-update', 'Marknadsuppdatering', 'Senaste marknadstrender och analyser', 'TrendingUp', 1, 'sv'),
('buying-guides', 'Köpguider', 'Steg-för-steg guider för fastighetsköpare', 'BookOpen', 2, 'sv'),
('investment', 'Investering', 'Investeringsmöjligheter och analyser', 'Target', 3, 'sv'),
('luxury-living', 'Lyxliv', 'Lyxig livsstil och premium fastigheter', 'Crown', 4, 'sv'),
('costa-del-sol-lifestyle', 'Costa del Sol Livsstil', 'Livet på Costa del Sol', 'Sun', 5, 'sv'),

-- Danish categories
('market-update', 'Markedsopdatering', 'Seneste markedstendenser og analyser', 'TrendingUp', 1, 'da'),
('buying-guides', 'Købsguider', 'Trin-for-trin guides til ejendomskøbere', 'BookOpen', 2, 'da'),
('investment', 'Investering', 'Investeringsmuligheder og analyser', 'Target', 3, 'da'),
('luxury-living', 'Luksus Liv', 'Luksus livsstil og premium ejendomme', 'Crown', 4, 'da'),
('costa-del-sol-lifestyle', 'Costa del Sol Livsstil', 'Livet på Costa del Sol', 'Sun', 5, 'da');
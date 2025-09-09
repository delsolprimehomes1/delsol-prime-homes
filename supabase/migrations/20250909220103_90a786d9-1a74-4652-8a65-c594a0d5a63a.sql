-- Add internal links for TOFU questions to complete the funnel flow
UPDATE public.faqs 
SET internal_links = '{
  "mofu": {
    "text": "Compare the best remote working areas on the Costa del Sol",
    "url": "/qa/best-areas-remote-working-expats-costa-del-sol"
  }
}'::jsonb
WHERE slug = 'average-property-price-costa-del-sol' AND language = 'en';

UPDATE public.faqs 
SET internal_links = '{
  "mofu": {
    "text": "Discover which Costa del Sol areas work best for remote professionals", 
    "url": "/qa/best-areas-remote-working-expats-costa-del-sol"
  }
}'::jsonb
WHERE slug = 'golden-visa-spain-program' AND language = 'en';

UPDATE public.faqs 
SET internal_links = '{
  "mofu": {
    "text": "Learn about setting up reliable internet for remote work",
    "url": "/qa/set-up-reliable-home-network-costa-del-sol" 
  }
}'::jsonb
WHERE slug = 'spanish-property-buying-timeline' AND language = 'en';
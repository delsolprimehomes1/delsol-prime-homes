-- Add the new BOFU question about airport convenience (with correct uppercase funnel_stage)
INSERT INTO public.faqs (
  slug,
  language,
  question,
  answer_short,
  answer_long,
  category,
  funnel_stage,
  meta_title,
  meta_description,
  keywords,
  tags,
  internal_links,
  is_featured,
  sort_order
) VALUES (
  'airport-convenience-as-a-buying-factor-what-should-uk-and-irish-buyers-check-bef',
  'en',
  'Airport convenience as a buying factor: what should UK and Irish buyers check before choosing a property?',
  'Before buying, evaluate distance to Málaga Airport, transfer times, and public transport options. Airport proximity adds long-term value, boosting both rental demand and resale potential.',
  '### Key questions to ask
- How long is the drive/train ride to AGP?
- Is there easy AP-7 toll road access?
- Are train stations nearby for visiting family or guests?
- Will transfer times affect holiday rental appeal?

### Why this matters for investors
- **Holiday rentals**: Tourists prefer transfers under 45 minutes.
- **Resale value**: Properties near efficient airport links maintain demand.
- **Lifestyle**: Easier for regular visits back to the UK or Ireland.

### Best areas by convenience
- **Torremolinos–Fuengirola**: unbeatable for frequent flyers.
- **Mijas Costa, Marbella, Estepona**: balance lifestyle and manageable distance.
- **Casares/Manilva/Sotogrande**: longer transfers, but attract high-end buyers who prioritise exclusivity.

### DelSolPrimeHomes advantage
We provide a door-to-door transfer time analysis for each development, so buyers know exactly how airport convenience impacts lifestyle, rentals, and resale.',
  'lifestyle',
  'BOFU',
  'Airport Convenience Costa del Sol Property Buyers | DelSolPrimeHomes',
  'Essential airport convenience factors for UK & Irish property buyers on Costa del Sol. Transfer times, transport links & investment impact analysis.',
  ARRAY['airport convenience', 'Málaga Airport', 'Costa del Sol property', 'expat lifestyle', 'rental investment'],
  ARRAY['costa-del-sol', 'marbella', 'expat'],
  '[{"stage": "bofu", "text": "Book a free 20-minute consultation", "url": "/contact", "description": "Get a tailored plan for your Costa del Sol property journey"}]'::jsonb,
  false,
  0
);

-- Update MOFU questions to link to both BOFU options
UPDATE public.faqs 
SET internal_links = '[
  {"stage": "bofu", "text": "Remote Work Setup Guide", "url": "/qa/best-areas-costa-del-sol-digital-nomads-remote-workers-internet-coworking", "description": "Complete guide for remote workers choosing Costa del Sol locations"},
  {"stage": "bofu", "text": "Airport Convenience Analysis", "url": "/qa/airport-convenience-as-a-buying-factor-what-should-uk-and-irish-buyers-check-bef", "description": "Essential factors for frequent travelers and rental investors"}
]'::jsonb
WHERE funnel_stage = 'MOFU' AND language = 'en';

-- Update key TOFU questions to link to relevant MOFU questions
UPDATE public.faqs 
SET internal_links = '[
  {"stage": "mofu", "text": "Location & Lifestyle Factors", "url": "/qa/marbella-vs-fuengirola-vs-estepona-which-area-offers-best-value-lifestyle-for-uk", "description": "Compare top Costa del Sol areas for your lifestyle and budget"},
  {"stage": "mofu", "text": "Property Viewing Process", "url": "/qa/property-viewings-costa-del-sol-what-should-i-expect-how-many-properties-shou", "description": "Everything you need to know about viewing properties efficiently"}
]'::jsonb
WHERE slug IN (
  'can-non-eu-residents-buy-property-in-spain',
  'what-is-nie-and-why-do-i-need-it',
  'do-i-need-a-lawyer-when-buying-property-in-spain'
) AND language = 'en';

-- Update property process TOFU questions to link to practical MOFU
UPDATE public.faqs 
SET internal_links = '[
  {"stage": "mofu", "text": "Property Viewing Guide", "url": "/qa/property-viewings-costa-del-sol-what-should-i-expect-how-many-properties-shou", "description": "Professional guidance for efficient property viewings"},
  {"stage": "mofu", "text": "Area Comparison Guide", "url": "/qa/marbella-vs-fuengirola-vs-estepona-which-area-offers-best-value-lifestyle-for-uk", "description": "Find the perfect location for your Costa del Sol property"}
]'::jsonb
WHERE slug IN (
  'how-long-does-it-take-to-get-an-nie',
  'what-is-the-golden-visa-program'
) AND language = 'en';

-- Ensure proper meta titles and descriptions for all funnel stages
UPDATE public.faqs 
SET 
  meta_title = CASE 
    WHEN meta_title IS NULL THEN LEFT(question, 55) || ' | DelSolPrimeHomes'
    ELSE meta_title
  END,
  meta_description = CASE 
    WHEN meta_description IS NULL THEN LEFT(answer_short, 155)
    ELSE meta_description
  END
WHERE language = 'en' AND (meta_title IS NULL OR meta_description IS NULL);
-- Insert sample Q&A data for testing the enhanced FAQ system

-- Update existing FAQ table structure first if needed
UPDATE public.faqs SET 
  funnel_stage = 'TOFU',
  author_name = 'Elena Fernandez',
  is_speakable = true,
  view_count = FLOOR(RANDOM() * 100)
WHERE funnel_stage IS NULL;

-- Insert sample enhanced FAQ categories
INSERT INTO public.faq_category_enhancements (category_key, language, seo_title, seo_description, hero_text, speakable_intro, funnel_description) VALUES
('connectivity', 'en', 'Internet & Connectivity in Costa del Sol', 'Complete guide to internet, wifi, and connectivity options for Costa del Sol properties', 'Stay Connected in Paradise', 'Get reliable internet and connectivity in your Costa del Sol home', '{"TOFU": "Learn about connectivity options", "MOFU": "Compare internet providers", "BOFU": "Set up your connection"}'),
('lifestyle', 'en', 'Expat Lifestyle in Costa del Sol', 'Everything you need to know about living in Costa del Sol as an expat', 'Your New Life in Spain', 'Discover the Costa del Sol lifestyle for international residents', '{"TOFU": "Explore lifestyle benefits", "MOFU": "Plan your move", "BOFU": "Start your new life"}'),
('investment', 'en', 'Property Investment Opportunities', 'Investment guidance for Costa del Sol real estate', 'Smart Property Investments', 'Make informed property investment decisions', '{"TOFU": "Understand the market", "MOFU": "Analyze opportunities", "BOFU": "Make your investment"}')
ON CONFLICT (category_key, language) DO UPDATE SET
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  hero_text = EXCLUDED.hero_text,
  speakable_intro = EXCLUDED.speakable_intro,
  funnel_description = EXCLUDED.funnel_description,
  updated_at = now();

-- Insert sample connectivity & lifestyle Q&As based on the user's content
INSERT INTO public.faqs (
  slug, language, question, answer_short, answer_long, category, 
  funnel_stage, author_name, author_url, is_speakable, is_featured,
  tags, internal_links, keywords, sort_order
) VALUES
-- TOFU Questions
(
  'internet-coverage-new-builds-costa-del-sol',
  'en',
  'Is internet coverage reliable in Costa del Sol new-build complexes?',
  'Yes — most modern developments are delivered with high-speed fiber-optic internet and strong 4G/5G coverage. Developers increasingly pre-install multi-room wiring and smart-home features.',
  'Most modern Costa del Sol developments come with excellent internet infrastructure. Fiber-optic connections are standard, delivering speeds of 600Mbps to 1Gbps directly to each home. 5G coverage is excellent along the coast, with signal boosters available for hillside locations. Smart-ready builds include pre-installed multi-room wiring and home automation systems, making them future-proof for remote work and digital lifestyle needs.',
  'connectivity',
  'TOFU',
  'Elena Fernandez',
  'https://delsolprimehomes.com/team/elena-fernandez',
  true,
  true,
  ARRAY['fiber', '5G', 'wifi', 'new-builds', 'smart-home'],
  '{"mofu": {"text": "Compare 5G vs Fiber options", "url": "/qa/5g-coverage-vs-fiber-costa-del-sol"}}',
  ARRAY['internet coverage', 'new build internet', 'costa del sol connectivity'],
  1
),
(
  '5g-coverage-vs-fiber-costa-del-sol',
  'en',
  'How strong is 5G along the Costa del Sol — and do I still need fiber?',
  '5G is excellent along the coast, but fiber is essential for stable, high-capacity connections. The best setup is fiber primary + 5G backup.',
  '5G coverage along the Costa del Sol is excellent, particularly in coastal areas where you can expect speeds of 100-300Mbps outdoors. However, 5G can fluctuate based on weather and network congestion. Fiber delivers consistent 600Mbps-1Gbps with low latency, making it ideal for video calls, streaming, and remote work. The optimal setup combines fiber as your primary connection with 5G as backup using dual-WAN routers for automatic failover.',
  'connectivity',
  'TOFU',
  'Elena Fernandez',
  'https://delsolprimehomes.com/team/elena-fernandez',
  true,
  true,
  ARRAY['5G', 'fiber', 'redundancy', 'dual-WAN', 'backup internet'],
  '{"mofu": {"text": "Learn about installation timelines", "url": "/qa/how-fast-to-set-up-fiber-after-move-in"}}',
  ARRAY['5G coverage', 'fiber internet', 'internet backup'],
  2
),
(
  'how-fast-to-set-up-fiber-after-move-in',
  'en',
  'How quickly can fiber internet be installed in a Costa del Sol new-build?',
  'Usually within 3–7 working days, with 600Mb–1Gbps packages at £25–£40/month. Spain has one of Europe''s best fiber rollouts.',
  'Fiber installation in Costa del Sol new-builds is typically very fast, usually completed within 3-7 working days of booking. Spain has one of Europe''s most advanced fiber networks, with major providers like Movistar, Vodafone, Orange, and MásMóvil competing on both price and service. You can expect 600Mbps-1Gbps packages for £25-£40/month, with same-day activation sometimes possible in urban areas like Marbella and Estepona.',
  'connectivity',
  'TOFU',
  'Elena Fernandez',
  'https://delsolprimehomes.com/team/elena-fernandez',
  true,
  false,
  ARRAY['installation', 'providers', 'pricing', 'timeline'],
  '{"mofu": {"text": "Find the best areas for remote workers", "url": "/qa/best-areas-remote-working-expats-costa-del-sol"}}',
  ARRAY['fiber installation', 'internet setup', 'new build connectivity'],
  3
),

-- MOFU Questions
(
  'best-areas-remote-working-expats-costa-del-sol',
  'en',
  'Which Costa del Sol areas are best for British and Irish remote workers?',
  'Top picks combine fast fiber, international services, and quick airport links: La Cala de Mijas, Benalmádena, Nueva Andalucía, Estepona, Casares Playa.',
  'The best Costa del Sol areas for remote workers offer reliable connectivity, international amenities, and excellent transport links. La Cala de Mijas provides a walkable, seaside coworking atmosphere. Benalmádena Pueblo offers village charm with direct train access to Málaga Airport. Nueva Andalucía is leafy and residential, just minutes from Puerto Banús. Estepona features a vibrant old town with excellent fiber coverage. Casares Playa has modern resort developments with built-in coworking spaces and wellness facilities.',
  'lifestyle',
  'MOFU',
  'Elena Fernandez',
  'https://delsolprimehomes.com/team/elena-fernandez',
  true,
  true,
  ARRAY['areas', 'remote work', 'expats', 'airport access', 'coworking'],
  '{"bofu": {"text": "Get your remote working property checklist", "url": "/qa/remote-working-checklist-off-plan-costa-del-sol"}}',
  ARRAY['best areas remote work', 'expat locations', 'costa del sol areas'],
  4
),
(
  'set-up-reliable-home-network-costa-del-sol',
  'en',
  'How can I set up a reliable home network in a Costa del Sol new-build?',
  'Combine fiber + 5G backup with a dual-WAN router and Wi-Fi 6 mesh. Add a UPS for resilience during power cuts.',
  'Setting up a reliable home network in Costa del Sol requires a multi-layered approach. Start with fiber as your primary connection and 5G as backup, connected through a dual-WAN router for automatic failover. Position your router outside utility cabinets for better coverage. Use Wi-Fi 6 mesh systems to overcome thick Spanish walls. Add an Uninterruptible Power Supply (UPS) to keep your internet running during brief power outages, which are common during storms.',
  'connectivity',
  'MOFU',
  'Elena Fernandez',
  'https://delsolprimehomes.com/team/elena-fernandez',
  true,
  false,
  ARRAY['mesh wifi', 'routers', 'dual-WAN', 'UPS', 'network setup'],
  '{"bofu": {"text": "Complete your remote working setup checklist", "url": "/qa/remote-working-checklist-off-plan-costa-del-sol"}}',
  ARRAY['home network setup', 'reliable internet', 'network equipment'],
  5
),

-- BOFU Question
(
  'remote-working-checklist-off-plan-costa-del-sol',
  'en',
  'Remote-working checklist: what should UK & Irish buyers confirm before reserving off-plan?',
  'Verify fiber readiness, RJ45 data points, and 5G strength before signing. This ensures smooth work, lifestyle, rentals, and resale.',
  'Before reserving an off-plan Costa del Sol property for remote work, confirm these essentials: Pre-reservation - get written confirmation of fiber availability and internal wiring specifications. During the process - request a developer demo of expected network speeds and coverage. At handover - conduct thorough tests of fiber connection, 5G signal strength, and failover systems. Ensure multiple RJ45 data points in key rooms, proper router positioning outside utility areas, and cellular signal boosters if needed for hillside locations.',
  'lifestyle',
  'BOFU',
  'Elena Fernandez',
  'https://delsolprimehomes.com/team/elena-fernandez',
  true,
  true,
  ARRAY['buyers', 'checklist', 'remote work', 'new-build', 'off-plan'],
  '{"bofu": {"text": "Book a free consultation for personalized advice", "url": "/contact?service=remote-work-consultation"}}',
  ARRAY['remote work checklist', 'off plan buying', 'property checklist'],
  6
)

ON CONFLICT (slug, language) DO UPDATE SET
  question = EXCLUDED.question,
  answer_short = EXCLUDED.answer_short,
  answer_long = EXCLUDED.answer_long,
  category = EXCLUDED.category,
  funnel_stage = EXCLUDED.funnel_stage,
  author_name = EXCLUDED.author_name,
  author_url = EXCLUDED.author_url,
  is_speakable = EXCLUDED.is_speakable,
  is_featured = EXCLUDED.is_featured,
  tags = EXCLUDED.tags,
  internal_links = EXCLUDED.internal_links,
  keywords = EXCLUDED.keywords,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
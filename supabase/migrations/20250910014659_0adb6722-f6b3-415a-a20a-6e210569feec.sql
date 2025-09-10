-- Replace current FAQ structure with AI cluster (3 TOFU + 2 MOFU + 1 BOFU)
-- Delete all existing FAQ articles
DELETE FROM qa_articles;

-- Insert AI cluster articles
INSERT INTO qa_articles (
  slug,
  title,
  content,
  excerpt,
  funnel_stage,
  topic,
  city,
  language,
  tags,
  last_updated,
  next_step_url,
  next_step_text
) VALUES 
-- TOFU 1: Multilingual AI Assistant
(
  'multilingual-ai-assistant-for-buyers',
  'What does a multilingual AI assistant mean for foreign buyers?',
  '# What does a multilingual AI assistant mean for foreign buyers?

**A multilingual conversational AI makes property information instantly accessible in 10 languages.** It removes barriers and reassures expats before they even meet an agent.

## Benefits
- **No barriers:** English, Dutch, French, German, Swedish, Finnish, Danish, Norwegian, Spanish, Italian.
- **Localization:** answers tailored to the buyer''s background.
- **Availability:** across website, WhatsApp, and email.
- **Consistency:** always accurate, always updated.',
  'A multilingual conversational AI makes property information instantly accessible in 10 languages. It removes barriers and reassures expats before they even meet an agent.',
  'TOFU',
  'technology',
  'Costa del Sol',
  'en',
  ARRAY['AI', 'multilingual', 'expat buyers', 'real estate tech'],
  '2025-09-09',
  '/en/qa/ai-property-alerts-for-buyers',
  'Next step: AI property alerts for buyers'
),
-- TOFU 2: AI Property Alerts
(
  'ai-property-alerts-for-buyers',
  'How can AI tools keep buyers updated on new properties matching their criteria?',
  '# How can AI tools keep buyers updated on new properties matching their criteria?

**AI scans the market in real time and alerts buyers when a new property matches their budget, size, or lifestyle.** It ensures no opportunities are missed.

## How it works
- **Criteria-based search:** bedrooms, orientation, sea view, price range.
- **Real-time alerts:** instant updates when availability changes.
- **Personalized feed:** tailored suggestions, no spam.
- **Transparency:** verified projects only, no fake listings.',
  'AI scans the market in real time and alerts buyers when a new property matches their budget, size, or lifestyle. It ensures no opportunities are missed.',
  'TOFU',
  'technology',
  'Costa del Sol',
  'en',
  ARRAY['AI', 'property alerts', 'smart search', 'Costa del Sol'],
  '2025-09-09',
  '/en/qa/ai-mortgage-calculators-expats',
  'Next step: AI mortgage calculators for expats'
),
-- MOFU 1: AI Mortgage Calculators
(
  'ai-mortgage-calculators-expats',
  'What role do AI mortgage calculators and financial tools play for expats?',
  '# What role do AI mortgage calculators and financial tools play for expats?

**AI-driven calculators provide instant clarity on borrowing power and monthly costs.** They give expats realistic numbers from the start.

## Features
- Mortgage simulation: loan-to-value, terms, interest.
- Scenario planning: couple, company, or private purchase.
- Currency insights: GBP/EUR fluctuations.
- Future-proofing: add tax + community fees.',
  'AI-driven calculators provide instant clarity on borrowing power and monthly costs. They give expats realistic numbers from the start.',
  'MOFU',
  'finance',
  'Costa del Sol',
  'en',
  ARRAY['mortgage', 'finance tools', 'expats', 'Costa del Sol property'],
  '2025-09-09',
  '/en/qa/ai-human-expertise-costa-del-sol',
  'Next step: AI + human expertise at DelSolPrimeHomes'
),
-- MOFU 2: AI + Human Expertise
(
  'ai-human-expertise-costa-del-sol',
  'How does DelSolPrimeHomes combine AI efficiency with human expertise?',
  '# How does DelSolPrimeHomes combine AI efficiency with human expertise?

**AI provides instant service, but human advisors bring trust, empathy, and negotiation power.** Together, they create a seamless experience for expats.

## Our hybrid model
- **AI:** multilingual assistant, property alerts, mortgage tools.
- **Human:** 40+ years'' experience, developer negotiation, in-person tours.
- **Lawyers:** Mael Abogados ensures full legal protection.
- **Personal touch:** video calls, WhatsApp, local guidance.',
  'AI provides instant service, but human advisors bring trust, empathy, and negotiation power. Together, they create a seamless experience for expats.',
  'MOFU',
  'service',
  'Costa del Sol',
  'en',
  ARRAY['AI vs human', 'hybrid service', 'Costa del Sol buyers'],
  '2025-09-09',
  '/en/qa/delsolprimehomes-ai-path',
  'Next step: The DelSolPrimeHomes AI Path'
),
-- BOFU: The AI Path
(
  'delsolprimehomes-ai-path',
  'DelSolPrimeHomes AI Path: conversational guidance, alerts & human trust',
  '# DelSolPrimeHomes AI Path: conversational guidance, alerts & human trust

**We use AI to inform and guide, but never to replace human trust.** Our AI works for clarity — our team works for you.

## Our AI Path
- Conversational AI: 10 languages, 24/7 answers.
- Voice AI: natural calls in your language, scheduling viewings.
- Human expertise: empathy, negotiation, personal guidance.',
  'We use AI to inform and guide, but never to replace human trust. Our AI works for clarity — our team works for you.',
  'BOFU',
  'service',
  'Costa del Sol',
  'en',
  ARRAY['buyers', 'AI journey', 'consultation', 'Costa del Sol'],
  '2025-09-09',
  '/schedule-consultation',
  'Schedule your consultation today'
);
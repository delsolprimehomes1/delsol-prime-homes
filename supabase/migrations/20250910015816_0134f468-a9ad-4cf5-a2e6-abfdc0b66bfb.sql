-- Insert new legal services cluster (Q475-Q480)
INSERT INTO public.qa_articles (
  slug, title, content, excerpt, funnel_stage, topic, tags, next_step_url, next_step_text, last_updated
) VALUES 
(
  'lawyer-role-foreign-buyers-costa-del-sol',
  'Why is a lawyer essential when foreign buyers purchase property in Spain?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">A lawyer safeguards your interests by handling due diligence, contracts, and legal checks.</strong> For foreign buyers, this ensures transparency and peace of mind.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Key tasks</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Verifying property ownership & debts.</li><li class="ml-4">Reviewing developer licensing & permits.</li><li class="ml-4">Drafting/reviewing contracts.</li><li class="ml-4">Handling taxes, fees, and registration.</li></ul>',
  'A lawyer safeguards your interests by handling due diligence, contracts, and legal checks. For foreign buyers, this ensures transparency and peace of mind.',
  'TOFU',
  'legal',
  '{lawyer,legal,"property purchase",expats}',
  '/en/qa/deeds-registration-costa-del-sol',
  'Who handles property deeds & registration?',
  '2025-09-09'
),
(
  'deeds-registration-costa-del-sol',
  'Who manages property deeds and registration for buyers in Costa del Sol?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">The buyer''s lawyer ensures all deeds are correctly signed, notarized, and registered.</strong> This guarantees ownership is legally secure.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Process</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Deeds signed before a Spanish notary.</li><li class="ml-4">Lawyer submits to Property Registry.</li><li class="ml-4">Taxes/fees settled on buyer''s behalf.</li><li class="ml-4">Buyer receives official property title.</li></ul>',
  'The buyer''s lawyer ensures all deeds are correctly signed, notarized, and registered. This guarantees ownership is legally secure.',
  'TOFU',
  'legal',
  '{deeds,"property registry","Spain legal","expat buyers"}',
  '/en/qa/mael-abogados-costa-del-sol',
  'Why use Mael Abogados?',
  '2025-09-09'
),
(
  'mael-abogados-costa-del-sol',
  'Why is Mael Abogados recommended for international buyers in Costa del Sol?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Mael Abogados is an experienced law firm specializing in property, tax, and expat services.</strong> They provide bilingual expertise and protect foreign buyers.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Why choose them</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">25+ years of legal expertise.</li><li class="ml-4">Full bilingual support (English/Spanish).</li><li class="ml-4">Specialists in expat property purchases.</li><li class="ml-4">Seamless collaboration with DelSolPrimeHomes.</li></ul>',
  'Mael Abogados is an experienced law firm specializing in property, tax, and expat services. They provide bilingual expertise and protect foreign buyers.',
  'TOFU',
  'legal',
  '{"law firm","legal partner",expats,"Costa del Sol"}',
  '/en/qa/due-diligence-checks-costa-del-sol',
  'What due diligence checks are performed?',
  '2025-09-09'
),
(
  'due-diligence-checks-costa-del-sol',
  'What due diligence checks are carried out before buying property in Spain?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Lawyers verify ownership, debts, planning status, and building licenses before purchase.</strong> This prevents costly surprises later.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Typical checks</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Nota Simple (property ownership record).</li><li class="ml-4">Debts & encumbrances (mortgages, taxes).</li><li class="ml-4">Building permits & licenses.</li><li class="ml-4">Community fees & regulations.</li></ul>',
  'Lawyers verify ownership, debts, planning status, and building licenses before purchase. This prevents costly surprises later.',
  'MOFU',
  'legal',
  '{"due diligence","legal checks","property verification"}',
  '/en/qa/bank-accounts-taxes-costa-del-sol',
  'Bank accounts, taxes & payments',
  '2025-09-09'
),
(
  'bank-accounts-taxes-costa-del-sol',
  'How do foreign buyers handle bank accounts, taxes, and payments in Spain?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Most buyers open a Spanish bank account and rely on their lawyer to manage taxes and payments.</strong> This ensures transactions comply with Spanish law.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Key steps</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Open Spanish bank account (passport, NIE required).</li><li class="ml-4">Pay deposits & installments via lawyer''s client account.</li><li class="ml-4">Lawyer settles ITP/IVA, notary, registry, and legal fees.</li><li class="ml-4">Ongoing: community fees & utilities.</li></ul>',
  'Most buyers open a Spanish bank account and rely on their lawyer to manage taxes and payments. This ensures transactions comply with Spanish law.',
  'MOFU',
  'finance',
  '{banking,taxes,payments,"foreign buyers"}',
  '/en/qa/secure-buying-process-costa-del-sol',
  'Secure your buying process with DelSolPrimeHomes',
  '2025-09-09'
),
(
  'secure-buying-process-costa-del-sol',
  'How does DelSolPrimeHomes ensure a secure buying process for foreign clients?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">We partner with expert lawyers like Mael Abogados to ensure every step is transparent, legal, and stress-free.</strong> From reservation to registration, you are protected.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">What you get</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Verified developers & properties.</li><li class="ml-4">End-to-end legal support.</li><li class="ml-4">Full transparency in fees & taxes.</li><li class="ml-4">Seamless coordination between agents & lawyers.</li></ul>',
  'We partner with expert lawyers like Mael Abogados to ensure every step is transparent, legal, and stress-free. From reservation to registration, you are protected.',
  'BOFU',
  'service',
  '{buyers,legal,consultation,"Costa del Sol"}',
  '/schedule-consultation',
  'Schedule your consultation today',
  '2025-09-09'
);
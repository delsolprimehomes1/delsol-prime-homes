-- Insert Property Buying Process Cluster (Q481-Q486)
INSERT INTO qa_articles (
  id,
  slug,
  title,
  content,
  excerpt,
  funnel_stage,
  topic,
  city,
  language,
  tags,
  next_step_url,
  next_step_text,
  last_updated
) VALUES

-- Q481: Reservation Contracts (TOFU)
(
  gen_random_uuid(),
  'reservation-contracts-costa-del-sol',
  'What is a reservation contract when buying property in Spain?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">A reservation contract secures the property for the buyer by removing it from the market.</strong> It shows commitment and protects you while legal checks begin.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Key points</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Paid early (typically €3,000–€10,000).</li><li class="ml-4">Property is withdrawn from listings.</li><li class="ml-4">Sets timeline for private purchase contract.</li><li class="ml-4">Fully refundable if legal checks fail.</li></ul>',
  'A reservation contract secures the property for the buyer by removing it from the market. It shows commitment and protects you while legal checks begin.',
  'TOFU',
  'contracts',
  'Costa del Sol',
  'en',
  ARRAY['reservation', 'contracts', 'property buying', 'Costa del Sol'],
  '/qa/private-purchase-contracts-costa-del-sol',
  'Private purchase contracts explained',
  '2025-09-09'
),

-- Q482: Private Purchase Contract (TOFU)
(
  gen_random_uuid(),
  'private-purchase-contracts-costa-del-sol',
  'What is the private purchase contract in a Spanish property transaction?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">The private purchase contract (Contrato Privado) is the key agreement setting terms, payments, and obligations.</strong> It commits both buyer and seller before notary.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">What it includes</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Price & payment structure.</li><li class="ml-4">Deadlines & conditions.</li><li class="ml-4">Developer/builder guarantees.</li><li class="ml-4">Penalties for non-compliance.</li></ul>',
  'The private purchase contract (Contrato Privado) is the key agreement setting terms, payments, and obligations. It commits both buyer and seller before notary.',
  'TOFU',
  'contracts',
  'Costa del Sol',
  'en',
  ARRAY['contracts', 'private contract', 'property purchase'],
  '/qa/notary-completion-costa-del-sol',
  'What happens at notary completion?',
  '2025-09-09'
),

-- Q483: Notary Completion (TOFU)
(
  gen_random_uuid(),
  'notary-completion-costa-del-sol',
  'What happens at notary completion when buying property in Spain?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Completion is when the buyer, seller, and notary meet to sign deeds, transfer keys, and finalize payment.</strong> It makes the purchase official.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Steps</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Buyer and seller attend notary office.</li><li class="ml-4">Final payment is transferred.</li><li class="ml-4">Deeds are signed and stamped.</li><li class="ml-4">Buyer receives keys and notary confirmation.</li></ul>',
  'Completion is when the buyer, seller, and notary meet to sign deeds, transfer keys, and finalize payment. It makes the purchase official.',
  'TOFU',
  'contracts',
  'Costa del Sol',
  'en',
  ARRAY['notary', 'completion', 'deeds', 'Spain property'],
  '/qa/mortgage-financing-expats-costa-del-sol',
  'Mortgage financing for expats',
  '2025-09-09'
),

-- Q484: Mortgage Financing (MOFU)
(
  gen_random_uuid(),
  'mortgage-financing-expats-costa-del-sol',
  'How do expats secure mortgage financing in Spain?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Foreign buyers can access Spanish mortgages, typically 60–70% loan-to-value.</strong> Approval depends on income, credit history, and property valuation.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Financing details</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Loan-to-value: up to 70% for residents, ~60% for non-residents.</li><li class="ml-4">Term: up to 25–30 years.</li><li class="ml-4">Documents: income proof, tax returns, credit reports.</li><li class="ml-4">Approval time: 4–6 weeks.</li></ul>',
  'Foreign buyers can access Spanish mortgages, typically 60–70% loan-to-value. Approval depends on income, credit history, and property valuation.',
  'MOFU',
  'finance',
  'Costa del Sol',
  'en',
  ARRAY['mortgage', 'financing', 'expats', 'Spain property'],
  '/qa/ongoing-costs-costa-del-sol',
  'Ongoing costs of property ownership',
  '2025-09-09'
),

-- Q485: Ongoing Costs (MOFU)
(
  gen_random_uuid(),
  'ongoing-costs-costa-del-sol',
  'What are the ongoing costs of owning property in Costa del Sol?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Beyond the purchase, owners pay taxes, fees, and maintenance.</strong> These recurring costs keep your property compliant and in good condition.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">Typical costs</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">IBI (annual property tax).</li><li class="ml-4">Community fees (if in a complex).</li><li class="ml-4">Utilities: water, electricity, internet.</li><li class="ml-4">Insurance and maintenance.</li></ul>',
  'Beyond the purchase, owners pay taxes, fees, and maintenance. These recurring costs keep your property compliant and in good condition.',
  'MOFU',
  'finance',
  'Costa del Sol',
  'en',
  ARRAY['ownership costs', 'community fees', 'maintenance', 'taxes'],
  '/qa/property-consultation-costa-del-sol',
  'Book your property consultation',
  '2025-09-09'
),

-- Q486: Property Consultation (BOFU)
(
  gen_random_uuid(),
  'property-consultation-costa-del-sol',
  'Why book a consultation with DelSolPrimeHomes before buying?',
  '<p class="mb-4 text-muted-foreground leading-relaxed"><strong class="font-semibold text-foreground">Our consultations give you a full financial and legal roadmap before you commit.</strong> We align your budget, mortgage, and property needs.</p><h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">What you get</h2><ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground"><li class="ml-4">Step-by-step buying timeline.</li><li class="ml-4">Clarity on costs, fees, and taxes.</li><li class="ml-4">Mortgage and financing strategy.</li><li class="ml-4">Trusted lawyer and notary partners.</li></ul>',
  'Our consultations give you a full financial and legal roadmap before you commit. We align your budget, mortgage, and property needs.',
  'BOFU',
  'service',
  'Costa del Sol',
  'en',
  ARRAY['buyers', 'consultation', 'Costa del Sol', 'services'],
  '/schedule-consultation',
  'Schedule your consultation today',
  '2025-09-09'
);
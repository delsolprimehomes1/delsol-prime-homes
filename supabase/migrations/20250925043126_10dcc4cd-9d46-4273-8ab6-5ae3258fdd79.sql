-- Create missing contracts MOFU article
INSERT INTO qa_articles (
  slug, title, content, excerpt, funnel_stage, topic, city, language,
  h1_title, h2_title, tags, target_audience, intent, location_focus, last_updated
) VALUES (
  'spanish-property-contract-process-guide-costa-del-sol',
  'Spanish property contract process: complete guide for Costa del Sol buyers',
  'Navigate the Spanish property purchase contract process with confidence. Understanding each contract stage protects your interests and ensures a smooth transaction.

## The Spanish Property Contract Process

### Stage 1: Reservation Contract (Contrato de Reserva)
**Purpose**: Secures the property and removes it from the market
**Deposit**: Typically €3,000-€10,000 depending on property value
**Duration**: Usually 14-30 days to complete due diligence
**Key clauses**: Property description, price confirmation, completion timeline
**Your protection**: Deposit refundable if seller misrepresents property or legal issues discovered

### Stage 2: Private Purchase Contract (Contrato de Arras)
**Purpose**: Legally binding agreement between buyer and seller
**Deposit**: 10% of purchase price (held in lawyer''s client account)
**Duration**: 6-12 weeks to complete mortgage approval and final checks
**Key clauses**: Property condition, fixtures included, penalty clauses
**Your protection**: Seller pays double deposit if they withdraw; buyer forfeits deposit if they withdraw

### Stage 3: Public Deed (Escritura Pública)
**Purpose**: Final legal transfer of ownership
**Payment**: Remaining 90% of purchase price plus costs (10-12% additional)
**Location**: Notary office, all parties present or represented
**Documentation**: Property registration, tax clearances, mortgage deeds
**Result**: Legal ownership transferred, keys handed over

## Contract Protection Strategies

Understanding the Spanish contract process protects your interests and investment while ensuring legal compliance throughout your property purchase.',
  'Complete guide to Spanish property contracts covering reservation, private purchase, and public deed stages with protection strategies and risk management for Costa del Sol buyers.',
  'MOFU',
  'contracts',
  'Costa del Sol',
  'en',
  'Spanish Property Contracts: Complete Guide for Costa del Sol Buyers',
  'Understanding Reservation, Private Purchase, and Public Deed Contract Stages',
  ARRAY['spanish contracts', 'property purchase process', 'contract protection', 'legal process', 'costa del sol'],
  'International buyers navigating Spanish property contracts',
  'commercial',
  'Costa del Sol region',
  CURRENT_DATE
);

-- Create contracts BOFU article
INSERT INTO qa_articles (
  slug, title, content, excerpt, funnel_stage, topic, city, language,
  h1_title, h2_title, tags, target_audience, intent, location_focus, 
  appointment_booking_enabled, last_updated
) VALUES (
  'property-purchase-legal-checklist-costa-del-sol',
  'Property purchase legal checklist: essential steps for Costa del Sol buyers',
  'Ready to purchase Costa del Sol property? This comprehensive legal checklist ensures you complete all essential steps for a secure and compliant transaction.

## Pre-Contract Legal Checklist

### Essential Documentation Review
- [ ] **Property title deeds** (Escritura) reviewed by independent lawyer
- [ ] **Property registry search** (Registro de la Propiedad) completed
- [ ] **Debt certificate** (Nota Simple) confirms no outstanding mortgages or charges
- [ ] **Tax clearance certificates** (IBI, community fees) obtained

**Ready to secure your Costa del Sol property purchase?** Book a consultation with our legal team to ensure full compliance and protection throughout your transaction.',
  'Complete legal checklist for Costa del Sol property purchases with pre-contract, completion, and post-purchase requirements to ensure secure and compliant transactions.',
  'BOFU',
  'contracts',
  'Costa del Sol',
  'en',
  'Costa del Sol Property Purchase: Complete Legal Checklist & Compliance Guide',
  'Essential Legal Steps from Contract to Completion and Beyond',
  ARRAY['legal checklist', 'property purchase', 'spanish law', 'completion process', 'legal compliance'],
  'International buyers ready to purchase Costa del Sol property',
  'transactional',
  'Costa del Sol region',
  true,
  CURRENT_DATE
);
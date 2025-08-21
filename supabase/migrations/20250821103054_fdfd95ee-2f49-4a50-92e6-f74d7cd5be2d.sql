-- Seed blog posts with the three starter posts
INSERT INTO public.blog_posts (
  title, slug, excerpt, content, featured_image, image_alt, category_key, 
  meta_title, meta_description, keywords, canonical_url, city_tags, 
  published_at, language
) VALUES
-- English posts
('Costa del Sol Luxury Market Update 2025', 'costa-del-sol-luxury-market-update-2025', 
'Prices, time on market, and buyer demand across Marbella, Estepona, Fuengirola, Benalmádena, and Mijas.',
'## Quick take
You want a fast read before you book viewings. Use this.

- Buyer demand stays strong in prime zones near the coast
- New build stock grows in Estepona and Mijas
- Sea view homes move faster than inland homes
- Price gaps widen between renovated and dated listings

## Prices and time on market
Price levels vary by city and micro location. Sea views, new build status, and walkability lift values. Homes with fresh kitchens, cooling, and outdoor zones attract more qualified buyers and close faster.

## What moves first
- Turnkey villas with energy labels A or B
- Apartments in walkable areas near beach clubs and marinas
- Penthouses with private terraces and secure parking

## Where buyers look
- Marbella Golden Mile for brand value and lifestyle
- Estepona New Golden Mile for space and new build choice
- Fuengirola west for rail links and yield
- Benalmádena for family services and schools
- Mijas Costa for value near golf

## Action for you
- Set a price band before tours
- Shortlist three areas
- Ask for floor plans, energy labels, and service charges
- Book a private viewing and a virtual tour on the same day',
'/src/assets/blog/costa-del-sol-luxury-market-update-2025.webp',
'Sunset over a modern villa with pool on the Costa del Sol',
'market-update',
'Costa del Sol Luxury Market Update 2025 | Del Sol Prime Homes',
'Latest luxury real estate market trends across Marbella, Estepona, Fuengirola, Benalmádena, and Mijas. Expert analysis and buyer insights.',
ARRAY['Costa del Sol', 'luxury market', 'real estate trends', 'Marbella', 'Estepona'],
'https://delsolprimehomes.com/blog/costa-del-sol-luxury-market-update-2025',
ARRAY['Marbella', 'Estepona', 'Fuengirola', 'Benalmádena', 'Mijas'],
'2025-01-15 10:00:00+00', 'en'),

('How to Buy a Villa in Marbella: A 10 Step Checklist', 'how-to-buy-a-villa-in-marbella-checklist',
'Clear steps from budget to keys. Use this plan to avoid delays and protect your timeline.',
'## The plan
Follow these steps. Save hours.

1. Define budget with a proof of funds letter
2. Pick the zone Golden Mile, Sierra Blanca, Nueva Andalucía, or East
3. Set must haves bedrooms, plot size, parking, pool, sea view
4. Get a buyer agent agreement and viewing schedule
5. Request floor plans, energy label, IBI, and community fees
6. Line up a local lawyer with POA ready
7. Open a Spanish bank account and secure funds
8. Agree price and sign the reservation
9. Complete due diligence and sign the private contract
10. Close at the notary and change utilities

## Tips that save time
- Book one day for tours and one day for follow ups
- Ask for a virtual tour before flights
- Prepare ID, tax number request, and bank details
- Bring a short list of three homes to second viewings',
'/src/assets/blog/how-to-buy-a-villa-in-marbella-checklist.webp',
'Modern Marbella villa with palm trees and a private pool',
'buying-guides',
'How to Buy a Villa in Marbella: Complete 10 Step Guide',
'Step-by-step checklist for buying luxury villas in Marbella. Expert guide from budget to keys with timeline protection.',
ARRAY['Marbella villa', 'buying guide', 'property purchase', 'checklist', 'Golden Mile'],
'https://delsolprimehomes.com/blog/how-to-buy-a-villa-in-marbella-checklist',
ARRAY['Marbella'],
'2025-01-10 10:00:00+00', 'en'),

('Best Areas for Investment on the Costa del Sol', 'best-areas-for-investment-costa-del-sol',
'Where buyers pick first and why. Focus on demand drivers and yield in Marbella, Estepona, Fuengirola, Benalmádena, and Mijas.',
'## What drives value
- Sea views and walkable locations
- New build quality and energy labels
- Community services, security, and parking
- Rail links and school access

## City by city
**Marbella**  
Prime brand value, strong lifestyle pull, high resale depth.

**Estepona**  
New Golden Mile offers space, beachside options, and steady launch cycles.

**Fuengirola**  
Rail to the airport and Málaga. Solid holiday rental demand.

**Benalmádena**  
Family services, marina access, and good road links.

**Mijas Costa**  
Golf, larger plots, and value near the coast.

## Action list
- Pick one city and one micro area
- Target A or B energy labels where possible
- Ask for service charge, IBI, and rental rules before offers
- Plan for a light refresh budget on older homes',
'/src/assets/blog/best-areas-for-investment-costa-del-sol.webp',
'Aerial view of Costa del Sol coastline with beaches and luxury homes',
'investment',
'Best Investment Areas Costa del Sol 2025 | Property Guide',
'Top investment locations on Costa del Sol. Analysis of Marbella, Estepona, Fuengirola, Benalmádena & Mijas for property investors.',
ARRAY['Costa del Sol investment', 'property investment', 'real estate yield', 'Marbella investment'],
'https://delsolprimehomes.com/blog/best-areas-for-investment-costa-del-sol',
ARRAY['Marbella', 'Estepona', 'Fuengirola', 'Benalmádena', 'Mijas'],
'2025-01-05 10:00:00+00', 'en');
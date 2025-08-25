-- Insert sample blog posts for the Costa del Sol luxury real estate blog

-- Insert blog categories first
INSERT INTO blog_categories (key, name, description, language, sort_order) VALUES
('market-update', 'Market Update', 'Latest market trends and analysis', 'en', 1),
('buying-guides', 'Buying Guides', 'Step-by-step property buying guidance', 'en', 2),
('investment', 'Investment', 'Investment opportunities and tips', 'en', 3)
ON CONFLICT (key, language) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
sort_order = EXCLUDED.sort_order;

-- Insert the three sample blog posts
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  featured_image, 
  image_alt, 
  category_key, 
  published_at, 
  language,
  meta_title,
  meta_description,
  keywords,
  city_tags,
  tags,
  canonical_url,
  author,
  status
) VALUES 
(
  'Costa del Sol Luxury Market Update 2025',
  'costa-del-sol-luxury-market-update-2025',
  'Buyer demand stays strong in prime zones. Average list price above 2M euros. Days on market ranges from 42 to 68. New supply improves choice in Nueva Andalucía and East Marbella. See trends and next steps for your search.',
  '<h1>What is the Costa del Sol luxury market like in 2025?</h1>

<p>The Costa del Sol luxury property market shows strong fundamentals in 2025. Prime coastal zones maintain buyer interest despite global economic shifts.</p>

<h2>Key Market Metrics</h2>
<ul>
<li>Average luxury property price: €2.1M (up 3.2% year-over-year)</li>
<li>Days on market: 42-68 days depending on location</li>
<li>New construction permits: +12% in Nueva Andalucía</li>
<li>Foreign buyer percentage: 76% of luxury transactions</li>
</ul>

<h2>Which areas show the strongest demand?</h2>
<p>Marbella Golden Mile leads luxury sales volume. East Marbella attracts families seeking modern amenities. Nueva Andalucía benefits from new supply and golf course proximity.</p>

<h3>Price Performance by Zone</h3>
<ul>
<li>Marbella Golden Mile: €8,500-€15,000 per m²</li>
<li>Nueva Andalucía: €4,200-€7,800 per m²</li>
<li>East Marbella: €3,800-€6,500 per m²</li>
<li>Estepona New Golden Mile: €3,200-€5,400 per m²</li>
</ul>

<h2>What drives buyer decisions in 2025?</h2>
<p>Sea views remain the top priority. Parking spaces and security systems rank high. Energy efficiency labels influence value perception.</p>

<p>Properties with A or B energy ratings sell 15% faster than those with lower ratings. Smart home features add 3-5% to final sale prices.</p>

<h2>Market outlook for the next 12 months</h2>
<p>New supply will increase choice for buyers. Interest rates may stabilize. Rental yield expectations remain at 4-6% for prime areas.</p>

<p>We expect continued international interest, particularly from Northern European buyers seeking second homes and investment properties.</p>',
  '/assets/blog/costa-del-sol-luxury-market-update-2025.webp',
  'Luxury villa with pool at sunset in Marbella overlooking the Mediterranean Sea',
  'market-update',
  '2025-01-15T10:00:00Z',
  'en',
  'Costa del Sol Luxury Market Update 2025 - Latest Trends & Prices',
  'Get the latest Costa del Sol luxury property market analysis. Price trends, buyer demand, and investment insights for Marbella, Estepona, and prime coastal areas.',
  ARRAY['Costa del Sol', 'luxury real estate', 'Marbella', 'property prices', 'market update', 'investment'],
  ARRAY['Marbella', 'Estepona', 'Nueva Andalucía', 'East Marbella'],
  ARRAY['market analysis', 'luxury properties', 'property investment', 'real estate trends'],
  'https://delsolprimehomes.com/blog/costa-del-sol-luxury-market-update-2025',
  'DelSolPrimeHomes',
  'published'
),
(
  'How to Buy a Villa in Marbella',
  'how-to-buy-a-villa-in-marbella',
  'Follow a simple plan. Secure proof of funds. Choose the zone. Set must-have features. Book viewings. Hire a local lawyer. Sign the reservation. Complete due diligence. Close at the notary. This guide saves time and reduces risk.',
  '<h1>How do you buy a villa in Marbella successfully?</h1>

<p>Buying a villa in Marbella requires clear planning and local expertise. Follow this proven 10-step process to secure your dream property without delays or surprises.</p>

<h2>Step 1: Secure Proof of Funds</h2>
<p>Obtain bank statements showing available capital. Include mortgage pre-approval if financing. Spanish sellers expect financial verification before serious negotiations.</p>

<h2>Step 2: Choose Your Target Zone</h2>
<p>Marbella offers distinct neighborhoods with different benefits:</p>
<ul>
<li>Golden Mile: Prestige location, beachfront access, established luxury</li>
<li>Nueva Andalucía: Golf courses, restaurants, family-friendly</li>
<li>East Marbella: Modern developments, sea views, good value</li>
<li>Old Town: Character properties, walking distance to amenities</li>
</ul>

<h2>Step 3: Define Must-Have Features</h2>
<p>Create a prioritized list of requirements:</p>
<ul>
<li>Sea views or mountain views</li>
<li>Pool and garden size</li>
<li>Number of bedrooms and bathrooms</li>
<li>Parking spaces needed</li>
<li>Security features</li>
</ul>

<h2>Step 4: Book Property Viewings</h2>
<p>Schedule visits during different times of day. Check afternoon sun exposure. Test parking access. Verify claimed features match reality.</p>

<h2>Step 5: Hire a Local Lawyer</h2>
<p>Select a Spanish property lawyer before making offers. They will handle legal due diligence, contract review, and completion procedures.</p>

<h2>Step 6: Make Your Offer</h2>
<p>Submit written offers through your agent. Include contingencies for surveys and legal checks. Expect negotiation on price and completion timeline.</p>

<h2>Step 7: Sign the Reservation Contract</h2>
<p>Pay 10-20% deposit to secure the property. This removes it from the market while you complete due diligence.</p>

<h2>Step 8: Complete Due Diligence</h2>
<p>Your lawyer will verify:</p>
<ul>
<li>Clear title and ownership</li>
<li>Planning permissions and compliance</li>
<li>Outstanding debts or charges</li>
<li>Community fees and obligations</li>
</ul>

<h2>Step 9: Arrange Final Financing</h2>
<p>Complete mortgage applications if needed. Transfer remaining funds to your Spanish account. Confirm all payments are ready for completion.</p>

<h2>Step 10: Complete at the Notary</h2>
<p>Both parties sign the final deed at the notary office. Pay remaining balance plus taxes and fees. Receive keys and legal ownership.</p>

<h2>Additional costs to budget</h2>
<p>Expect 10-12% of purchase price for:</p>
<ul>
<li>Transfer tax (ITP): 8-10%</li>
<li>Legal fees: 1-1.5%</li>
<li>Notary and registration: 0.5-1%</li>
<li>Survey and checks: 500-1,500 euros</li>
</ul>

<p>This systematic approach helps you avoid common pitfalls and ensures a smooth purchase process in Marbella luxury property market.</p>',
  '/assets/blog/how-to-buy-a-villa-in-marbella-checklist.webp',
  'Modern luxury villa in Marbella with palm trees and swimming pool in sunny courtyard',
  'buying-guides',
  '2025-01-10T09:00:00Z',
  'en',
  'How to Buy a Villa in Marbella: Complete 10-Step Guide',
  'Complete guide to buying a villa in Marbella. Step-by-step process, legal requirements, costs, and expert tips for a successful luxury property purchase.',
  ARRAY['buy villa Marbella', 'Marbella property guide', 'luxury villa purchase', 'Spain property buying'],
  ARRAY['Marbella', 'Golden Mile', 'Nueva Andalucía', 'East Marbella'],
  ARRAY['villa buying guide', 'property purchase', 'Marbella real estate', 'luxury homes'],
  'https://delsolprimehomes.com/blog/how-to-buy-a-villa-in-marbella',
  'DelSolPrimeHomes',
  'published'
),
(
  'Best Areas for Investment on the Costa del Sol',
  'best-areas-for-investment-costa-del-sol',
  'Prime coastal zones lead on yield and resale strength. Buyers target Golden Mile, Sierra Blanca, La Cala, and Benalmádena Pueblo. Learn drivers for price growth and what to expect by budget.',
  '<h1>Which Costa del Sol areas offer the best investment returns?</h1>

<p>Coastal Spain property investment requires location analysis and yield calculation. These five areas consistently deliver strong returns for luxury property investors.</p>

<h2>Golden Mile, Marbella</h2>
<p>The Golden Mile remains the premium investment choice. Properties here benefit from:</p>
<ul>
<li>Established luxury reputation</li>
<li>Walking distance to Puerto Banús</li>
<li>Beach club access</li>
<li>Strong rental demand year-round</li>
<li>Excellent resale liquidity</li>
</ul>

<p><strong>Investment profile:</strong> €3M-€15M entry point. Expected yield: 3-5% rental. Capital appreciation: 3-6% annually.</p>

<h2>Nueva Andalucía, Marbella</h2>
<p>Nueva Andalucía attracts families and golf enthusiasts. Key advantages:</p>
<ul>
<li>Multiple golf courses within 10 minutes</li>
<li>International schools nearby</li>
<li>Restaurants and shopping at Puerto Banús</li>
<li>New development options available</li>
</ul>

<p><strong>Investment profile:</strong> €1.5M-€8M entry point. Expected yield: 4-6% rental. Strong potential for capital growth.</p>

<h2>New Golden Mile, Estepona</h2>
<p>Estepona New Golden Mile offers modern luxury at lower entry prices:</p>
<ul>
<li>New beachfront developments</li>
<li>Growing infrastructure investment</li>
<li>20 minutes to Marbella center</li>
<li>Beach access and mountain views</li>
</ul>

<p><strong>Investment profile:</strong> €800K-€4M entry point. Expected yield: 5-7% rental. High growth potential.</p>

<h2>Benalmádena Pueblo</h2>
<p>Traditional Spanish village with luxury amenities:</p>
<ul>
<li>Authentic Andalusian architecture</li>
<li>Panoramic sea views</li>
<li>25 minutes to Málaga airport</li>
<li>Growing expat community</li>
</ul>

<p><strong>Investment profile:</strong> €400K-€2M entry point. Expected yield: 6-8% rental. Emerging luxury market.</p>

<h2>La Cala de Mijas</h2>
<p>Beachfront location with village charm:</p>
<ul>
<li>Blue flag beaches</li>
<li>Golf resort access</li>
<li>Traditional Spanish atmosphere</li>
<li>Strong British buyer demand</li>
</ul>

<p><strong>Investment profile:</strong> €500K-€3M entry point. Expected yield: 5-7% rental. Steady appreciation.</p>

<h2>What drives investment success?</h2>

<h3>Location factors that increase value:</h3>
<ul>
<li>Sea views or golf course frontage</li>
<li>Walking distance to amenities</li>
<li>Secure gated communities</li>
<li>Quality construction and finishes</li>
<li>Parking and storage space</li>
</ul>

<h3>Rental demand drivers:</h3>
<ul>
<li>Pool and outdoor space</li>
<li>Air conditioning throughout</li>
<li>Modern kitchen and bathrooms</li>
<li>Beach or golf access</li>
<li>Professional management available</li>
</ul>

<h2>Investment strategy by budget</h2>

<p><strong>€500K-€1M:</strong> Focus on Benalmádena, La Cala, or East Marbella apartments with sea views.</p>

<p><strong>€1M-€3M:</strong> Consider Nueva Andalucía villas or New Golden Mile penthouses.</p>

<p><strong>€3M+:</strong> Target Golden Mile properties or Sierra Blanca luxury villas.</p>

<h2>Key risks to avoid</h2>
<ul>
<li>Properties without legal licenses</li>
<li>Overpriced developments far from amenities</li>
<li>Areas with high community fees</li>
<li>Properties needing major renovation</li>
</ul>

<p>Successful Costa del Sol investment requires local market knowledge and careful location selection. Focus on established areas with proven rental demand and strong resale potential.</p>',
  '/assets/blog/best-areas-for-investment-costa-del-sol.webp',
  'Aerial view of Costa del Sol coastline showing beaches luxury developments and mountain backdrop',
  'investment',
  '2025-01-05T08:00:00Z',
  'en',
  'Best Areas for Investment on Costa del Sol: Complete Guide 2025',
  'Discover the top Costa del Sol areas for property investment. Analysis of yields, capital growth, and market trends in Marbella, Estepona, and beyond.',
  ARRAY['Costa del Sol investment', 'Marbella property investment', 'Spanish real estate', 'luxury property investment'],
  ARRAY['Marbella', 'Estepona', 'Nueva Andalucía', 'Benalmádena', 'La Cala de Mijas'],
  ARRAY['property investment', 'real estate returns', 'luxury investment', 'Spanish property'],
  'https://delsolprimehomes.com/blog/best-areas-for-investment-costa-del-sol',
  'DelSolPrimeHomes',
  'published'
)
ON CONFLICT (slug, language) DO UPDATE SET
title = EXCLUDED.title,
excerpt = EXCLUDED.excerpt,
content = EXCLUDED.content,
featured_image = EXCLUDED.featured_image,
image_alt = EXCLUDED.image_alt,
category_key = EXCLUDED.category_key,
published_at = EXCLUDED.published_at,
meta_title = EXCLUDED.meta_title,
meta_description = EXCLUDED.meta_description,
keywords = EXCLUDED.keywords,
city_tags = EXCLUDED.city_tags,
tags = EXCLUDED.tags,
canonical_url = EXCLUDED.canonical_url,
updated_at = now();
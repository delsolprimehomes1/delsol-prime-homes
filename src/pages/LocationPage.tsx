import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, Building2, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface LocationData {
  name: string;
  h1: string;
  description: string;
  metaDescription: string;
  heroImage: string;
  overview: string;
  marketData: {
    avgPrice: string;
    priceRange: string;
    priceGrowth: string;
    popularTypes: string[];
  };
  neighborhoods: Array<{
    name: string;
    description: string;
    type: string;
  }>;
  buyingProcess: string[];
  whyBuy: string[];
  keyFeatures: string[];
}

const locationData: Record<string, LocationData> = {
  marbella: {
    name: 'Marbella',
    h1: 'Luxury Properties in Marbella - Costa del Sol Premier Destination',
    description: 'Discover exclusive villas and apartments in Marbella, the jewel of Costa del Sol. Expert guidance for UK buyers seeking Mediterranean luxury.',
    metaDescription: 'Buy luxury property in Marbella, Costa del Sol. Expert guidance for UK buyers on villas, apartments & investment opportunities in Spain\'s premier destination.',
    heroImage: '/assets/locations/marbella-hero.jpg',
    overview: 'Marbella is the crown jewel of the Costa del Sol, renowned worldwide for its luxury lifestyle, pristine beaches, world-class amenities, and year-round sunshine. With over 300 days of sun per year, stunning mountain backdrops, and proximity to international airports, Marbella offers an unparalleled Mediterranean lifestyle for UK buyers.',
    marketData: {
      avgPrice: '€4,500 per m²',
      priceRange: '€300,000 - €15,000,000+',
      priceGrowth: '+8.2% annually',
      popularTypes: ['Luxury Villas', 'Beachfront Apartments', 'Golf Properties', 'Penthouses']
    },
    neighborhoods: [
      {
        name: 'Golden Mile',
        description: 'Ultra-luxury beachfront properties between Marbella and Puerto Banús, featuring exclusive villas and high-end apartments.',
        type: 'Ultra-Luxury'
      },
      {
        name: 'Puerto Banús',
        description: 'Marina-adjacent lifestyle with designer boutiques, gourmet restaurants, and prestigious penthouses.',
        type: 'Marina Living'
      },
      {
        name: 'Nueva Andalucía',
        description: 'Golf valley with family villas, international schools, and resort-style amenities.',
        type: 'Golf & Family'
      },
      {
        name: 'Old Town (Casco Antiguo)',
        description: 'Charming historic center with authentic Spanish character and boutique apartments.',
        type: 'Historic'
      }
    ],
    buyingProcess: [
      'Obtain NIE number (tax identification)',
      'Open Spanish bank account',
      'Engage independent lawyer',
      'Property valuation and survey',
      'Sign preliminary contract (10% deposit)',
      'Complete due diligence checks',
      'Sign Escritura (title deed) at notary',
      'Register property with Land Registry'
    ],
    whyBuy: [
      'Year-round sunshine (320+ days)',
      'Direct flights from UK (2.5 hours)',
      'World-class golf courses (60+ nearby)',
      'International schools and healthcare',
      'Luxury amenities and restaurants',
      'Strong rental yields (5-8%)',
      'Capital appreciation potential',
      'Stable property market'
    ],
    keyFeatures: [
      'Beachfront promenades',
      'Michelin-star dining',
      'Designer shopping',
      'Water sports & marinas',
      'Mountain hiking trails',
      'Cultural events & festivals'
    ]
  },
  estepona: {
    name: 'Estepona',
    h1: 'Estepona Property - Authentic Costa del Sol Living',
    description: 'Explore properties in Estepona, the "Garden of Costa del Sol". Discover authentic Spanish charm with modern amenities for UK buyers.',
    metaDescription: 'Buy property in Estepona, Costa del Sol. Authentic Spanish charm, new developments, and excellent value for UK buyers seeking Mediterranean lifestyle.',
    heroImage: '/assets/locations/estepona-hero.jpg',
    overview: 'Estepona combines authentic Andalusian charm with modern development, offering excellent value compared to neighboring Marbella. Known as the "Garden of Costa del Sol" for its flower-adorned streets, Estepona provides a relaxed Mediterranean lifestyle with stunning beaches, a charming old town, and rapidly developing infrastructure.',
    marketData: {
      avgPrice: '€2,800 per m²',
      priceRange: '€180,000 - €2,500,000',
      priceGrowth: '+9.5% annually',
      popularTypes: ['New Build Apartments', 'Townhouses', 'Beachside Villas', 'Investment Properties']
    },
    neighborhoods: [
      {
        name: 'Estepona Port Area',
        description: 'Modern marina development with restaurants, shops, and contemporary apartments.',
        type: 'Marina Living'
      },
      {
        name: 'Old Town (Casco Antiguo)',
        description: 'Traditional whitewashed houses, tapas bars, and authentic Spanish atmosphere.',
        type: 'Historic'
      },
      {
        name: 'New Golden Mile',
        description: 'Coastal area between Estepona and Marbella with luxury developments and beach clubs.',
        type: 'Beachfront'
      },
      {
        name: 'Cancelada',
        description: 'Residential area with modern amenities, supermarkets, and family-friendly environment.',
        type: 'Family Residential'
      }
    ],
    buyingProcess: [
      'Obtain NIE number (essential first step)',
      'Set up Spanish bank account',
      'Hire independent solicitor',
      'Property inspection and valuation',
      'Reserve with deposit (typically €6,000)',
      'Sign Arras contract (10% deposit)',
      'Complete legal due diligence',
      'Final completion at notary office'
    ],
    whyBuy: [
      'Excellent value for money',
      'Authentic Spanish atmosphere',
      'Growing infrastructure investment',
      'Beautiful beaches (21km coastline)',
      'Lower property taxes vs Marbella',
      'Strong rental demand',
      'Modern hospitals and schools',
      'Easy access to Gibraltar and Málaga'
    ],
    keyFeatures: [
      'Orchid House botanical garden',
      '21 km of beaches',
      'Traditional Spanish markets',
      'New marina development',
      'Coastal walking paths',
      'Golf courses nearby'
    ]
  },
  fuengirola: {
    name: 'Fuengirola',
    h1: 'Fuengirola Property - Family-Friendly Costa del Sol',
    description: 'Find your ideal property in Fuengirola. Family-friendly beaches, excellent transport links, and vibrant expat community for UK buyers.',
    metaDescription: 'Buy property in Fuengirola, Costa del Sol. Family-friendly location with great beaches, transport links, and established expat community.',
    heroImage: '/assets/locations/fuengirola-hero.jpg',
    overview: 'Fuengirola is a popular family destination on the Costa del Sol, offering 8km of sandy beaches, a charming old town, and excellent transport connections. With a large established expat community, modern amenities, and more affordable property prices, Fuengirola is ideal for UK buyers seeking year-round sunshine and a relaxed lifestyle.',
    marketData: {
      avgPrice: '€2,400 per m²',
      priceRange: '€150,000 - €1,200,000',
      priceGrowth: '+7.8% annually',
      popularTypes: ['Beachside Apartments', 'Family Apartments', 'Investment Studios', 'Townhouses']
    },
    neighborhoods: [
      {
        name: 'Los Boliches',
        description: 'Eastern district with long beach promenade, local atmosphere, and good value properties.',
        type: 'Beachfront'
      },
      {
        name: 'Town Centre',
        description: 'Central location near shops, restaurants, and transport hub with convenient amenities.',
        type: 'Urban Living'
      },
      {
        name: 'Torreblanca',
        description: 'Hillside residential area with sea views, quieter atmosphere, and family properties.',
        type: 'Residential Hills'
      },
      {
        name: 'Carvajal',
        description: 'Western area near river mouth with beaches, chiringuitos, and modern developments.',
        type: 'Beach Living'
      }
    ],
    buyingProcess: [
      'Apply for NIE certificate',
      'Open Spanish bank account',
      'Find independent legal advisor',
      'View properties with registered agent',
      'Make offer and pay reservation',
      'Sign purchase contract (10% deposit)',
      'Legal checks and surveys',
      'Complete at notary with final payment'
    ],
    whyBuy: [
      'Affordable property prices',
      'Excellent train connections',
      '8km of sandy beaches',
      'Large expat community',
      'Family-friendly atmosphere',
      'Year-round activities',
      'International schools nearby',
      'Close to Málaga airport (25 mins)'
    ],
    keyFeatures: [
      'Bioparc Zoo',
      'Castle ruins (Sohail)',
      'Weekly markets',
      'Water sports center',
      'Seaside promenade',
      'Tapas bars & restaurants'
    ]
  },
  benalmadena: {
    name: 'Benalmádena',
    h1: 'Benalmádena Property - Coastal Living & Entertainment',
    description: 'Discover properties in Benalmádena. Marina living, theme parks, and stunning sea views for UK buyers on Costa del Sol.',
    metaDescription: 'Buy property in Benalmádena, Costa del Sol. Marina apartments, sea view villas, and entertainment options perfect for UK families and investors.',
    heroImage: '/assets/locations/benalmadena-hero.jpg',
    overview: 'Benalmádena offers diverse living options across three distinct areas: the traditional pueblo, the coastal zone with beaches and marina, and Arroyo de la Miel with shops and amenities. With an award-winning marina, theme parks, and cable car to mountain peaks, Benalmádena combines entertainment with authentic Spanish lifestyle.',
    marketData: {
      avgPrice: '€2,600 per m²',
      priceRange: '€160,000 - €1,800,000',
      priceGrowth: '+8.1% annually',
      popularTypes: ['Marina Apartments', 'Sea View Properties', 'Pueblo Houses', 'Investment Properties']
    },
    neighborhoods: [
      {
        name: 'Puerto Marina',
        description: 'Award-winning marina with restaurants, shops, and luxury apartments overlooking yachts.',
        type: 'Marina Living'
      },
      {
        name: 'Benalmádena Pueblo',
        description: 'Traditional hilltop village with whitewashed houses, stunning views, and authentic character.',
        type: 'Traditional Village'
      },
      {
        name: 'Arroyo de la Miel',
        description: 'Central hub with shopping center, train station, and residential properties.',
        type: 'Urban Center'
      },
      {
        name: 'Torrequebrada',
        description: 'Coastal area with golf course, casino, and beachfront developments.',
        type: 'Golf & Beach'
      }
    ],
    buyingProcess: [
      'Secure NIE number (tax ID)',
      'Establish Spanish bank account',
      'Appoint independent lawyer',
      'Property viewing and selection',
      'Reservation agreement with deposit',
      'Sign Contrato de Arras (10% payment)',
      'Complete property checks',
      'Sign Escritura at notary office'
    ],
    whyBuy: [
      'Award-winning marina',
      'Family entertainment options',
      'Cable car to mountain peaks',
      'Excellent transport links',
      'Modern amenities and services',
      'Strong rental market',
      'Golf courses nearby',
      'Close to Málaga airport (20 mins)'
    ],
    keyFeatures: [
      'Tivoli World theme park',
      'Sea Life aquarium',
      'Butterfly park',
      'Buddhist temple (Stupa)',
      'Cable car (Teleférico)',
      'Marina nightlife'
    ]
  },
  mijas: {
    name: 'Mijas',
    h1: 'Mijas Property - Mountain Views & Golf Living',
    description: 'Explore properties in Mijas and Mijas Costa. Mountain pueblo charm and coastal golf resorts for UK buyers seeking authentic Spain.',
    metaDescription: 'Buy property in Mijas, Costa del Sol. Traditional pueblo with stunning views or golf resort living in Mijas Costa. Expert guidance for UK buyers.',
    heroImage: '/assets/locations/mijas-hero.jpg',
    overview: 'Mijas encompasses the picturesque mountain village of Mijas Pueblo and the coastal area of Mijas Costa (including La Cala de Mijas). The pueblo offers traditional Spanish charm with donkey taxis and artisan shops, while the coast provides golf resorts, beaches, and modern developments, creating diverse options for UK buyers.',
    marketData: {
      avgPrice: '€2,500 per m²',
      priceRange: '€170,000 - €2,000,000',
      priceGrowth: '+8.5% annually',
      popularTypes: ['Golf Villas', 'Pueblo Apartments', 'Coastal Properties', 'Country Homes']
    },
    neighborhoods: [
      {
        name: 'Mijas Pueblo',
        description: 'Traditional mountain village with stunning views, artisan shops, and authentic atmosphere.',
        type: 'Traditional Village'
      },
      {
        name: 'La Cala de Mijas',
        description: 'Coastal resort town with beaches, golf courses, and family-friendly amenities.',
        type: 'Beach Resort'
      },
      {
        name: 'Calahonda',
        description: 'Established residential area with commercial center, supermarkets, and sea views.',
        type: 'Residential'
      },
      {
        name: 'Riviera del Sol',
        description: 'Golf and beach community with mixed developments and international residents.',
        type: 'Golf Living'
      }
    ],
    buyingProcess: [
      'Obtain NIE (foreigner ID number)',
      'Open bank account in Spain',
      'Hire independent legal counsel',
      'Property selection and viewing',
      'Make formal offer with reservation',
      'Pay 10% deposit (Arras contract)',
      'Due diligence and legal checks',
      'Final signing at notary office'
    ],
    whyBuy: [
      'Panoramic mountain and sea views',
      'Traditional Spanish culture',
      'Multiple golf courses',
      'Lower property taxes',
      'Authentic atmosphere',
      'Growing infrastructure',
      'Family-friendly environment',
      'Good rental potential'
    ],
    keyFeatures: [
      'Donkey taxis (pueblo)',
      'Artisan craft shops',
      'Multiple golf courses',
      'Hiking trails',
      'Traditional markets',
      'Coastal promenade'
    ]
  }
};

export default function LocationPage() {
  const { location, propertyType } = useParams<{ location: string; propertyType?: string }>();
  
  const data = location ? locationData[location] : null;
  
  if (!data) {
    return <Navigate to="/qa" replace />;
  }
  
  const pageTitle = propertyType 
    ? `${data.name} ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} for Sale`
    : `${data.name} Property for Sale`;
  
  const canonicalUrl = `https://delsolprimehomes.com/${location}${propertyType ? `/${propertyType}` : ''}`;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": `DelSol Prime Homes - ${data.name}`,
    "description": data.metaDescription,
    "url": canonicalUrl,
    "areaServed": {
      "@type": "City",
      "name": data.name,
      "containedInPlace": {
        "@type": "Place",
        "name": "Costa del Sol",
        "containedInPlace": {
          "@type": "Country",
          "name": "Spain"
        }
      }
    },
    "priceRange": data.marketData.priceRange,
    "knowsAbout": data.marketData.popularTypes
  };
  
  return (
    <>
      <Helmet>
        <title>{pageTitle} | DelSolPrimeHomes</title>
        <meta name="description" content={data.metaDescription} />
        <meta name="keywords" content={`${data.name} property, ${data.name} real estate, buy ${data.name}, Costa del Sol, Spain property, UK buyers`} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20 bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <Badge variant="secondary" className="mb-4">
                <MapPin className="w-3 h-3 mr-1" />
                Costa del Sol, Spain
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.h1}</h1>
              <p className="text-xl text-muted-foreground mb-8">{data.description}</p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">
                  View Properties
                </Button>
                <Button size="lg" variant="outline">
                  Contact Expert
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Why Buy Property in {data.name}?</h2>
            <p className="text-lg text-muted-foreground mb-8">{data.overview}</p>
            
            {/* Market Data Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Average Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.marketData.avgPrice}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.marketData.priceRange}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Price Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{data.marketData.priceGrowth}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Property Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{data.marketData.popularTypes.length}+ types</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Key Benefits of {data.name}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.whyBuy.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p>{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Neighborhoods */}
        <section className="py-12 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Popular Areas in {data.name}</h2>
            <div className="grid gap-6">
              {data.neighborhoods.map((area, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{area.name}</CardTitle>
                        <Badge variant="outline">{area.type}</Badge>
                      </div>
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{area.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Buying Process */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Property Buying Process in {data.name}</h2>
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    {data.buyingProcess.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <p className="pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Property in {data.name}?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our expert team specializes in helping UK buyers navigate the Spanish property market with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <Home className="w-5 h-5 mr-2" />
                Browse Properties
              </Button>
              <Button size="lg" variant="outline">
                <Users className="w-5 h-5 mr-2" />
                Contact Our Team
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

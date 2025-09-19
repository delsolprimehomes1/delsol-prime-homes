// Geographic data and coordinates for Costa del Sol area coverage

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface GeoAreaData {
  areaServed: string[];
  coordinates: Record<string, GeoCoordinates>;
  mainCity?: string;
  province?: string;
  country?: string;
}

// Costa del Sol town coordinates for geo targeting
export const COSTA_DEL_SOL_COORDINATES: Record<string, GeoCoordinates> = {
  'Marbella': { lat: 36.5099, lng: -4.8857 },
  'Estepona': { lat: 36.4256, lng: -5.1511 },
  'Mijas': { lat: 36.5943, lng: -4.6336 },
  'Fuengirola': { lat: 36.5397, lng: -4.6262 },
  'Benalmadena': { lat: 36.5988, lng: -4.5166 },
  'Torremolinos': { lat: 36.6203, lng: -4.4999 },
  'Malaga': { lat: 36.7213, lng: -4.4214 },
  'Nerja': { lat: 36.7521, lng: -3.8779 },
  'Manilva': { lat: 36.3439, lng: -5.2497 },
  'Casares': { lat: 36.4444, lng: -5.2777 }
};

// Default geo data for all Costa del Sol content
export const DEFAULT_GEO_DATA: GeoAreaData = {
  areaServed: [
    'Costa del Sol',
    'Marbella',
    'Estepona', 
    'Mijas',
    'Fuengirola',
    'Benalmadena',
    'Torremolinos'
  ],
  coordinates: COSTA_DEL_SOL_COORDINATES,
  mainCity: 'Marbella',
  province: 'Malaga',
  country: 'Spain'
};

// Generate geo-specific article metadata
export const generateGeoMetadata = (city?: string): GeoAreaData => {
  const baseData = { ...DEFAULT_GEO_DATA };
  
  if (city && COSTA_DEL_SOL_COORDINATES[city]) {
    // Prioritize specific city in areaServed array
    baseData.areaServed = [
      city,
      'Costa del Sol',
      ...baseData.areaServed.filter(area => area !== city && area !== 'Costa del Sol')
    ];
    baseData.mainCity = city;
  }
  
  return baseData;
};

// Extract city from article content or tags
export const detectArticleCity = (article: any): string | undefined => {
  const cityKeywords = Object.keys(COSTA_DEL_SOL_COORDINATES);
  
  // Check title first
  const titleMatch = cityKeywords.find(city => 
    article.title?.toLowerCase().includes(city.toLowerCase())
  );
  if (titleMatch) return titleMatch;
  
  // Check tags
  if (article.city_tags?.length > 0) {
    const tagMatch = cityKeywords.find(city =>
      article.city_tags.some((tag: string) => 
        tag.toLowerCase().includes(city.toLowerCase())
      )
    );
    if (tagMatch) return tagMatch;
  }
  
  // Check content for city mentions
  const contentMatch = cityKeywords.find(city =>
    article.content?.toLowerCase().includes(city.toLowerCase())
  );
  
  return contentMatch || article.city || 'Marbella'; // Default to Marbella
};

// Generate schema.org Place markup for geo targeting
export const generatePlaceSchema = (geoData: GeoAreaData) => {
  return {
    '@type': 'Place',
    'name': geoData.mainCity || 'Costa del Sol',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': geoData.mainCity || 'Costa del Sol',
      'addressRegion': geoData.province || 'Malaga',
      'addressCountry': 'ES'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': geoData.coordinates[geoData.mainCity || 'Marbella']?.lat,
      'longitude': geoData.coordinates[geoData.mainCity || 'Marbella']?.lng
    },
    'areaServed': geoData.areaServed.map(area => ({
      '@type': 'City',
      'name': area
    }))
  };
};

export default {
  COSTA_DEL_SOL_COORDINATES,
  DEFAULT_GEO_DATA,
  generateGeoMetadata,
  detectArticleCity,
  generatePlaceSchema
};
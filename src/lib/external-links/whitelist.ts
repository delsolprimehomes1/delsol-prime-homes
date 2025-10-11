/**
 * Approved External Link Domains for DelSolPrimesHomes
 * Only these domains should be used for external links
 */

export const APPROVED_DOMAINS = {
  // Spanish Government & Official Sources
  government: [
    'gob.es',
    'gov.es',
    'administracion.es',
    'administracion.gob.es',
    'boe.es', // Official State Gazette
    'ine.es', // National Statistics Institute
    'agenciatributaria.gob.es', // Tax Agency
    'seg-social.es', // Social Security
    'sepe.es', // Employment Service
    'mitma.gob.es', // Ministry of Transport
  ],
  
  // Banking & Financial Institutions
  banking: [
    'bde.es', // Banco de España (Central Bank)
    'bbva.com',
    'santander.com',
    'caixabank.com',
    'bankinter.com',
    'sabadell.com',
    'unicaja.es',
  ],
  
  // Tourism & Regional Authorities
  tourism: [
    'spain.info',
    'turespaña.es',
    'andalucia.org',
    'juntadeandalucia.es',
    'spain-holiday.com',
    'costadelsol.com',
    'visitcostadelsol.com',
    'turismocostadelsol.com',
    'malagaturismo.com',
    'marbellaexclusive.com',
  ],
  
  // Legal & Notary Services
  legal: [
    'notariosyregistradores.com',
    'notariado.org',
    'registradores.org',
    'cgae.es', // General Council of Spanish Lawyers
    'notariosyregistradores.com',
  ],
  
  // Statistics & Research
  statistics: [
    'ine.es',
    'eurostat.ec.europa.eu',
    'ec.europa.eu',
    'oecd.org',
  ],
  
  // Real Estate (Trusted Sources)
  realEstate: [
    'idealista.com',
    'fotocasa.es',
    'kyero.com',
    'rightmove.co.uk',
    'jamesedition.com',
    'sothebysrealty.com',
  ],
  
  // News & Media (Trusted Sources)
  news: [
    'elpais.com',
    'elmundo.es',
    'lavanguardia.com',
    'ft.com', // Financial Times
    'reuters.com',
    'bbc.com',
  ],
};

/**
 * Check if a URL is from an approved domain
 */
export function isApprovedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    
    return Object.values(APPROVED_DOMAINS)
      .flat()
      .some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Get the category of a domain (government, banking, tourism, etc.)
 */
export function getDomainCategory(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    
    for (const [category, domains] of Object.entries(APPROVED_DOMAINS)) {
      for (const domain of domains) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return category;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all approved domains as a flat array
 */
export function getAllApprovedDomains(): string[] {
  return Object.values(APPROVED_DOMAINS).flat();
}

/**
 * Get domain category display name
 */
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    government: '🏛️ Government & Official',
    banking: '🏦 Banking & Finance',
    tourism: '✈️ Tourism & Travel',
    legal: '⚖️ Legal & Notary',
    statistics: '📊 Statistics & Research',
    realEstate: '🏠 Real Estate',
    news: '📰 News & Media',
  };
  
  return names[category] || category;
}

/**
 * Validate and categorize an external link
 */
export interface LinkValidation {
  isValid: boolean;
  isApproved: boolean;
  category: string | null;
  warnings: string[];
}

export function validateExternalLink(url: string): LinkValidation {
  const warnings: string[] = [];
  
  // Check if URL is valid
  let isValid = true;
  try {
    new URL(url);
  } catch {
    isValid = false;
    warnings.push('Invalid URL format');
  }
  
  // Check if domain is approved
  const isApproved = isApprovedDomain(url);
  const category = getDomainCategory(url);
  
  if (!isApproved) {
    warnings.push('Domain not in approved whitelist');
  }
  
  // Check for HTTPS
  if (isValid && !url.startsWith('https://')) {
    warnings.push('URL should use HTTPS for security');
  }
  
  return {
    isValid,
    isApproved,
    category,
    warnings,
  };
}

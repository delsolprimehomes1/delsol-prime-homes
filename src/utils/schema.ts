import type { SupportedLanguage } from '@/i18n';

export interface FAQItem {
  id: number;
  question: string;
  shortAnswer: string;
  longAnswer: string;
  category?: string;
}

export function faqJsonLd(locale: SupportedLanguage, faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": locale,
    "@id": `https://delsolprimehomes.com/${locale}/faq#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.longAnswer
      }
    }))
  };
}

export function orgJsonLd(locale: SupportedLanguage) {
  const orgNames = {
    en: "DelSolPrimeHomes - Costa Del Sol Luxury Real Estate",
    nl: "DelSolPrimeHomes - Costa Del Sol Luxe Vastgoed",
    fr: "DelSolPrimeHomes - Immobilier de Luxe Costa Del Sol",
    de: "DelSolPrimeHomes - Costa Del Sol Luxus Immobilien",
    pl: "DelSolPrimeHomes - Luksusowe Nieruchomości Costa Del Sol",
    sv: "DelSolPrimeHomes - Costa Del Sol Lyxfastigheter",
    da: "DelSolPrimeHomes - Costa Del Sol Luksusejendomme"
  };

  const descriptions = {
    en: "Premier luxury real estate agency specializing in Costa Del Sol properties in Marbella, Estepona, Fuengirola, Benalmádena, and Mijas.",
    nl: "Premier luxe vastgoedkantoor gespecialiseerd in Costa Del Sol eigendommen in Marbella, Estepona, Fuengirola, Benalmádena en Mijas.",
    fr: "Agence immobilière de luxe spécialisée dans les propriétés Costa Del Sol à Marbella, Estepona, Fuengirola, Benalmádena et Mijas.",
    de: "Premium Luxus-Immobilienagentur spezialisiert auf Costa Del Sol Immobilien in Marbella, Estepona, Fuengirola, Benalmádena und Mijas.",
    pl: "Premierowa agencja nieruchomości luksusowych specjalizująca się w nieruchomościach Costa Del Sol w Marbella, Estepona, Fuengirola, Benalmádena i Mijas.",
    sv: "Främsta lyxfastighetsbyrå specialiserad på Costa Del Sol fastigheter i Marbella, Estepona, Fuengirola, Benalmádena och Mijas.",
    da: "Førende luksus ejendomsmægler specialiseret i Costa Del Sol ejendomme i Marbella, Estepona, Fuengirola, Benalmádena og Mijas."
  };

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "RealEstateAgent"],
    "inLanguage": locale,
    "@id": "https://delsolprimehomes.com/#org",
    "name": orgNames[locale],
    "alternateName": "DelSolPrimeHomes",
    "url": "https://delsolprimehomes.com",
    "description": descriptions[locale],
    "logo": {
      "@type": "ImageObject",
      "url": "https://delsolprimehomes.com/assets/logo.png"
    },
    "sameAs": [
      "https://www.linkedin.com/company/delsolprimehomes",
      "https://www.youtube.com/@delsolprimehomes"
    ],
    "areaServed": [
      {
        "@type": "City",
        "name": "Marbella",
        "addressCountry": "ES"
      },
      {
        "@type": "City", 
        "name": "Estepona",
        "addressCountry": "ES"
      },
      {
        "@type": "City",
        "name": "Fuengirola", 
        "addressCountry": "ES"
      },
      {
        "@type": "City",
        "name": "Benalmádena",
        "addressCountry": "ES"
      },
      {
        "@type": "City",
        "name": "Mijas",
        "addressCountry": "ES"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Marbella",
      "addressRegion": "Andalusia",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 36.5099,
      "longitude": -4.8850
    }
  };
}

export function searchActionJsonLd(locale: SupportedLanguage) {
  return {
    "@context": "https://schema.org", 
    "@type": "WebSite",
    "inLanguage": locale,
    "@id": `https://delsolprimehomes.com/${locale}/#website`,
    "url": `https://delsolprimehomes.com/${locale}/`,
    "name": "DelSolPrimeHomes",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://delsolprimehomes.com/${locale}/search?query={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function placeJsonLd(locale: SupportedLanguage) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "inLanguage": locale,
    "@id": "https://delsolprimehomes.com/#place",
    "name": "DelSolPrimeHomes Office",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Marbella",
      "addressRegion": "Andalusia", 
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 36.5099,
      "longitude": -4.8850
    }
  };
}

export function localBusinessJsonLd(locale: SupportedLanguage) {
  const businessNames = {
    en: "DelSolPrimeHomes - Costa Del Sol Real Estate",
    nl: "DelSolPrimeHomes - Costa Del Sol Vastgoed", 
    fr: "DelSolPrimeHomes - Immobilier Costa Del Sol",
    de: "DelSolPrimeHomes - Costa Del Sol Immobilien",
    pl: "DelSolPrimeHomes - Nieruchomości Costa Del Sol",
    sv: "DelSolPrimeHomes - Costa Del Sol Fastigheter",
    da: "DelSolPrimeHomes - Costa Del Sol Ejendomme"
  };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "inLanguage": locale,
    "@id": "https://delsolprimehomes.com/#business",
    "name": businessNames[locale],
    "url": "https://delsolprimehomes.com",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Andalusia",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates", 
      "latitude": 36.5099,
      "longitude": -4.8850
    },
    "areaServed": [
      "Marbella", "Estepona", "Fuengirola", "Benalmádena", "Mijas"
    ]
  };
}
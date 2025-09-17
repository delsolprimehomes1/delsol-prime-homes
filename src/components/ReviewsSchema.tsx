import React from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
  location?: string;
  propertyType?: string;
}

interface ReviewsSchemaProps {
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  businessName?: string;
  businessUrl?: string;
}

export const ReviewsSchema = ({ 
  reviews, 
  aggregateRating = { ratingValue: 4.9, reviewCount: 247 },
  businessName = "DelSolPrimeHomes",
  businessUrl = "https://delsolprimehomes.com"
}: ReviewsSchemaProps) => {

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": businessName,
    "url": businessUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "about": {
        "@type": "Service",
        "name": "Real Estate Services",
        "serviceType": "Property Sales & Advisory",
        "areaServed": "Costa del Sol, Spain"
      }
    }))
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent", 
    "name": businessName,
    "url": businessUrl,
    "telephone": "+34-123-456-789",
    "email": "info@delsolprimehomes.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida del Mar 123",
      "addressLocality": "Marbella",
      "addressRegion": "Andalusia", 
      "postalCode": "29600",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "36.5201",
      "longitude": "-4.8773"
    },
    "aggregateRating": {
      "@type": "AggregateRating", 
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5
      }
    })),
    "priceRange": "€500,000 - €10,000,000+",
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "36.5201",
        "longitude": "-4.8773"
      },
      "geoRadius": "100000"
    },
    "knowsAbout": [
      "Luxury Real Estate",
      "Costa del Sol Properties",
      "International Property Investment",
      "Spanish Property Law",
      "Expatriate Services"
    ]
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} 
      />
    </>
  );
};
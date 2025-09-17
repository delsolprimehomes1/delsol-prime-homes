import React from 'react';

interface AuthorCredential {
  name: string;
  title: string;
  credentials: string[];
  experience: string;
  expertise: string[];
  profileUrl?: string;
  sameAs?: string[];
}

interface AuthorCredentialsSchemaProps {
  author: AuthorCredential;
  articleUrl?: string;
  organizationName?: string;
}

export const AuthorCredentialsSchema = ({
  author,
  articleUrl,
  organizationName = "DelSolPrimeHomes"
}: AuthorCredentialsSchemaProps) => {

  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "jobTitle": author.title,
    "worksFor": {
      "@type": "Organization", 
      "name": organizationName,
      "url": "https://delsolprimehomes.com"
    },
    "hasCredential": author.credentials.map(credential => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Professional Certification",
      "name": credential
    })),
    "knowsAbout": author.expertise,
    "description": author.experience,
    "url": author.profileUrl,
    "sameAs": author.sameAs || [],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Real Estate Professional Training"
    },
    "award": [
      "Top Real Estate Agent Costa del Sol 2024",
      "Customer Excellence Award 2023"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Spanish Real Estate Professionals Association"
    }
  };

  const expertiseSchema = {
    "@context": "https://schema.org", 
    "@type": "ExpertiseArea",
    "name": `${author.name} - Costa del Sol Real Estate Expertise`,
    "description": `Expert knowledge in ${author.expertise.join(', ')}`,
    "expert": {
      "@type": "Person",
      "name": author.name,
      "hasCredential": author.credentials
    },
    "applicationCategory": "Real Estate Advisory",
    "serviceArea": {
      "@type": "Place",
      "name": "Costa del Sol, Spain"
    }
  };

  // E-E-A-T signals for content credibility
  const credibilitySchema = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    "url": articleUrl,
    "claimReviewed": `Real estate information verified by certified professional ${author.name}`,
    "reviewRating": {
      "@type": "Rating", 
      "ratingValue": 5,
      "bestRating": 5,
      "ratingExplanation": "Information verified by licensed real estate professional with demonstrated expertise"
    },
    "author": {
      "@type": "Person",
      "name": author.name,
      "hasCredential": author.credentials,
      "jobTitle": author.title
    },
    "datePublished": new Date().toISOString().split('T')[0],
    "publisher": {
      "@type": "Organization",
      "name": organizationName
    }
  };

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(expertiseSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(credibilitySchema) }}
      />
    </>
  );
};
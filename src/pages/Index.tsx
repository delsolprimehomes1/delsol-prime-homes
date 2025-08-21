
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SearchSection from '@/components/SearchSection';
import FAQSection from '@/components/FAQSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <title>Buy Luxury Homes in Costa Del Sol – Marbella, Estepona & Fuengirola Real Estate Experts | DelSolPrimeHomes</title>
      <meta 
        name="description" 
        content="Discover luxury real estate in Costa Del Sol with 15+ years expertise. Premium properties in Marbella, Estepona & Fuengirola. Book private viewings today." 
      />
      <meta 
        name="keywords" 
        content="luxury homes Costa Del Sol, Marbella real estate, Estepona properties, Fuengirola luxury villas, Spain property investment" 
      />
      <meta property="og:title" content="DelSolPrimeHomes - Luxury Costa Del Sol Real Estate" />
      <meta property="og:description" content="Expert real estate services for luxury properties in Marbella, Estepona & Fuengirola with 15+ years experience." />
      <meta property="og:type" content="website" />
      <meta name="geo.region" content="ES-AN" />
      <meta name="geo.placename" content="Costa Del Sol, Spain" />
      <meta name="geo.position" content="36.5105;-4.8803" />
      <meta name="ICBM" content="36.5105, -4.8803" />

      {/* Schema Markup for Organization */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "DelSolPrimeHomes",
          "description": "Luxury real estate experts in Costa Del Sol specializing in Marbella, Estepona, and Fuengirola properties",
          "url": "https://delsolprimehomes.com",
          "areaServed": [
            {
              "@type": "City",
              "name": "Marbella"
            },
            {
              "@type": "City", 
              "name": "Estepona"
            },
            {
              "@type": "City",
              "name": "Fuengirola"
            }
          ],
          "serviceType": "Luxury Real Estate Sales",
          "yearsInOperation": "15+"
        })
      }} />

      <Navbar />
      <HeroSection />
      <SearchSection />
      <FAQSection />
    </div>
  );
};

export default Index;

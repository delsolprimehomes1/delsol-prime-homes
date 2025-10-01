
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SearchSection from '@/components/SearchSection';
import BlogSection from '@/components/BlogSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Enhanced SEO Meta Tags */}
      <title>Costa Del Sol Luxury Homes | Marbella, Estepona & Fuengirola Villas for Sale | DelSolPrimeHomes</title>
      <meta 
        name="description" 
        content="Buy luxury homes in Costa Del Sol. Expert guidance across Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Private viewings, virtual tours, €2M+ inventory." 
      />
      <meta 
        name="keywords" 
        content="luxury homes Costa Del Sol, Marbella real estate, Estepona properties, Fuengirola luxury villas, Spain property investment" 
      />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content="Costa Del Sol Luxury Homes | Marbella, Estepona & Fuengirola Villas for Sale" />
      <meta property="og:description" content="Buy luxury homes in Costa Del Sol. Expert guidance across Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Private viewings, virtual tours, €2M+ inventory." />
      <meta property="og:type" content="website" />
      <meta property="og:video" content="https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/68a69bbece523c31db0bb311.mp4" />
      <meta property="og:image" content="/og-image.png" />
      <meta property="og:url" content="https://delsolprimehomes.com" />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Costa Del Sol Luxury Homes | DelSolPrimeHomes" />
      <meta name="twitter:description" content="Buy luxury homes in Costa Del Sol. Expert guidance across Marbella, Estepona, Fuengirola, Benalmádena & Mijas." />
      <meta name="twitter:image" content="/og-image.png" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="ES-AN" />
      <meta name="geo.placename" content="Costa Del Sol, Spain" />
      <meta name="geo.position" content="36.5105;-4.8803" />
      <meta name="ICBM" content="36.5105, -4.8803" />

      {/* Organization Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["Organization", "RealEstateAgent"],
          "name": "Del Sol Prime Homes",
          "url": "https://delsolprimehomes.com",
          "logo": "https://delsolprimehomes.com/assets/DelSolPrimeHomes-Logo.png",
          "image": "https://delsolprimehomes.com/og-image.png",
          "sameAs": [
            "https://www.linkedin.com/company/delsolprimehomes",
            "https://www.youtube.com/@delsolprimehomes"
          ],
          "areaServed": [
            {"@type": "City", "name": "Marbella"},
            {"@type": "City", "name": "Estepona"},
            {"@type": "City", "name": "Fuengirola"},
            {"@type": "City", "name": "Benalmádena"},
            {"@type": "City", "name": "Mijas"}
          ],
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Marbella",
            "addressRegion": "Andalusia",
            "addressCountry": "ES"
          }
        })
      }} />

      {/* Place Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Place",
          "name": "Del Sol Prime Homes",
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
        })
      }} />

      {/* Website Search Action Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://delsolprimehomes.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://delsolprimehomes.com/search?query={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })
      }} />

      <Navbar />
      <HeroSection />
      <SearchSection />
      <BlogSection />
    </div>
  );
};

export default Index;

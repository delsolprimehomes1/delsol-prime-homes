import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateHreflangLinks, generateSameAsURLs, generateOpenGraphLocales } from '@/utils/multilingual-routing';

interface MultilingualSEOHeadProps {
  article: any;
  currentLanguage: string;
  availableLanguages: string[];
  alternateUrls?: Record<string, string>;
}

export const MultilingualSEOHead: React.FC<MultilingualSEOHeadProps> = ({
  article,
  currentLanguage,
  availableLanguages,
  alternateUrls
}) => {
  // Generate hreflang links
  const hreflangData = generateHreflangLinks(article.slug, availableLanguages, currentLanguage);
  
  // Generate sameAs URLs for JSON-LD
  const sameAsURLs = generateSameAsURLs(article.slug, availableLanguages);
  
  // Generate OpenGraph locales
  const ogLocales = generateOpenGraphLocales(availableLanguages);
  
  // Language-specific meta content
  const getLanguageSpecificContent = () => {
    const baseContent = {
      title: article.title,
      description: article.excerpt,
      siteName: 'DelSolPrimeHomes'
    };
    
    switch (currentLanguage) {
      case 'es':
        return {
          ...baseContent,
          siteName: 'DelSolPrimeHomes - Propiedades Costa del Sol',
          keywords: `${article.tags?.join(', ')}, propiedades España, Costa del Sol, inversión inmobiliaria`
        };
      case 'de':
        return {
          ...baseContent,
          siteName: 'DelSolPrimeHomes - Immobilien Costa del Sol',
          keywords: `${article.tags?.join(', ')}, Immobilien Spanien, Costa del Sol, Immobilieninvestition`
        };
      case 'nl':
        return {
          ...baseContent,
          siteName: 'DelSolPrimeHomes - Vastgoed Costa del Sol',
          keywords: `${article.tags?.join(', ')}, vastgoed Spanje, Costa del Sol, vastgoedinvestering`
        };
      case 'fr':
        return {
          ...baseContent,
          siteName: 'DelSolPrimeHomes - Immobilier Costa del Sol',
          keywords: `${article.tags?.join(', ')}, immobilier Espagne, Costa del Sol, investissement immobilier`
        };
      default:
        return {
          ...baseContent,
          keywords: `${article.tags?.join(', ')}, Spain property, Costa del Sol, property investment`
        };
    }
  };
  
  const content = getLanguageSpecificContent();
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{content.title} - {content.siteName}</title>
      <meta name="description" content={content.description} />
      <meta name="keywords" content={content.keywords} />
      <link rel="canonical" href={hreflangData.canonical} />
      
      {/* Language and Content Meta */}
      <meta httpEquiv="content-language" content={currentLanguage} />
      <meta name="language" content={currentLanguage} />
      
      {/* Hreflang Links */}
      {hreflangData.links.map((link, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={link.hreflang}
          href={link.href}
        />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={content.title} />
      <meta property="og:description" content={content.description} />
      <meta property="og:url" content={hreflangData.canonical} />
      <meta property="og:site_name" content={content.siteName} />
      <meta property="og:locale" content={ogLocales[0]} />
      
      {/* Additional OG locales */}
      {ogLocales.slice(1).map((locale, index) => (
        <meta
          key={index}
          property="og:locale:alternate"
          content={locale}
        />
      ))}
      
      {/* Article Meta */}
      <meta property="article:author" content="DelSolPrimeHomes Expert Team" />
      <meta property="article:section" content={article.topic} />
      <meta property="article:published_time" content={article.created_at} />
      <meta property="article:modified_time" content={article.last_updated || article.created_at} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={content.title} />
      <meta name="twitter:description" content={content.description} />
      
      {/* Enhanced JSON-LD with Multilingual Support */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["Article", "FAQPage"],
          "name": article.title,
          "headline": article.title,
          "description": article.excerpt,
          "url": hreflangData.canonical,
          "sameAs": sameAsURLs,
          "inLanguage": currentLanguage,
          "isAccessibleForFree": true,
          "author": {
            "@type": "Organization",
            "name": "DelSolPrimeHomes",
            "url": "https://delsolprimehomes.com",
            "sameAs": [
              "https://www.linkedin.com/company/delsolprimehomes",
              "https://www.facebook.com/delsolprimehomes"
            ]
          },
          "publisher": {
            "@type": "Organization",
            "name": "DelSolPrimeHomes",
            "logo": {
              "@type": "ImageObject",
              "url": "https://delsolprimehomes.com/logo.png"
            }
          },
          "datePublished": article.created_at,
          "dateModified": article.last_updated || article.created_at,
          "mainEntity": {
            "@type": "Question",
            "name": article.title,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": article.excerpt,
              "inLanguage": currentLanguage
            }
          },
          "about": [
            {
              "@type": "Place",
              "name": article.city || "Costa del Sol",
              "containedInPlace": {
                "@type": "AdministrativeArea",
                "name": "Andalusia, Spain"
              }
            },
            {
              "@type": "Thing",
              "name": article.topic,
              "inLanguage": currentLanguage
            }
          ],
          "audience": {
            "@type": "Audience",
            "audienceType": currentLanguage === 'es' ? 'Compradores Internacionales' :
                           currentLanguage === 'de' ? 'Internationale Käufer' :
                           currentLanguage === 'nl' ? 'Internationale Kopers' :
                           currentLanguage === 'fr' ? 'Acheteurs Internationaux' :
                           'International Property Buyers',
            "geographicArea": {
              "@type": "Place",
              "name": "Costa del Sol, Spain"
            }
          },
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [
              ".question-title",
              ".short-answer",
              ".quick-answer",
              "h1", "h2", "h3"
            ],
            "xpath": [
              "//h1[1]",
              "//*[contains(@class, 'short-answer')]",
              "//*[contains(@class, 'quick-answer')]"
            ]
          },
          "potentialAction": [
            {
              "@type": "ReadAction",
              "target": hreflangData.canonical
            },
            {
              "@type": "TranslateAction",
              "target": sameAsURLs.filter(url => url !== hreflangData.canonical),
              "result": {
                "@type": "Article",
                "inLanguage": availableLanguages.filter(lang => lang !== currentLanguage)
              }
            }
          ],
          // Multilingual linking
          "workTranslation": sameAsURLs.filter(url => url !== hreflangData.canonical).map(url => ({
            "@type": "Article",
            "url": url,
            "inLanguage": availableLanguages.find(lang => {
              const expectedUrl = lang === 'en' 
                ? `https://delsolprimehomes.com/qa/${article.slug}`
                : `https://delsolprimehomes.com/qa/${lang}/${article.slug}`;
              return url === expectedUrl;
            }) || currentLanguage
          }))
        })}
      </script>
      
      {/* Additional Multilingual Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "url": hreflangData.canonical,
          "inLanguage": currentLanguage,
          "isPartOf": {
            "@type": "WebSite",
            "name": "DelSolPrimeHomes",
            "url": "https://delsolprimehomes.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `https://delsolprimehomes.com/qa${currentLanguage !== 'en' ? `/${currentLanguage}` : ''}?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": currentLanguage === 'es' ? 'Inicio' :
                       currentLanguage === 'de' ? 'Startseite' :
                       currentLanguage === 'nl' ? 'Home' :
                       currentLanguage === 'fr' ? 'Accueil' : 'Home',
                "item": "https://delsolprimehomes.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": currentLanguage === 'es' ? 'Preguntas y Respuestas' :
                       currentLanguage === 'de' ? 'Fragen und Antworten' :
                       currentLanguage === 'nl' ? 'Vragen en Antwoorden' :
                       currentLanguage === 'fr' ? 'Questions et Réponses' : 'Questions & Answers',
                "item": currentLanguage === 'en' ? 'https://delsolprimehomes.com/qa' : `https://delsolprimehomes.com/qa/${currentLanguage}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": hreflangData.canonical
              }
            ]
          }
        })}
      </script>
    </Helmet>
  );
};

export default MultilingualSEOHead;
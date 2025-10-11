// Phase 3: Multilingual Content Translation System
// Handles Spanish (es) and German (de) translations with proper i18n structure

import { supabase } from '@/integrations/supabase/client';

export interface TranslationRequest {
  sourceArticleId: string;
  targetLanguage: 'es' | 'de' | 'nl' | 'fr' | 'hu';
  priority: 'high' | 'medium' | 'low';
}

export interface TranslatedContent {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  slug: string;
  language: string;
  alternates: Record<string, string>;
  sameAs: string[];
}

export interface MultilingualResult {
  totalTranslated: number;
  spanishArticles: number;
  germanArticles: number;
  dutchArticles: number;
  frenchArticles: number;
  hungarianArticles: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorLog: Array<{ slug: string; error: string; code?: string }>;
  translationDetails: {
    sourceId: string;
    targetId: string;
    language: string;
    slug: string;
    title: string;
    action: 'created' | 'updated' | 'skipped';
  }[];
}

// Language-specific content patterns and terminology
const TRANSLATION_PATTERNS = {
  es: {
    propertyTerms: {
      'property': 'propiedad',
      'real estate': 'bienes raíces',
      'investment': 'inversión',
      'villa': 'villa',
      'apartment': 'apartamento',
      'townhouse': 'casa adosada',
      'penthouse': 'ático',
      'Costa del Sol': 'Costa del Sol',
      'Marbella': 'Marbella',
      'Estepona': 'Estepona',
      'tax': 'impuesto',
      'mortgage': 'hipoteca',
      'buying process': 'proceso de compra',
      'legal requirements': 'requisitos legales'
    },
    questionStarters: {
      'What is': '¿Qué es',
      'How do': '¿Cómo',
      'Where can': '¿Dónde puedo',
      'When should': '¿Cuándo debería',
      'Why is': '¿Por qué es',
      'Which': '¿Cuál'
    },
    commonPhrases: {
      'Costa del Sol property': 'propiedad en Costa del Sol',
      'international buyers': 'compradores internacionales',
      'property investment': 'inversión inmobiliaria',
      'legal process': 'proceso legal',
      'real estate market': 'mercado inmobiliario'
    }
  },
  de: {
    propertyTerms: {
      'property': 'Immobilie',
      'real estate': 'Immobilien',
      'investment': 'Investition',
      'villa': 'Villa',
      'apartment': 'Wohnung',
      'townhouse': 'Reihenhaus',
      'penthouse': 'Penthouse',
      'Costa del Sol': 'Costa del Sol',
      'Marbella': 'Marbella',
      'Estepona': 'Estepona',
      'tax': 'Steuer',
      'mortgage': 'Hypothek',
      'buying process': 'Kaufprozess',
      'legal requirements': 'rechtliche Anforderungen'
    },
    questionStarters: {
      'What is': 'Was ist',
      'How do': 'Wie',
      'Where can': 'Wo kann',
      'When should': 'Wann sollte',
      'Why is': 'Warum ist',
      'Which': 'Welche'
    },
    commonPhrases: {
      'Costa del Sol property': 'Immobilie an der Costa del Sol',
      'international buyers': 'internationale Käufer',
      'property investment': 'Immobilieninvestition',
      'legal process': 'Rechtsverfahren',
      'real estate market': 'Immobilienmarkt'
    }
  },
  hu: {
    propertyTerms: {
      'property': 'ingatlan',
      'real estate': 'ingatlan',
      'investment': 'befektetés',
      'villa': 'villa',
      'apartment': 'lakás',
      'townhouse': 'sorház',
      'penthouse': 'penthouse',
      'Costa del Sol': 'Costa del Sol',
      'Marbella': 'Marbella',
      'Estepona': 'Estepona',
      'tax': 'adó',
      'mortgage': 'jelzálog',
      'buying process': 'vásárlási folyamat',
      'legal requirements': 'jogi követelmények'
    },
    questionStarters: {
      'What is': 'Mi az',
      'How do': 'Hogyan',
      'Where can': 'Hol lehet',
      'When should': 'Mikor kell',
      'Why is': 'Miért',
      'Which': 'Melyik'
    },
    commonPhrases: {
      'Costa del Sol property': 'ingatlan a Costa del Sol-on',
      'international buyers': 'nemzetközi vásárlók',
      'property investment': 'ingatlan befektetés',
      'legal process': 'jogi folyamat',
      'real estate market': 'ingatlanpiac'
    }
  }
};

// Generate Spanish translation
export const translateToSpanish = (article: any): TranslatedContent => {
  const patterns = TRANSLATION_PATTERNS.es;
  
  // Translate title
  let translatedTitle = article.title;
  Object.entries(patterns.questionStarters).forEach(([en, es]) => {
    translatedTitle = translatedTitle.replace(new RegExp(`^${en}`, 'i'), es);
  });
  Object.entries(patterns.propertyTerms).forEach(([en, es]) => {
    translatedTitle = translatedTitle.replace(new RegExp(en, 'gi'), es);
  });
  
  // Generate Spanish content structure
  const translatedContent = generateSpanishContent(article, patterns);
  
  // Generate Spanish excerpt
  const translatedExcerpt = generateSpanishExcerpt(article, patterns);
  
  // Translate tags
  const translatedTags = article.tags?.map((tag: string) => {
    let translatedTag = tag;
    Object.entries(patterns.propertyTerms).forEach(([en, es]) => {
      translatedTag = translatedTag.replace(new RegExp(en, 'gi'), es);
    });
    return translatedTag;
  }) || [];

  // Generate slug
  const slug = generateSlug(translatedTitle, 'es');

  return {
    title: translatedTitle,
    content: translatedContent,
    excerpt: translatedExcerpt,
    tags: translatedTags,
    slug,
    language: 'es',
    alternates: {
      en: `/qa/${article.slug}`,
      es: `/qa/es/${slug}`,
      de: `/qa/de/${slug}` // Placeholder for German version
    },
    sameAs: [
      `https://delsolprimehomes.com/qa/${article.slug}`,
      `https://delsolprimehomes.com/qa/es/${slug}`
    ]
  };
};

// Generate German translation
export const translateToGerman = (article: any): TranslatedContent => {
  const patterns = TRANSLATION_PATTERNS.de;
  
  // Translate title
  let translatedTitle = article.title;
  Object.entries(patterns.questionStarters).forEach(([en, de]) => {
    translatedTitle = translatedTitle.replace(new RegExp(`^${en}`, 'i'), de);
  });
  Object.entries(patterns.propertyTerms).forEach(([en, de]) => {
    translatedTitle = translatedTitle.replace(new RegExp(en, 'gi'), de);
  });
  
  // Generate German content structure
  const translatedContent = generateGermanContent(article, patterns);
  
  // Generate German excerpt
  const translatedExcerpt = generateGermanExcerpt(article, patterns);
  
  // Translate tags
  const translatedTags = article.tags?.map((tag: string) => {
    let translatedTag = tag;
    Object.entries(patterns.propertyTerms).forEach(([en, de]) => {
      translatedTag = translatedTag.replace(new RegExp(en, 'gi'), de);
    });
    return translatedTag;
  }) || [];

  // Generate slug
  const slug = generateSlug(translatedTitle, 'de');

  return {
    title: translatedTitle,
    content: translatedContent,
    excerpt: translatedExcerpt,
    tags: translatedTags,
    slug,
    language: 'de',
    alternates: {
      en: `/qa/${article.slug}`,
      es: `/qa/es/${slug}`, // Placeholder for Spanish version
      de: `/qa/de/${slug}`
    },
    sameAs: [
      `https://delsolprimehomes.com/qa/${article.slug}`,
      `https://delsolprimehomes.com/qa/de/${slug}`
    ]
  };
};

// Generate Spanish content with proper structure
const generateSpanishContent = (article: any, patterns: any): string => {
  const topic = article.topic || 'General';
  const funnelStage = article.funnel_stage || 'TOFU';
  
  let content = '';
  
  // Add Spanish introduction based on topic
  if (topic.includes('Legal') || topic.includes('Process')) {
    content += `## Requisitos Legales en España\n\n`;
    content += `Para compradores internacionales en la Costa del Sol, es esencial comprender los procesos legales españoles. `;
    content += `Los requisitos incluyen documentación específica y procedimientos establecidos por la ley española.\n\n`;
  } else if (topic.includes('Investment') || topic.includes('Financing')) {
    content += `## Inversión Inmobiliaria en Costa del Sol\n\n`;
    content += `El mercado inmobiliario de la Costa del Sol ofrece excelentes oportunidades para inversores internacionales. `;
    content += `La zona combina rentabilidad con calidad de vida excepcional.\n\n`;
  } else if (topic.includes('Lifestyle')) {
    content += `## Estilo de Vida en Costa del Sol\n\n`;
    content += `La Costa del Sol es reconocida mundialmente por su clima excepcional y estilo de vida mediterráneo. `;
    content += `Miles de expatriados han elegido esta región como su hogar permanente.\n\n`;
  }
  
  // Add main content sections
  content += `### Información Clave\n\n`;
  content += `La Costa del Sol sigue siendo uno de los destinos inmobiliarios más populares de Europa. `;
  content += `Con más de 300 días de sol al año, infraestructura moderna y proximidad a aeropuertos internacionales, `;
  content += `la región ofrece ventajas únicas para propietarios e inversores.\n\n`;
  
  content += `### Consideraciones Importantes\n\n`;
  content += `- **Ubicación**: Proximidad a servicios, playas y transporte\n`;
  content += `- **Documentación**: NIE, cuenta bancaria española, certificados\n`;
  content += `- **Impuestos**: IBI, ITP, plusvalía municipal\n`;
  content += `- **Proceso**: 6-12 semanas desde oferta hasta escrituración\n\n`;
  
  if (funnelStage === 'BOFU') {
    content += `### Próximos Pasos\n\n`;
    content += `¿Listo para dar el siguiente paso? Nuestro equipo de expertos locales puede proporcionarle `;
    content += `orientación personalizada adaptada a su situación específica y objetivos de inversión.\n\n`;
    content += `**Contacte con nosotros** para una consulta gratuita y comience su proceso de compra en la Costa del Sol.`;
  }
  
  return content;
};

// Generate German content with proper structure
const generateGermanContent = (article: any, patterns: any): string => {
  const topic = article.topic || 'General';
  const funnelStage = article.funnel_stage || 'TOFU';
  
  let content = '';
  
  // Add German introduction based on topic
  if (topic.includes('Legal') || topic.includes('Process')) {
    content += `## Rechtliche Anforderungen in Spanien\n\n`;
    content += `Für internationale Käufer an der Costa del Sol ist es wichtig, die spanischen Rechtsprozesse zu verstehen. `;
    content += `Die Anforderungen umfassen spezifische Dokumentation und Verfahren nach spanischem Recht.\n\n`;
  } else if (topic.includes('Investment') || topic.includes('Financing')) {
    content += `## Immobilieninvestition an der Costa del Sol\n\n`;
    content += `Der Immobilienmarkt der Costa del Sol bietet ausgezeichnete Möglichkeiten für internationale Investoren. `;
    content += `Die Region kombiniert Rentabilität mit außergewöhnlicher Lebensqualität.\n\n`;
  } else if (topic.includes('Lifestyle')) {
    content += `## Lebensstil an der Costa del Sol\n\n`;
    content += `Die Costa del Sol ist weltweit für ihr außergewöhnliches Klima und ihren mediterranen Lebensstil bekannt. `;
    content += `Tausende von Auswanderern haben diese Region als ihr dauerhaftes Zuhause gewählt.\n\n`;
  }
  
  // Add main content sections
  content += `### Wichtige Informationen\n\n`;
  content += `Die Costa del Sol bleibt eines der beliebtesten Immobilienziele Europas. `;
  content += `Mit über 300 Sonnentagen pro Jahr, moderner Infrastruktur und Nähe zu internationalen Flughäfen `;
  content += `bietet die Region einzigartige Vorteile für Eigentümer und Investoren.\n\n`;
  
  content += `### Wichtige Überlegungen\n\n`;
  content += `- **Lage**: Nähe zu Dienstleistungen, Stränden und Verkehrsmitteln\n`;
  content += `- **Dokumentation**: NIE, spanisches Bankkonto, Zertifikate\n`;
  content += `- **Steuern**: IBI, ITP, kommunale Wertsteigerungssteuer\n`;
  content += `- **Prozess**: 6-12 Wochen von Angebot bis Beurkundung\n\n`;
  
  if (funnelStage === 'BOFU') {
    content += `### Nächste Schritte\n\n`;
    content += `Bereit für den nächsten Schritt? Unser Team lokaler Experten kann Ihnen `;
    content += `personalisierte Beratung bieten, die auf Ihre spezifische Situation und Investitionsziele zugeschnitten ist.\n\n`;
    content += `**Kontaktieren Sie uns** für eine kostenlose Beratung und beginnen Sie Ihren Kaufprozess an der Costa del Sol.`;
  }
  
  return content;
};

// Generate localized excerpts
const generateSpanishExcerpt = (article: any, patterns: any): string => {
  const topic = article.topic || 'General';
  
  if (topic.includes('Legal')) {
    return `Guía completa sobre requisitos legales para compradores internacionales en la Costa del Sol. Documentación, procesos y consideraciones importantes.`;
  } else if (topic.includes('Investment')) {
    return `Información esencial sobre inversión inmobiliaria en Costa del Sol. Oportunidades, rentabilidad y factores clave para inversores internacionales.`;
  } else if (topic.includes('Lifestyle')) {
    return `Descubra las ventajas del estilo de vida mediterráneo en Costa del Sol. Clima, cultura y calidad de vida excepcionales.`;
  }
  
  return `Información experta sobre propiedades en Costa del Sol para compradores internacionales. Guía completa y actualizada.`;
};

const generateGermanExcerpt = (article: any, patterns: any): string => {
  const topic = article.topic || 'General';
  
  if (topic.includes('Legal')) {
    return `Umfassender Leitfaden zu rechtlichen Anforderungen für internationale Käufer an der Costa del Sol. Dokumentation, Prozesse und wichtige Überlegungen.`;
  } else if (topic.includes('Investment')) {
    return `Wesentliche Informationen über Immobilieninvestitionen an der Costa del Sol. Möglichkeiten, Rentabilität und Schlüsselfaktoren für internationale Investoren.`;
  } else if (topic.includes('Lifestyle')) {
    return `Entdecken Sie die Vorteile des mediterranen Lebensstils an der Costa del Sol. Außergewöhnliches Klima, Kultur und Lebensqualität.`;
  }
  
  return `Experteninformationen über Immobilien an der Costa del Sol für internationale Käufer. Umfassender und aktueller Leitfaden.`;
};

// Generate SEO-friendly slugs
const generateSlug = (title: string, language: string): string => {
  let slug = title.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/[¿¡]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  
  return slug;
};

// Create translations for top TOFU articles (Spanish)
export const createSpanishTOFUTranslations = async (): Promise<MultilingualResult> => {
  console.log('🇪🇸 Creating Spanish translations for top 25 TOFU articles...');
  
  // Get top 25 TOFU articles
  const { data: tofuArticles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('language', 'en')
    .eq('funnel_stage', 'TOFU')
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) throw error;

  const translationDetails: any[] = [];
  const errorLog: Array<{ slug: string; error: string; code?: string }> = [];
  let spanishCount = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of tofuArticles || []) {
    try {
      const translation = translateToSpanish(article);
      
      // Check if translation already exists
      const { data: existingTranslation } = await supabase
        .from('qa_articles')
        .select('id, slug')
        .eq('parent_id', article.id)
        .eq('language', 'es')
        .maybeSingle();

      if (existingTranslation) {
        console.log(`⏭️  Skipped (exists): ${translation.title}`);
        translationDetails.push({
          sourceId: article.id,
          targetId: existingTranslation.id,
          language: 'es',
          slug: existingTranslation.slug,
          title: translation.title,
          action: 'skipped'
        });
        skipped++;
        spanishCount++;
        continue;
      }
      
      // Upsert Spanish translation (will update if slug exists, insert if not)
      const { data: newArticle, error: upsertError } = await supabase
        .from('qa_articles')
        .upsert({
          title: translation.title,
          slug: translation.slug,
          content: translation.content,
          excerpt: translation.excerpt,
          funnel_stage: article.funnel_stage,
          topic: article.topic,
          city: article.city,
          language: 'es',
          tags: translation.tags,
          parent_id: article.id,
          multilingual_parent_id: article.id,
          markdown_frontmatter: {
            lang: 'es',
            alternates: translation.alternates,
            sameAs: translation.sameAs,
            translated_from: article.id,
            translation_date: new Date().toISOString()
          }
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (upsertError) {
        console.error(`❌ Error translating ${article.slug}:`, upsertError.message);
        errorLog.push({
          slug: article.slug,
          error: upsertError.message,
          code: upsertError.code
        });
        errors++;
        continue;
      }

      const action = newArticle.created_at === newArticle.updated_at ? 'created' : 'updated';
      
      translationDetails.push({
        sourceId: article.id,
        targetId: newArticle.id,
        language: 'es',
        slug: translation.slug,
        title: translation.title,
        action
      });

      if (action === 'created') {
        created++;
        console.log(`✅ Created Spanish: ${translation.title}`);
      } else {
        updated++;
        console.log(`🔄 Updated Spanish: ${translation.title}`);
      }
      spanishCount++;
      
    } catch (error: any) {
      console.error(`❌ Error processing ${article.slug}:`, error?.message || error);
      errorLog.push({
        slug: article.slug,
        error: error?.message || String(error)
      });
      errors++;
    }
  }

  console.log(`\n📊 Spanish Summary: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`);

  return {
    totalTranslated: spanishCount,
    spanishArticles: spanishCount,
    germanArticles: 0,
    dutchArticles: 0,
    frenchArticles: 0,
    hungarianArticles: 0,
    created,
    updated,
    skipped,
    errors,
    errorLog,
    translationDetails
  };
};

// Create translations for investment/legal articles (German)
export const createGermanInvestmentTranslations = async (): Promise<MultilingualResult> => {
  console.log('🇩🇪 Creating German translations for 20 investment/legal articles...');
  
  // Get investment and legal articles
  const { data: investmentArticles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('language', 'en')
    .or('topic.ilike.%investment%,topic.ilike.%legal%,topic.ilike.%financing%,topic.ilike.%process%')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  const translationDetails: any[] = [];
  const errorLog: Array<{ slug: string; error: string; code?: string }> = [];
  let germanCount = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of investmentArticles || []) {
    try {
      const translation = translateToGerman(article);
      
      // Check if translation already exists
      const { data: existingTranslation } = await supabase
        .from('qa_articles')
        .select('id, slug')
        .eq('parent_id', article.id)
        .eq('language', 'de')
        .maybeSingle();

      if (existingTranslation) {
        console.log(`⏭️  Skipped (exists): ${translation.title}`);
        translationDetails.push({
          sourceId: article.id,
          targetId: existingTranslation.id,
          language: 'de',
          slug: existingTranslation.slug,
          title: translation.title,
          action: 'skipped'
        });
        skipped++;
        germanCount++;
        continue;
      }
      
      // Upsert German translation (will update if slug exists, insert if not)
      const { data: newArticle, error: upsertError } = await supabase
        .from('qa_articles')
        .upsert({
          title: translation.title,
          slug: translation.slug,
          content: translation.content,
          excerpt: translation.excerpt,
          funnel_stage: article.funnel_stage,
          topic: article.topic,
          city: article.city,
          language: 'de',
          tags: translation.tags,
          parent_id: article.id,
          multilingual_parent_id: article.id,
          markdown_frontmatter: {
            lang: 'de',
            alternates: translation.alternates,
            sameAs: translation.sameAs,
            translated_from: article.id,
            translation_date: new Date().toISOString()
          }
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (upsertError) {
        console.error(`❌ Error translating ${article.slug}:`, upsertError.message);
        errorLog.push({
          slug: article.slug,
          error: upsertError.message,
          code: upsertError.code
        });
        errors++;
        continue;
      }

      const action = newArticle.created_at === newArticle.updated_at ? 'created' : 'updated';
      
      translationDetails.push({
        sourceId: article.id,
        targetId: newArticle.id,
        language: 'de',
        slug: translation.slug,
        title: translation.title,
        action
      });

      if (action === 'created') {
        created++;
        console.log(`✅ Created German: ${translation.title}`);
      } else {
        updated++;
        console.log(`🔄 Updated German: ${translation.title}`);
      }
      germanCount++;
      
    } catch (error: any) {
      console.error(`❌ Error processing ${article.slug}:`, error?.message || error);
      errorLog.push({
        slug: article.slug,
        error: error?.message || String(error)
      });
      errors++;
    }
  }

  console.log(`\n📊 German Summary: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`);

  return {
    totalTranslated: germanCount,
    spanishArticles: 0,
    germanArticles: germanCount,
    dutchArticles: 0,
    frenchArticles: 0,
    hungarianArticles: 0,
    created,
    updated,
    skipped,
    errors,
    errorLog,
    translationDetails
  };
};

// Run complete multilingual implementation
export const runPhase3MultilingualImplementation = async (): Promise<MultilingualResult> => {
  console.log('🌍 Starting Phase 3: Multilingual Implementation...');
  
  // Create Spanish TOFU translations
  const spanishResult = await createSpanishTOFUTranslations();
  
  // Create German investment/legal translations
  const germanResult = await createGermanInvestmentTranslations();
  
  // Combine results
  const combinedResult: MultilingualResult = {
    totalTranslated: spanishResult.totalTranslated + germanResult.totalTranslated,
    spanishArticles: spanishResult.spanishArticles,
    germanArticles: germanResult.germanArticles,
    dutchArticles: 0,
    frenchArticles: 0,
    hungarianArticles: 0,
    created: spanishResult.created + germanResult.created,
    updated: spanishResult.updated + germanResult.updated,
    skipped: spanishResult.skipped + germanResult.skipped,
    errors: spanishResult.errors + germanResult.errors,
    errorLog: [...spanishResult.errorLog, ...germanResult.errorLog],
    translationDetails: [
      ...spanishResult.translationDetails,
      ...germanResult.translationDetails
    ]
  };

  console.log(`\n🎉 Phase 3 Complete: ${combinedResult.totalTranslated} total translations`);
  console.log(`   ✅ Created: ${combinedResult.created}`);
  console.log(`   🔄 Updated: ${combinedResult.updated}`);
  console.log(`   ⏭️  Skipped: ${combinedResult.skipped}`);
  console.log(`   ❌ Errors: ${combinedResult.errors}`);
  console.log(`🇪🇸 Spanish: ${combinedResult.spanishArticles} articles`);
  console.log(`🇩🇪 German: ${combinedResult.germanArticles} articles`);
  
  if (combinedResult.errorLog.length > 0) {
    console.log(`\n⚠️  Error Details:`);
    combinedResult.errorLog.forEach(err => {
      console.log(`   - ${err.slug}: ${err.error}${err.code ? ` (${err.code})` : ''}`);
    });
  }
  
  return combinedResult;
};
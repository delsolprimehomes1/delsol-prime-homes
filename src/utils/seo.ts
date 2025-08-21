import type { SupportedLanguage } from '@/i18n';

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  twitterTitle: string;
  twitterDescription: string;
  locale: string;
}

const metaTranslations = {
  en: {
    title: "Costa Del Sol Luxury Homes | Marbella, Estepona & Fuengirola Villas for Sale | DelSolPrimeHomes",
    description: "Buy luxury homes in Costa Del Sol. Expert guidance across Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Private viewings, virtual tours, €2M+ inventory.",
    keywords: "luxury homes Costa Del Sol, Marbella real estate, Estepona properties, Fuengirola luxury villas, Spain property investment",
    faqTitle: "Costa Del Sol Property FAQ | 275 Expert Answers | DelSolPrimeHomes",
    faqDescription: "Get expert answers to 275 questions about buying luxury properties in Costa Del Sol. NIE, taxes, mortgages, Golden Visa - everything you need to know."
  },
  nl: {
    title: "Costa Del Sol Luxe Woningen | Marbella, Estepona & Fuengirola Villa's te Koop | DelSolPrimeHomes",
    description: "Koop luxe woningen aan de Costa Del Sol. Deskundige begeleiding in Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Privé bezichtigingen, virtuele tours, €2M+ voorraad.",
    keywords: "luxe woningen Costa Del Sol, Marbella vastgoed, Estepona eigendommen, Fuengirola luxe villa's, Spanje vastgoed investering",
    faqTitle: "Costa Del Sol Vastgoed FAQ | 275 Expert Antwoorden | DelSolPrimeHomes",
    faqDescription: "Krijg deskundige antwoorden op 275 vragen over het kopen van luxe eigendommen aan de Costa Del Sol. NIE, belastingen, hypotheken, Golden Visa - alles wat je moet weten."
  },
  fr: {
    title: "Maisons de Luxe Costa Del Sol | Villas Marbella, Estepona & Fuengirola à Vendre | DelSolPrimeHomes",
    description: "Achetez des maisons de luxe sur la Costa Del Sol. Accompagnement expert à Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Visites privées, tours virtuels, inventaire €2M+.",
    keywords: "maisons de luxe Costa Del Sol, immobilier Marbella, propriétés Estepona, villas de luxe Fuengirola, investissement immobilier Espagne",
    faqTitle: "FAQ Immobilier Costa Del Sol | 275 Réponses d'Experts | DelSolPrimeHomes",
    faqDescription: "Obtenez des réponses d'experts à 275 questions sur l'achat de propriétés de luxe sur la Costa Del Sol. NIE, taxes, hypothèques, Golden Visa - tout ce que vous devez savoir."
  },
  de: {
    title: "Costa Del Sol Luxusimmobilien | Marbella, Estepona & Fuengirola Villen zu Verkaufen | DelSolPrimeHomes",
    description: "Kaufen Sie Luxusimmobilien an der Costa Del Sol. Fachkundige Betreuung in Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Private Besichtigungen, virtuelle Touren, €2M+ Inventar.",
    keywords: "Luxusimmobilien Costa Del Sol, Marbella Immobilien, Estepona Eigenschaften, Fuengirola Luxusvillen, Spanien Immobilieninvestition",
    faqTitle: "Costa Del Sol Immobilien FAQ | 275 Expertenantworten | DelSolPrimeHomes",
    faqDescription: "Erhalten Sie Expertenantworten auf 275 Fragen zum Kauf von Luxusimmobilien an der Costa Del Sol. NIE, Steuern, Hypotheken, Golden Visa - alles was Sie wissen müssen."
  },
  pl: {
    title: "Luksusowe Domy Costa Del Sol | Wille Marbella, Estepona i Fuengirola na Sprzedaż | DelSolPrimeHomes",
    description: "Kup luksusowe domy na Costa Del Sol. Fachowe wsparcie w Marbella, Estepona, Fuengirola, Benalmádena i Mijas. Prywatne oglądanie, wirtualne wycieczki, inwentarz €2M+.",
    keywords: "luksusowe domy Costa Del Sol, nieruchomości Marbella, właściwości Estepona, luksusowe wille Fuengirola, inwestycje w nieruchomości Hiszpania",
    faqTitle: "FAQ Nieruchomości Costa Del Sol | 275 Odpowiedzi Ekspertów | DelSolPrimeHomes",
    faqDescription: "Otrzymaj eksperckie odpowiedzi na 275 pytań o zakup luksusowych nieruchomości na Costa Del Sol. NIE, podatki, hipoteki, Golden Visa - wszystko co musisz wiedzieć."
  },
  sv: {
    title: "Costa Del Sol Lyxbostäder | Marbella, Estepona & Fuengirola Villor till Salu | DelSolPrimeHomes",
    description: "Köp lyxbostäder på Costa Del Sol. Experthjälp i Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Privata visningar, virtuella turer, €2M+ lager.",
    keywords: "lyxbostäder Costa Del Sol, Marbella fastigheter, Estepona egenskaper, Fuengirola lyxvillor, Spanien fastighetsinvestering",
    faqTitle: "Costa Del Sol Fastighets FAQ | 275 Expertsvar | DelSolPrimeHomes",
    faqDescription: "Få expertsvar på 275 frågor om att köpa lyxfastigheter på Costa Del Sol. NIE, skatter, bolån, Golden Visa - allt du behöver veta."
  },
  da: {
    title: "Costa Del Sol Luksusboliger | Marbella, Estepona & Fuengirola Villaer til Salg | DelSolPrimeHomes",
    description: "Køb luksusboliger på Costa Del Sol. Eksperthjælp i Marbella, Estepona, Fuengirola, Benalmádena & Mijas. Private visninger, virtuelle ture, €2M+ lager.",
    keywords: "luksusboliger Costa Del Sol, Marbella ejendomme, Estepona egenskaber, Fuengirola luksusvillaer, Spanien ejendomsinvestering",
    faqTitle: "Costa Del Sol Ejendoms FAQ | 275 Ekspertsvar | DelSolPrimeHomes",
    faqDescription: "Få ekspertsvar på 275 spørgsmål om at købe luksusejendomme på Costa Del Sol. NIE, skatter, realkreditlån, Golden Visa - alt du behøver at vide."
  }
};

export function buildMetaTags(locale: SupportedLanguage, route: 'home' | 'faq' = 'home'): MetaTags {
  const translations = metaTranslations[locale];
  const isHome = route === 'home';
  
  return {
    title: isHome ? translations.title : translations.faqTitle,
    description: isHome ? translations.description : translations.faqDescription,
    keywords: translations.keywords,
    ogTitle: isHome ? translations.title : translations.faqTitle,
    ogDescription: isHome ? translations.description : translations.faqDescription,
    ogImage: "/placeholder.svg",
    twitterTitle: isHome ? translations.title : translations.faqTitle,
    twitterDescription: isHome ? translations.description : translations.faqDescription,
    locale
  };
}

export function buildHrefLangTags(currentRoute: string = '/'): Array<{href: string, hreflang: string}> {
  const supportedLangs: SupportedLanguage[] = ['en', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  const baseUrl = 'https://delsolprimehomes.com';
  
  const hreflangs = supportedLangs.map(lang => ({
    href: `${baseUrl}/${lang}${currentRoute === '/' ? '/' : currentRoute}`,
    hreflang: lang as string
  }));
  
  // Add x-default
  hreflangs.push({
    href: `${baseUrl}${currentRoute}`,
    hreflang: 'x-default' as string
  });
  
  return hreflangs;
}

export function updateHtmlLang(locale: SupportedLanguage): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}
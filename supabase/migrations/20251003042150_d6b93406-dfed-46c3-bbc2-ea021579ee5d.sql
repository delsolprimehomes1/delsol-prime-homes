-- Fix external links: Remove PDF and tourism links, add finance-relevant sources
UPDATE qa_articles
SET 
  content = REPLACE(
    REPLACE(
      content,
      '[Mortgages for non-residents in Spain](https://www.bde.es/f/webbde/Secciones/Publicaciones/InformesBoletinesRevistas/BoletinEconomico/2023/Abr/Fich/be2304-art1.pdf)',
      'According to [Bank of Spain official data](https://www.bde.es/wbe/en/), mortgages for non-residents in Spain'
    ),
    '[property finance on Costa del Sol](https://www.andalucia.org/en/costa-del-sol)',
    'mortgage finance as detailed in [expatriate mortgage guides](https://www.expatica.com/es/finance/mortgages/spanish-mortgages-101055/)'
  ),
  updated_at = now()
WHERE slug = 'ai-mortgage-calculators-expats';
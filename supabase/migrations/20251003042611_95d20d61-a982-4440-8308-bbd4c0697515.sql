-- Add source citations with proper attribution formatting
UPDATE qa_articles
SET 
  content = REPLACE(
    REPLACE(
      content,
      'According to [Bank of Spain official data](https://www.bde.es/wbe/en/), mortgages for non-residents in Spain can feel complicated.',
      'According to <a href="https://www.bde.es/wbe/en/" rel="noopener" target="_blank" data-source="authoritative">Bank of Spain official data</a> (accessed October 2025), mortgages for non-residents in Spain can feel complicated.'
    ),
    'When dealing with mortgage finance as detailed in [expatriate mortgage guides](https://www.expatica.com/es/finance/mortgages/spanish-mortgages-101055/), several factors require attention:',
    'When dealing with mortgage finance as detailed in <a href="https://www.expatica.com/es/finance/mortgages/spanish-mortgages-101055/" rel="noopener" target="_blank" data-source="authoritative">expatriate mortgage guides</a> (accessed October 2025), several factors require attention:'
  ),
  updated_at = now()
WHERE slug = 'ai-mortgage-calculators-expats';
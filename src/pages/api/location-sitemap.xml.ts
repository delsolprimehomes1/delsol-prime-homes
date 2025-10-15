// Location pages sitemap
export default async function handler() {
  const baseUrl = 'https://delsolprimehomes.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const locations = ['marbella', 'estepona', 'fuengirola', 'benalmadena', 'mijas'];
  const propertyTypes = ['villas', 'apartments'];
  
  // Generate main location pages (e.g., /marbella)
  const mainLocationUrls = locations.map(location => `  <url>
    <loc>${baseUrl}/${location}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
  
  // Generate property type pages (e.g., /marbella/villas)
  const propertyTypeUrls = locations.flatMap(location => 
    propertyTypes.map(type => `  <url>
    <loc>${baseUrl}/${location}/${type}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`)
  );
  
  // Combine all URLs
  const urlEntries = [...mainLocationUrls, ...propertyTypeUrls].join('\n');

  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
    
  return new Response(sitemapXML, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
    },
    status: 200
  });
}

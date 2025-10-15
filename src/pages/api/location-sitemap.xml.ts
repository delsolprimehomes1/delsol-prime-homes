// Location pages sitemap
export default async function handler() {
  const baseUrl = 'https://delsolprimehomes.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const locations = ['marbella', 'estepona', 'fuengirola', 'benalmadena', 'mijas'];
  
  const urlEntries = locations.map(location => `  <url>
    <loc>${baseUrl}/location/${location}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

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

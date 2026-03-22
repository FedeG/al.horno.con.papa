import recipes from '../data/recipes.json';

// Generar sitemap XML dinámico
const generateSitemap = () => {
  const baseUrl = 'https://alhornoconpapa.com.ar';
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // URL principal
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // URLs de recetas
  recipes.forEach((recipe) => {
    if (!recipe.hidden) {
      const slug = recipe.slug;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/recipe/${slug}</loc>\n`;
      xml += `    <lastmod>${recipe.date ? recipe.date.split('T')[0] : today}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (recipe.imageUrl) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${baseUrl}/${recipe.imageUrl}</image:loc>\n`;
        xml += `      <image:title>${recipe.name}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }
  });

  xml += '</urlset>';

  return xml;
};

export default generateSitemap;

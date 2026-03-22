import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  imageUrl, 
  imageAlt,
  canonicalUrl,
  schema,
  keywords,
  ogType = 'website',
  twitterHandle = null
}) => {
  const siteName = 'Al Horno Con Papá - Cocina en familia';
  const defaultImage = 'https://alhornoconpapa.com.ar/og-default.jpg';
  const siteUrl = 'https://alhornoconpapa.com.ar';
  
  const fullTitle = title ? `${title} | Al Horno Con Papá` : siteName;
  const fullDescription = description || 'Al Horno Con Papá - Cocina en familia. Recetas deliciosas compartidas con amor.';
  const fullImageUrl = imageUrl ? `${siteUrl}/${imageUrl}` : defaultImage;
  const fullCanonicalUrl = canonicalUrl || siteUrl;

  return (
    <Helmet>
      {/* Meta básicos */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph para redes sociales */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt || fullTitle} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt || fullTitle} />
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

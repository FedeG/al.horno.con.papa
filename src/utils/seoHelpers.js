// Genera schema JSON-LD para una receta
export const generateRecipeSchema = (recipe, baseUrl = 'https://alhornoconpapa.com.ar') => {
  // Parsear tiempo de preparación del texto de descripción
  const timeMatch = recipe.description.match(/⏳\s*Tiempo:\s*(\d+)\s*minutos/);
  const prepTime = timeMatch ? parseInt(timeMatch[1]) : 20;

  return {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.name,
    description: recipe.description.split('\n')[0],
    image: `${baseUrl}/${recipe.imageUrl}`,
    author: {
      '@type': 'Organization',
      name: 'Al Horno Con Papá',
      url: baseUrl
    },
    recipeCategory: recipe.tags ? recipe.tags[0] : 'recipe',
    recipeCuisine: 'Argentine',
    prepTime: `PT${prepTime}M`,
    totalTime: `PT${prepTime}M`,
    recipeYield: '4 porciones',
    recipeIngredient: recipe.ingredients || [],
    recipeInstructions: [
      {
        '@type': 'HowToStep',
        text: recipe.description
      }
    ],
    keywords: recipe.tags ? recipe.tags.join(',') : '',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
      ratingCount: '1'
    }
  };
};

// Genera schema para página de listado de recetas
export const generateCollectionSchema = (baseUrl = 'https://alhornoconpapa.com.ar') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Al Horno Con Papá - Recetas de cocina',
    description: 'Encuentra recetas deliciosas compartidas con amor. Cocina en familia con recetas vegetarianas, veganas, fáciles y más.',
    url: baseUrl,
    image: `${baseUrl}/og-default.jpg`,
    publisher: {
      '@type': 'Organization',
      name: 'Al Horno Con Papá',
      url: baseUrl,
      logo: `${baseUrl}/logo.jpg`
    }
  };
};

// Genera schema para breadcrumbs
export const generateBreadcrumbSchema = (items, baseUrl = 'https://alhornoconpapa.com.ar') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.url}`
    }))
  };
};

// Extrae metaetiquetas HTML
export const extractMetaTags = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return {
    title: doc.querySelector('title')?.textContent || '',
    description: doc.querySelector('meta[name="description"]')?.content || '',
    image: doc.querySelector('meta[property="og:image"]')?.content || ''
  };
};

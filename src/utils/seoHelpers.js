import emojiRegex from 'emoji-regex';

const emojiRegexPattern = emojiRegex();

// Elimina emojis de un string usando un regex compatible con todos los navegadores soportados
const removeEmojis = (str) => (str || '').replace(emojiRegexPattern, '').trim();
// Parsea los pasos de la receta desde la descripción
const parseRecipeSteps = (description, slug, imageUrl, baseUrl = 'https://alhornoconpapa.com.ar') => {
  const lines = description.split('\n');
  const pasoIndex = lines.findIndex(line => line.includes('👣') || line.includes('Pasos'));
  
  if (pasoIndex === -1) return [];
  
  const stepsSection = lines.slice(pasoIndex + 1);
  const tipIndex = stepsSection.findIndex(line => line.includes('💡') || line.includes('Tip'));
  const stepsLines = tipIndex > -1 ? stepsSection.slice(0, tipIndex) : stepsSection;
  
  return stepsLines
    // Soporta bullets con "•", "-", y listas numeradas tipo "1." o "2)"
    .map((line) => {
      const match = line.match(/^\s*(?:[•-]|\d+[.)])\s*(.+)$/);
      return match ? match[1].trim() : '';
    })
    .filter((text) => text.length > 0)
    .map((text, index) => ({
      '@type': 'HowToStep',
      name: `Paso ${index + 1}`,
      text: text,
      url: `${baseUrl}/recipe/${slug}`,
      image: `${baseUrl}/${imageUrl}`
    }));
};

// Genera schema JSON-LD para una receta
export const generateRecipeSchema = (recipe, baseUrl = 'https://alhornoconpapa.com.ar') => {
  // Parsear tiempo total de la receta desde el texto de descripción
  const timeMatch = recipe.description.match(/⏳\s*Tiempo:\s*(\d+)\s*minutos/);
  const timeMinutes = timeMatch ? parseInt(timeMatch[1]) : 20;
  
  // Parsear los pasos de la receta
  const recipeSteps = parseRecipeSteps(recipe.description, recipe.slug, recipe.imageUrl, baseUrl);
  
  // Fallback si no encuentra pasos estructurados
  const recipeInstructions = recipeSteps.length > 0 
    ? recipeSteps 
    : [
        {
          '@type': 'HowToStep',
          name: 'Paso 1',
          text: recipe.description.split('\n\n')[0] || recipe.description,
          url: `${baseUrl}/recipe/${recipe.slug}`,
          image: `${baseUrl}/${recipe.imageUrl}`
        }
      ];

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: removeEmojis(recipe.name),
    description: recipe.description.split('\n').filter(line => line.trim().length > 0)[1] || 'Receta deliciosa lista para preparar',
    image: `${baseUrl}/${recipe.imageUrl}`,
    url: `${baseUrl}/recipe/${recipe.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Al Horno Con Papá',
      url: baseUrl,
      logo: `${baseUrl}/logo.jpg`
    },
    recipeCategory: recipe.tags?.length ? recipe.tags[0] : 'Recipe',
    recipeCuisine: 'Argentine',
    // Solo se publica totalTime porque la descripción no distingue entre prepTime y cookTime
    totalTime: `PT${timeMinutes}M`,
    recipeYield: '4 porciones',
    recipeIngredient: recipe.ingredients && recipe.ingredients.length > 0 
      ? recipe.ingredients 
      : [],
    recipeInstructions: recipeInstructions,
    ...(recipe.nutrition ? {
      nutrition: {
        '@type': 'NutritionInformation',
        ...(recipe.nutrition.calories !== undefined && { calories: recipe.nutrition.calories }),
        ...(recipe.nutrition.carbohydrateContent !== undefined && { carbohydrateContent: recipe.nutrition.carbohydrateContent }),
        ...(recipe.nutrition.proteinContent !== undefined && { proteinContent: recipe.nutrition.proteinContent }),
        ...(recipe.nutrition.fatContent !== undefined && { fatContent: recipe.nutrition.fatContent }),
        ...(recipe.nutrition.fiberContent !== undefined && { fiberContent: recipe.nutrition.fiberContent }),
        ...(recipe.nutrition.sugarContent !== undefined && { sugarContent: recipe.nutrition.sugarContent }),
        ...(recipe.nutrition.sodiumContent !== undefined && { sodiumContent: recipe.nutrition.sodiumContent }),
        ...(recipe.nutrition.servingSize !== undefined && { servingSize: recipe.nutrition.servingSize })
      }
    } : {}),
    keywords: recipe.tags ? recipe.tags.join(', ') : '',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
      ratingCount: '1'
    },
    datePublished: recipe.date || new Date().toISOString(),
    isAccessibleForFree: true
  };
  
  // Agregar video si existe
  if (recipe.instagramUrl) {
    const instagramEmbedUrl = recipe.instagramUrl.endsWith('/')
      ? `${recipe.instagramUrl}embed/`
      : `${recipe.instagramUrl}/embed/`;

    schema.video = {
      '@type': 'VideoObject',
      name: removeEmojis(recipe.name),
      description: recipe.description.split('\n').filter(line => line.trim().length > 0)[1] || 'Video receta',
      contentUrl: recipe.instagramUrl,
      embedUrl: instagramEmbedUrl,
      uploadDate: recipe.date || new Date().toISOString(),
      thumbnailUrl: `${baseUrl}/${recipe.imageUrl}`,
      url: recipe.instagramUrl
    };
  }

  return schema;
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

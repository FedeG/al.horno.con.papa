import emojiRegex from 'emoji-regex';
import {
  BASE_URL,
  ORGANIZATION,
  SOCIAL_MEDIA_ARRAY,
  CONTACT_POINT,
  RECIPE_DEFAULTS,
  CSS_SELECTORS,
  ASSETS,
  URLS,
  RECIPE_EMOJIS,
  RECIPE_LABELS,
} from './constants';

const emojiRegexPattern = emojiRegex();

// Elimina emojis de un string usando un regex compatible con todos los navegadores soportados
const removeEmojis = (str) => (str || '').replace(emojiRegexPattern, '').trim();

// Genera el schema de Organization mejorado para SEO y AIO
const generateOrganizationSchema = (baseUrl = BASE_URL) => {
  return {
    '@type': 'Organization',
    name: ORGANIZATION.name,
    url: baseUrl,
    logo: ASSETS.logo,
    image: ASSETS.logo,
    description: ORGANIZATION.description,
    sameAs: SOCIAL_MEDIA_ARRAY,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: CONTACT_POINT.type,
      email: CONTACT_POINT.email,
      url: baseUrl,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: ORGANIZATION.addressCountry,
      addressLocality: ORGANIZATION.addressLocality,
    },
    founder: {
      '@type': 'Person',
      name: ORGANIZATION.name,
    },
  };
};

// Genera el schema de Person para el autor
const generatePersonSchema = (baseUrl = BASE_URL) => {
  return {
    '@type': 'Person',
    name: ORGANIZATION.founderName,
    url: baseUrl,
    sameAs: SOCIAL_MEDIA_ARRAY,
    worksFor: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
    },
  };
};

// Genera el schema de WebSite con SearchAction
const generateWebSiteSchema = (baseUrl = BASE_URL) => {
  return {
    '@type': 'WebSite',
    url: baseUrl,
    name: ORGANIZATION.name,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      logo: {
        '@type': 'ImageObject',
        url: ASSETS.logo,
      },
    },
  };
};

// Parsea los pasos de la receta desde la descripción
const parseRecipeSteps = (description, slug, imageUrl, baseUrl = BASE_URL) => {
  const lines = description.split('\n');
  const pasoIndex = lines.findIndex(line => 
    line.includes(RECIPE_EMOJIS.steps) || line.includes(RECIPE_LABELS.steps)
  );
  
  if (pasoIndex === -1) return [];
  
  const stepsSection = lines.slice(pasoIndex + 1);
  const tipIndex = stepsSection.findIndex(line => 
    line.includes(RECIPE_EMOJIS.tips) || line.includes(RECIPE_LABELS.tips)
  );
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
      name: `${RECIPE_LABELS.stepPrefix} ${index + 1}`,
      text: text,
      url: URLS.getRecipeUrl(slug),
      image: URLS.getRecipeImageUrl(imageUrl),
    }));
};

// Parsea el tiempo total de la receta desde el texto de descripción.
// Soporta formatos de minutos, horas, combinaciones y rangos.
// Retorna los minutos como número, o null si no se puede parsear con certeza.
const parseRecipeTime = (description) => {
  if (!description) return null;

  // Buscar la línea que contiene el emoji de tiempo
  const timeLine = description.split('\n').find(line => line.includes(RECIPE_EMOJIS.time));
  if (!timeLine) return null;

  // Extraer el texto después del emoji de tiempo
  const timeEmojiRegex = new RegExp(`^[^${RECIPE_EMOJIS.time}]*${RECIPE_EMOJIS.time}\\s*`);
  const afterEmoji = timeLine.replace(timeEmojiRegex, '');

  // Remover etiquetas comunes: "Tiempo:", "Tiempo total:", "Tiempo de preparación:"
  const timeText = afterEmoji
    .replace(/^Tiempo(?:\s+de\s+preparaci[oó]n|\s+total)?\s*:\s*/i, '')
    .replace(/[⏳⌛️].*$/, '')
    .trim();

  if (!timeText) return null;

  // No parsear si contiene días o semanas (no representan minutos de cocción útiles)
  if (/\bd[ií]as?\b|\bsemanas?\b/i.test(timeText)) return null;

  // No parsear si hay una segunda fase con número después de "+" (múltiples etapas)
  if (/\+/.test(timeText) && /\d/.test(timeText.replace(/^[^+]*\+/, ''))) return null;

  // No parsear si hay fases etiquetadas (ej: "10 minutos de preparación y 45 de cocción")
  if (/\d+\s*(?:minutos?|min|horas?|h)\s+de\s+(?:preparaci[oó]n|cocci[oó]n|horno|reposo|armado)/i.test(timeText)) return null;

  // Formato "X:Y horas" (ej: "2:30 horas") — validar que los minutos sean < 60
  let m = timeText.match(/^(\d+):(\d+)\s*horas?/i);
  if (m) {
    const mins = parseInt(m[2]);
    if (mins >= 60) return null;
    return parseInt(m[1]) * 60 + mins;
  }

  // Formato "X hora(s) y media" (ej: "1 hora y media", "2 horas y media")
  m = timeText.match(/^(\d+)\s*horas?\s+y\s+media\b/i);
  if (m) return parseInt(m[1]) * 60 + 30;

  // Formato "X hora(s) y Y min(utos)" (ej: "1 hora y 30 minutos")
  m = timeText.match(/^(\d+)\s*horas?\s+y\s+(\d+)\s*min/i);
  if (m) return parseInt(m[1]) * 60 + parseInt(m[2]);

  // Formato "X h(ora(s)?) Y min(utos)?" (ej: "1 hora 30 minutos", "1 h 30 min")
  m = timeText.match(/^(\d+)\s*h(?:oras?)?\s+(\d+)\s*min/i);
  if (m) return parseInt(m[1]) * 60 + parseInt(m[2]);

  // "media hora" → 30 minutos
  if (/^media\s+hora/i.test(timeText)) return 30;

  // Formato "X/Y hora(s)" (rango de horas, tomar el mínimo para no sobrestimar) (ej: "3/4 horas")
  m = timeText.match(/^(\d+)\/(\d+)\s*horas?/i);
  if (m) return parseInt(m[1]) * 60;

  // Formato "X hora(s)..." (ej: "1 hora", "2 horas aprox", "1h", "2h aprox")
  m = timeText.match(/^(\d+)\s*h(?:oras?)?(?:\b|\s|$)/i);
  if (m) return parseInt(m[1]) * 60;

  // Formato "X-Y min(utos)" o "X/Y min(utos)" (rango, tomar el mínimo para no sobrestimar)
  m = timeText.match(/^(\d+)[-/](\d+)\s*min/i);
  if (m) return parseInt(m[1]);

  // Formato "X min(utos)" (ej: "20 minutos", "15 min")
  m = timeText.match(/^(\d+)\s*min/i);
  if (m) return parseInt(m[1]);

  return null;
};

// Genera schema JSON-LD para una receta
export const generateRecipeSchema = (recipe, baseUrl = BASE_URL) => {
  // Parsear tiempo total de la receta desde el texto de descripción
  const timeMinutes = parseRecipeTime(recipe.description);
  
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
          url: URLS.getRecipeUrl(recipe.slug),
          image: URLS.getRecipeImageUrl(recipe.imageUrl),
        }
      ];

  const recipeSchema = {
    '@type': 'Recipe',
    name: removeEmojis(recipe.name),
    description: recipe.description.split('\n').filter(line => line.trim().length > 0)[1] || 'Receta deliciosa lista para preparar',
    image: URLS.getRecipeImageUrl(recipe.imageUrl),
    url: URLS.getRecipeUrl(recipe.slug),
    sameAs: URLS.getRecipeUrl(recipe.slug),
    author: generatePersonSchema(baseUrl),
    recipeCategory: recipe.tags?.length ? recipe.tags[0] : 'Recipe',
    recipeCuisine: RECIPE_DEFAULTS.cuisine,
    ...(timeMinutes !== null ? { totalTime: `PT${timeMinutes}M` } : {}),
    recipeYield: RECIPE_DEFAULTS.servings,
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
      ratingValue: RECIPE_DEFAULTS.rating.value,
      reviewCount: RECIPE_DEFAULTS.rating.reviewCount,
      ratingCount: RECIPE_DEFAULTS.rating.ratingCount,
    },
    datePublished: recipe.date || new Date().toISOString(),
    isAccessibleForFree: true
  };

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'WebPage',
    mainEntity: recipeSchema,
    publisher: generateOrganizationSchema(baseUrl),
    url: URLS.getRecipeUrl(recipe.slug),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: CSS_SELECTORS.recipe,
    },
    '@graph': [
      generateWebSiteSchema(baseUrl),
      recipeSchema
    ]
  };
  
  // Agregar video si existe
  if (recipe.instagramUrl) {
    const instagramEmbedUrl = recipe.instagramUrl.endsWith('/')
      ? `${recipe.instagramUrl}embed/`
      : `${recipe.instagramUrl}/embed/`;

    recipeSchema.video = {
      '@type': 'VideoObject',
      name: removeEmojis(recipe.name),
      description: recipe.description.split('\n').filter(line => line.trim().length > 0)[1] || 'Video receta',
      contentUrl: recipe.instagramUrl,
      embedUrl: instagramEmbedUrl,
      uploadDate: recipe.date || new Date().toISOString(),
      thumbnailUrl: URLS.getRecipeImageUrl(recipe.imageUrl),
      url: recipe.instagramUrl
    };
  }

  return schema;
};

// Genera schema para página de listado de recetas
export const generateCollectionSchema = (baseUrl = BASE_URL) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Al Horno Con Papá - Recetas de cocina',
    description: ORGANIZATION.description,
    url: baseUrl,
    image: ASSETS.defaultImage,
    sameAs: baseUrl,
    // speakable para búsqueda por voz y AI Overviews
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: CSS_SELECTORS.collection,
    },
    publisher: generateOrganizationSchema(baseUrl),
    mainEntity: {
      '@type': 'ItemList',
      name: 'Recetas',
      description: 'Todas nuestras recetas deliciosas'
    }
  };
};

// Genera schema para breadcrumbs
export const generateBreadcrumbSchema = (items, baseUrl = BASE_URL) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.url}`,
      sameAs: `${baseUrl}${item.url}`
    })),
    // speakable para compatibilidad con Google Assistant
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: CSS_SELECTORS.breadcrumb,
    }
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

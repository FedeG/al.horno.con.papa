// Constantes de configuración global para la aplicación
// Cambiar estos valores aquí actualizará toda la aplicación automáticamente

// URL base de la aplicación
export const BASE_URL = 'https://alhornoconpapa.com.ar';

// Información de la Organización
export const ORGANIZATION = {
  name: 'Al Horno Con Papá',
  founderName: 'Federico Gonzalez',
  url: BASE_URL,
  email: 'contacto@alhornoconpapa.com.ar',
  addressCountry: 'AR',
  addressLocality: 'Argentina',
  description: 'Recetas deliciosas compartidas con amor. Cocina en familia con recetas vegetarianas, veganas, fáciles y más.',
};

// Información del Creador/Autor
export const AUTHOR = {
  name: 'Federico Gonzalez',
  bio: 'Soy Fede, ingeniero en sistemas.',
  hobby: 'Mi hobby es cocinar y compartir la cocina en familia 👨‍🍳😊',
  ctaText: 'Si hacés una receta, etiquetame en Instagram para que la vea 📸',
};
  
// Información para el Header
export const HEADER = {
  title: ORGANIZATION.name,
  subtitle: 'Recetas reales para cocinar en familia',
};

// Redes Sociales
export const SOCIAL_MEDIA = {
  instagram: 'https://www.instagram.com/alhornoconpapa/',
  facebook: 'https://www.facebook.com/alhornoconpapa/',
  tiktok: 'https://www.tiktok.com/@alhornoconpapa/',
  youtube: 'https://www.youtube.com/@alhornoconpapa/',
};

// Handles/Usernames para redes sociales
export const SOCIAL_HANDLES = {
  instagram: 'al.horno.con.papa',
  facebookId: '105051402450049',
};

// Contact
export const CONTACT = {
  email: 'info@alhornoconpapa.com',
  phoneSupport: 'contacto@alhornoconpapa.com.ar',
};

// Rutas de archivos/imágenes estáticas
export const ASSETS = {
  logo: `${BASE_URL}/logo.jpg`,
  defaultImage: `${BASE_URL}/og-default.jpg`,
};

// Esquemas preconfigurados
export const RECIPE_DEFAULTS = {
  servings: '4 porciones',
  cuisine: 'Argentine',
  rating: {
    value: '5',
    reviewCount: '1',
    ratingCount: '1',
  },
};

// Emojis para parsear recetas
export const RECIPE_EMOJIS = {
  ingredients: '🥣',
  steps: '👣',
  tips: '💡',
  time: '⏳',
  sectionMarkers: ['👣', '🔪', '📝', '🍽️', '⏰', '👨‍👦', '🧒'],
};

// Labels para recetas
export const RECIPE_LABELS = {
  ingredients: 'Ingredientes',
  steps: 'Pasos',
  tips: 'Tip',
  time: 'Tiempo',
  stepPrefix: 'Paso',
};

// Selectores CSS para speakable
export const CSS_SELECTORS = {
  recipe: ['.recipe-name', '.recipe-description', '.recipe-ingredients', '.recipe-instructions'],
  collection: ['.recipes-grid', '.recipe-card', '.recipe-description'],
  breadcrumb: ['.breadcrumb'],
};

// Configuración de contacto
export const CONTACT_POINT = {
  type: 'Customer Service',
  email: CONTACT.phoneSupport,
};

// Generar lista de redes sociales como array (para sameAs)
export const SOCIAL_MEDIA_ARRAY = Object.values(SOCIAL_MEDIA);

// Configuración por ambiente (development, production, etc.)
// Cambiar aquí según el ambiente
export const ENVIRONMENT = process.env.REACT_APP_ENV || 'production';

// URLs completas para funciones comunes
export const URLS = {
  home: BASE_URL,
  sitemap: `${BASE_URL}/sitemap.xml`,
  robots: `${BASE_URL}/robots.txt`,
  getRecipeUrl: (slug) => `${BASE_URL}/recipe/${slug}`,
  getRecipeImageUrl: (imagePath) => `${BASE_URL}/${imagePath}`,
};

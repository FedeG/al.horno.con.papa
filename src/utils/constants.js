// Constantes de configuración global para la aplicación
// Cambiar estos valores aquí actualizará toda la aplicación automáticamente

// URL base de la aplicación
export const BASE_URL = 'https://alhornoconpapa.com.ar';

// Información de la Organización
export const ORGANIZATION = {
  name: 'Al Horno Con Papá',
  founderName: 'Federico Gonzalez',
  url: BASE_URL,
  email: '',
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
  facebook: 'https://www.facebook.com/al.horno.con.papa/',
  tiktok: 'https://www.tiktok.com/@alhornoconpapa/',
  youtube: 'https://www.youtube.com/@alhornoconpapa/',
};

// Handles/Usernames para redes sociales
export const SOCIAL_HANDLES = {
  instagram: 'al.horno.con.papa',
  facebook: 'al.horno.con.papa',
  facebookId: '105051402450049',
};

// Contact
export const CONTACT = {
  email: '',
  phoneSupport: '',
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
  getRecipeUrl: (slug) => `${BASE_URL}/recipe/${slug}/`,
  getRecipeImageUrl: (imagePath) => `${BASE_URL}/${imagePath}`,
};

// Rutas internas de la app (para navegación con react-router)
export const ROUTES = {
  tools: '/herramientas/',
  equivalencias: '/herramientas/equivalencias/',
  temperaturas: '/herramientas/temperaturas/',
  escalarReceta: '/herramientas/escalar-receta/',
  moldes: '/herramientas/moldes/',
  costoPorcion: '/herramientas/costo-porcion/',
  queCocino: '/herramientas/que-cocino/',
};

// Herramientas disponibles (cards de /herramientas/)
export const TOOLS = [
  {
    slug: 'equivalencias',
    name: 'Equivalencias',
    description:
      'Convertí unidades de cocina: ml, gr, tazas, cucharadas y cucharaditas.',
    path: ROUTES.equivalencias,
  },
  {
    slug: 'temperaturas',
    name: 'Temperaturas de horno',
    description:
      'Convertí grados Celsius/Fahrenheit y descubrí el nivel de horno.',
    path: ROUTES.temperaturas,
  },
  {
    slug: 'escalar',
    name: 'Escalado de recetas',
    description:
      'Cambiá las porciones de una receta y recalculá todas las cantidades.',
    path: ROUTES.escalarReceta,
  },
  {
    slug: 'moldes',
    name: 'Conversor de moldes',
    description:
      'Adaptá una receta a otro molde: cantidad y tiempo de cocción.',
    path: ROUTES.moldes,
  },
  {
    slug: 'costo',
    name: 'Costo por porción',
    description:
      'Calculá cuánto sale cada porción según los precios de los ingredientes.',
    path: ROUTES.costoPorcion,
  },
  {
    slug: 'que-cocino',
    name: 'Qué cocino con lo que tengo',
    description:
      'Ingresá lo que tenés en la heladera y te sugerimos recetas compatibles.',
    path: ROUTES.queCocino,
  },
];

// Unidades soportadas por el conversor. `ml` es la base de volumen.
export const UNITS = [
  { id: 'ml', label: 'Mililitros (ml)', ml: 1 },
  { id: 'gr', label: 'Gramos (gr)' },
  { id: 'taza', label: 'Tazas', ml: 240 },
  { id: 'cucharada', label: 'Cucharadas', ml: 15 },
  { id: 'cucharadita', label: 'Cucharaditas', ml: 5 },
];

// Densidad en g/ml por ingrediente (para convertir peso ↔ volumen).
// "agua" es el valor por defecto: 1 g = 1 ml.
export const INGREDIENTS = [
  { id: 'agua', label: 'Agua / genérico', density: 1.0 },
  { id: 'leche', label: 'Leche', density: 1.03 },
  { id: 'aceite', label: 'Aceite', density: 0.92 },
  { id: 'harina', label: 'Harina', density: 0.53 },
  { id: 'azucar', label: 'Azúcar', density: 0.85 },
  { id: 'sal', label: 'Sal', density: 1.21 },
  { id: 'arroz', label: 'Arroz', density: 0.85 },
  { id: 'mantequilla', label: 'Mantequilla', density: 0.91 },
  { id: 'miel', label: 'Miel', density: 1.42 },
  { id: 'cacao', label: 'Cacao', density: 0.4 },
];

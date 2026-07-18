# 🍳 Al Horno Con Papá

**SPA de mis recetas** — catálogo de recetas de mi cuenta de cocina [@al.horno.con.papa](https://instagram.com/al.horno.con.papa) con búsqueda inteligente.

🌐 **[Ver sitio →](https://alhornoconpapa.com.ar)**

## 🏗️ Arquitectura y aspectos técnicos

| Área | Implementación |
| ---- | -------------- |
| **Frontend** | React 18 SPA con routing client-side, lazy loading de imágenes, responsive mobile-first |
| **Búsqueda** | Fuzzy search con **Fuse.js** + threshold dinámico por token + autocomplete sobre ingredientes/nombres/tags |
| **Accesibilidad** | Skip-to-content, keyboard navigation, ARIA roles (`listbox`/`option`/`button`), `prefers-reduced-motion`, WCAG compliant |
| **PWA** | Service worker cache-first + network-first navigation, offline page, manifest con theme consistente |
| **SEO** | Schema.org (Recipe + Organization + WebSite + BreadcrumbList), JSON-LD dinámico, OG tags, hreflang-ready, prerenderizado con react-snap |
| **Hosting** | Cloudflare Pages con dominio personalizado, CDN global, HTTP/3 |
| **Backend** | Python scraper + pipeline de sincronización automática desde Instagram con normalización de tags y extracción de ingredientes |
| **CI/CD** | GitHub Actions: tests en cada push → Cloudflare Pages deploy automático desde `main` |
| **Testing** | **Tests** (unit + integración + funcional) con `@testing-library/react`, corriendo en CI |

## 🧪 Calidad

```bash
yarn test
```

| Tipo | Qué cubren |
| ---- | ---------- |
| Unitarios (utils) | Filtros fuzzy, paginación, URLs, SEO helpers, autocomplete |
| Componentes (smoke) | Header, Footer, RecipeCard, SearchBar, Pagination, TagFilter, ErrorBoundary |
| Integración RecipeList | Búsqueda con debounce, filtros por tag/fácil, combinación, paginación, autocomplete, query params |
| Integración RecipeDetail | Slug loading, 404, recetas relacionadas, navegación, case insensitive, ID retrocompat |
| Fuzzy thresholds | Typos, acentos, multi-token intersección, stopwords, threshold dinámico |
| Happy path | Flujo completo listado → detalle → volver |
| SEO helpers | extractDescription edge cases |

## 🚀 Quick Start

```bash
nvm use 22
yarn install
yarn start        # Desarrollo (http://localhost:3000)
yarn build        # Producción
yarn build:full   # Producción completa (prebuild + build + postbuild)
yarn test         # Tests
```

### Scripts de Sincronización

**Nota:** `yarn build` solo ejecuta el build de React. Para el build completo de producción (optimize imágenes, sitemap, react-snap) usar `yarn build:full`.

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Sincronizar desde Instagram
python main.py

# Actualizar recetas existentes (normalizar tags, etc)
python local_update.py

# Extraer campo específico a txt
python extract_field.py tags --unique
```

Ver [scripts/README.md](scripts/README.md) para documentación completa de los scripts.

## 🧩 Funcionalidades clave

### 🔍 Búsqueda inteligente

Autocomplete prioriza ingredientes sobre nombres y tags. Fuzzy search con **Fuse.js**: tokens cortos usan threshold más estricto, tokens largos son más permisivos. Stopwords se filtran automáticamente.

### ♿ Accesibilidad

Skip-to-content link, navegación por teclado en tarjetas y autocomplete, roles ARIA (`listbox`, `option`, `button`), `prefers-reduced-motion` respetado en scroll y animaciones.

### 📱 UI responsive

Mobile-first con 6 recetas por página, CSS custom properties, gradientes consistentes, animaciones suaves.

### 🔗 Deep linking

Cada receta tiene URL única por slug. Tags y búsqueda se reflejan en query params. Compartir cualquier estado de filtro.

### 📡 Offline-first (PWA)

Service worker con estrategia cache-first para assets estáticos y network-first para navegación. Página offline personalizada con diseño de marca.

## 🤖 Pipeline de datos (Python)

`Instagram` → `Instaloader` → `ParserService` (normalización de tags, extracción de ingredientes, descarga de imágenes) → `recipes.json`

### Normalización de Tags

El `ParserService` normaliza tags automáticamente:

- Aplica sinónimos: `vegan` → `vegano`
- Filtra tags genéricos: `food`, `instagood`, etc.
- Elimina tags redundantes con el nombre de la receta
- Detecta tag `facil` para marcar recetas rápidas

### Extracción de Ingredientes

El parser detecta automáticamente la sección de ingredientes:

- Soporta emoji 🥣 o 👨🏼‍🍳
- Extrae bullets (•, -, 🔸)
- Limpia cantidades, unidades, artículos
- Singulariza palabras

## 📁 Estructura del proyecto

```
src/
├── components/       # Header, SearchBar, TagFilter, RecipeCard, RecipeGrid, RecipeDetail, Pagination, Footer, ErrorBoundary
├── pages/            # RecipeList, RecipeDetailPage
├── context/          # RecipesContext
├── hooks/            # Hooks personalizados
├── utils/            # Filtros, paginación, SEO helpers, analytics, URL utils
├── data/             # recipes.json + featured tags y rutas
└── __tests__/        # 6 suites
.github/workflows/    # CI con tests en cada push
public/               # SW, manifest, offline page, assets, sitemap, robots.txt
scripts/              # Python scraper + pipeline de datos + generación de sitemap
```

## 🛠️ Stack

| Capa | Tecnología |
| ---- | ---------- |
| **UI** | React 18, React Router 7, Lucide React |
| **Testing** | Jest + @testing-library/react + @testing-library/user-event |
| **Búsqueda** | Fuse.js con threshold dinámico y normalización NFKD |
| **PWA** | Service Worker custom + manifest.json + offline page |
| **Pre-renderizado** | react-snap para crawlers SEO |
| **Hosting** | Cloudflare Pages + CDN global |
| **CI** | GitHub Actions |
| **Scraping** | Python 3, Instaloader |
| **IA** | Ollama (planeado para enriquecimiento de recetas) |

## 🎨 Personalización

### 1. Tags Destacadas

Edita `src/data/recipes.js`:

```javascript
export const featuredTags = [
  'Todas', 
  'Vegetariano', 
  'Facil', 
  'Vegano', 
  'Argentina',
  // ... tus tags destacadas
];
```

### 2. Cambiar Colores

En `src/App.css`, busca y modifica los gradientes:

```css
/* Header gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary button */
background: linear-gradient(135deg, #C4704F 0%, #B85C3E 100%);
```

### 3. Contenido desde Instagram

```bash
cd scripts
# Editar configuración
nano constants.py  # Actualiza INSTAGRAM_USERNAME, LOGIN_USERNAME, LOGIN_PASSWORD

# Sincronizar
python main.py
```

Esto:

- Descarga posts nuevos desde Instagram
- Extrae hashtags y los normaliza como tags
- Extrae ingredientes de la sección 🥣 Ingredientes 🥣
- Descarga imágenes localmente
- Actualiza `src/data/recipes.json`

## 🌐 Deploy

**Automático** vía Cloudflare Pages en cada push a `main`:

1. GitHub Actions corre los tests
2. Cloudflare Pages detecta el push, hace `yarn build:full` y deploya a producción

La integración está configurada desde el dashboard de Cloudflare Pages con el repo de GitHub.

## 🔧 Scripts Disponibles

| Script | Descripción |
| ------ | ----------- |
| `yarn build:full` | Build completo: optimize imágenes, sitemap, react-scripts build, react-snap |
| `yarn build` | Solo react-scripts build (sin optimize ni sitemap) |
| `main.py` | Sincroniza posts nuevos desde Instagram |
| `local_update.py` | Actualiza recetas existentes (tags, campos faltantes) |
| `extract_field.py` | Extrae un campo específico a archivo txt |
| `generate-sitemap.js` | Genera sitemap.xml dinámico |

Ver [scripts/README.md](scripts/README.md) para documentación completa.

## 🐛 Troubleshooting

### Build falla

```bash
rm -rf node_modules yarn.lock
yarn install
yarn build:full
```

### Tests fallan

```bash
# Asegurarse de usar Node 22
nvm use 22

# Ver salida detallada
yarn test --watchAll=false --verbose
```

### Scripts de Python fallan

```bash
cd scripts
rm -rf venv
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

### Instagram no devuelve posts

- Verifica `INSTAGRAM_USERNAME` en `constants.py`
- Si es cuenta privada, configura `LOGIN_USERNAME` y `LOGIN_PASSWORD`
- Instagram puede requerir verificación 2FA (el script lo detecta)

## 🚀 Próximas Features

### 🤖 Procesamiento con IA Local (Ollama)

En desarrollo: Sistema de enriquecimiento de recetas usando modelos de lenguaje locales.

**Features planeadas:**

- 🏷️ **Optimización automática de tags** con contexto completo
- 🔗 **Detección inteligente de recetas relacionadas**
- 📊 **Análisis nutricional** y sugerencias de maridaje
- 🎯 **Sistema de recomendaciones** personalizado
- 🔍 **Búsqueda semántica** ("cena rápida sin gluten")

Ver [ia.md](ia.md) para documentación completa del roadmap de IA.

## 📝 Licencia

MIT - FedeG - Federico Gonzalez © 2026

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -am 'Agrega nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

## 📧 Contacto

- 🌐 Web: [alhornoconpapa.com.ar](https://alhornoconpapa.com.ar)
- 📸 Instagram: [@al.horno.con.papa](https://instagram.com/al.horno.con.papa)
- 📘 Facebook: [@al.horno.con.papa](https://facebook.com/al.horno.con.papa)

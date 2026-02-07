# 🍳 Al Horno Con Papá

Aplicación web para compartir recetas de cocina en familia. Diseño mobile-first con búsqueda inteligente, filtros, paginación, videos de Instagram embebidos y sincronización automática desde Instagram.

🌐 **[Ver Demo](https://fedeg.github.io/al_horno_con_papa)**

---

## ✨ Características

### Frontend

- 🔍 **Búsqueda inteligente** con autocompletado (ingredientes, nombres, tags)
- 🏷️ **Filtros dinámicos** por tags con tags destacadas
- ⚡ **Filtro rápido** para recetas fáciles y rápidas
- 📄 **Paginación** (6 recetas por página)
- 🎥 **Videos de Instagram embebidos** (reels y posts)
- 🔗 **Recetas relacionadas** basadas en tags comunes
- 📱 **Responsive design** optimizado para móviles
- 🎨 **UI moderna** con gradientes y animaciones suaves
- 🔗 **Deep linking** con soporte para compartir URLs específicas

### Backend (Scripts)

- 🤖 **Sincronización automática** desde Instagram
- 🏷️ **Normalización inteligente** de tags (sinónimos, filtros)
- 🥣 **Extracción automática** de ingredientes desde captions
- 📸 **Descarga local** de imágenes para mejor performance
- 🔄 **Actualización incremental** (solo posts nuevos)
- 🔧 **Scripts de utilidad** para mantenimiento

---

## 🚀 Quick Start

### Desarrollo Frontend

```bash
# Instalar dependencias
yarn install

# Iniciar servidor de desarrollo
yarn start

# Build para producción
yarn build
```

### Scripts de Sincronización

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Sincronizar desde Instagram
python main.py

# Actualizar recetas existentes (normalizar tags, etc)
python local_update.py

# Extraer campo específico a txt
python extract_field.py tags --unique
```

Ver [scripts/README.md](scripts/README.md) para documentación completa de los scripts.

---

## 📁 Estructura del Proyecto

```
.
├── public/
│   ├── images/              # Imágenes descargadas de Instagram
│   ├── index.html           # Template HTML con SPA routing
│   ├── 404.html             # Página 404 para GitHub Pages
│   └── manifest.json        # PWA manifest
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.js
│   │   ├── SearchBar.js
│   │   ├── TagFilter.js
│   │   ├── RecipeGrid.js
│   │   ├── RecipeCard.js
│   │   ├── RecipeDetail.js
│   │   ├── Pagination.js
│   │   └── Footer.js
│   ├── data/
│   │   ├── recipes.json     # Datos de recetas (generado por scripts)
│   │   └── recipes.js       # Export + featured tags
│   ├── utils/
│   │   └── index.js         # Utilidades (filtros, paginación, etc)
│   ├── App.js               # Componente principal con routing
│   ├── App.css              # Estilos globales
│   └── index.js             # Entry point
├── scripts/
│   ├── main.py              # Sincronización desde Instagram
│   ├── local_update.py      # Actualización local de recetas
│   ├── extract_field.py     # Extractor de campos a txt
│   ├── fix_reel_urls.py     # Corrector de URLs /p/ → /reel/
│   ├── constants.py         # Configuración centralizada
│   ├── requirements.txt     # Dependencias Python
│   ├── services/
│   │   ├── instagram_service.py  # Servicio de Instagram
│   │   └── parser_service.py     # Servicio de parsing
│   └── README.md            # Documentación de scripts
├── ia.md                    # 🚀 Próxima feature: IA con Ollama
├── deploy.sh                # Script de deploy manual
└── package.json
```

---

## 🎨 Personalización

### 1. Actualizar Recetas desde Instagram (Automático)

El proyecto incluye scripts para sincronizar automáticamente desde tu cuenta de Instagram:

```bash
cd scripts

# Editar configuración
nano constants.py  # Actualiza INSTAGRAM_USERNAME, LOGIN_USERNAME, LOGIN_PASSWORD

# Ejecutar sincronización
python main.py
```

Esto:

- ✅ Descarga posts nuevos desde Instagram
- ✅ Extrae hashtags y los normaliza como tags
- ✅ Extrae ingredientes de la sección 🥣 Ingredientes 🥣
- ✅ Descarga imágenes localmente
- ✅ Actualiza `src/data/recipes.json`

Ver [scripts/README.md](scripts/README.md) para más detalles.

### 2. Actualizar Recetas Existentes

Para re-procesar recetas ya existentes (normalizar tags, generar campos faltantes, etc):

```bash
cd scripts
python local_update.py          # Modo normal
python local_update.py --force  # Forzar actualización de todos los campos
```

### 3. Tags Destacadas

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

### 4. Cambiar Colores

En `src/App.css`, busca y modifica los gradientes:

```css
/* Header gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary button */
background: linear-gradient(135deg, #C4704F 0%, #B85C3E 100%);
```

### 5. Configurar Dominio Personalizado

En `package.json`:

```json
"homepage": "https://TU_DOMINIO.com"
```

Y crea un archivo `public/CNAME` con tu dominio:

```
tudominio.com
```

---

---

## 🌐 Deploy a GitHub Pages

### Método 1: Automático (GitHub Actions)

Ya está configurado en `.github/workflows/deploy.yml`.

1. Sube el código a GitHub
2. Ve a Settings → Pages → Source: "GitHub Actions"
3. Cada push a `main` despliega automáticamente

### Método 2: Manual

```bash
./deploy.sh
# o
yarn deploy
```

Espera 2-5 minutos para que GitHub Pages actualice el sitio.

---

## 🛠️ Stack Tecnológico

### Frontend

- **React 18** - UI library
- **React Router** - Client-side routing con deep linking
- **Lucide React** - Iconos modernos
- **CSS3** - Estilos con gradientes y animaciones
- **GitHub Pages** - Hosting estático

### Backend (Scripts)

- **Python 3** - Lenguaje de scripting
- **Instaloader** - API de Instagram
- **Requests** - Descarga de imágenes
- **JSON** - Formato de datos

---

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `main.py` | Sincroniza posts nuevos desde Instagram |
| `local_update.py` | Actualiza recetas existentes (tags, campos faltantes) |
| `extract_field.py` | Extrae un campo específico a archivo txt |
| `fix_reel_urls.py` | Corrige URLs de /p/ a /reel/ para videos |

Ver [scripts/README.md](scripts/README.md) para documentación completa.

---

## 🐛 Troubleshooting

### Build falla

```bash
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Deploy falla

- Verifica que `homepage` en `package.json` sea correcto
- Asegúrate de tener permisos de escritura en el repo
- Espera 2-5 minutos después del deploy
- Revisa los logs en Actions tab de GitHub

### Scripts de Python fallan

```bash
cd scripts

# Re-crear entorno virtual
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Instagram no devuelve posts

- Verifica `INSTAGRAM_USERNAME` en `constants.py`
- Si es cuenta privada, configura `LOGIN_USERNAME` y `LOGIN_PASSWORD`
- Instagram puede requerir verificación 2FA (el script lo detecta)

---

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

---

## 📊 Features Destacados

### Búsqueda Inteligente

El componente `SearchBar` usa `generateAutocompleteSuggestions` que busca en:

1. 🥕 **Ingredientes** (prioridad alta)
2. 📝 **Nombres de recetas**
3. 🏷️ **Tags**

### Normalización de Tags

El `ParserService` normaliza tags automáticamente:

- ✅ Aplica sinónimos: `vegan` → `vegano`
- ✅ Filtra tags genéricos: `food`, `instagood`, etc.
- ✅ Elimina tags redundantes con el nombre de la receta
- ✅ Detecta tag `facil` para marcar recetas rápidas

### Extracción de Ingredientes

El parser detecta automáticamente la sección de ingredientes:

- Soporta emoji 🥣 o 👨🏼‍🍳
- Extrae bullets (•, -, 🔸)
- Limpia cantidades, unidades, artículos
- Singulariza palabras

---

## 📝 Licencia

MIT - Fede Goldschmidt © 2026

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -am 'Agrega nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

---

## 📧 Contacto

- 🌐 Web: [alhornoconpapa.com.ar](https://alhornoconpapa.com.ar)
- 📸 Instagram: [@al.horno.con.papa](https://instagram.com/al.horno.con.papa)
- 📘 Facebook: [@al.horno.con.papa](https://facebook.com/al.horno.con.papa)

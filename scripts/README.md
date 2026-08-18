# 🐍 Scripts de Automatización

Scripts para sincronizar recetas desde Instagram a JSON automáticamente.

## 📁 Estructura del Proyecto

```
scripts/
├── main.py                    # Orquestador principal
├── constants.py              # Configuración centralizada
├── requirements.txt          # Dependencias Python
├── services/
│   ├── instagram_service.py  # Manejo de Instagram (posts, imágenes)
│   └── parser_service.py     # Procesamiento y parsing de datos
└── README.md
```

## 🚀 Setup

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 📝 Configuración

### 1. Edita `constants.py`

```python
# Usuario de Instagram a sincronizar
INSTAGRAM_USERNAME = "tu_usuario_instagram"

# Credenciales para login (opcional pero recomendado)
LOGIN_USERNAME = "tu_usuario"
LOGIN_PASSWORD = "tu_password"

# Rutas de archivos
RECIPES_FILE = "src/data/recipes.json"
IMAGES_DIR = "public/images"

# Tags a omitir
TAGS_TO_SKIP = ["instagram", "instagood", "food", ...]

# Sinónimos de tags (normalización)
TAG_SYNONYMS = {
    "vegano": ["vegan", "vegano"],
    "vegetariano": ["vegetariano", "vegetarian"],
    ...
}

# IDs de posts pineados (no afectan fecha límite)
PINNED_MEDIAIDS = [3283787029367823611, ...]
```

## 🎯 Uso

### Ejecución básica

```bash
python main.py
```

Si Instagram rechaza el acceso anónimo con 429 (común desde fines de 2024),
forzando el uso de la sesión guardada (o login si no hay sesión previa):

```bash
python main.py --force-login
```

### Lo que hace

1. 🔍 **Consulta el perfil** (anónimo si es público; sin riesgo para ninguna cuenta)
2. 📚 **Lee recetas existentes** en `recipes.json`
3. 📅 **Obtiene fecha más reciente** de posts ya procesados
4. 📸 **Descarga posts nuevos** desde Instagram (hasta encontrar uno más antiguo)
5. 🖼️ **Descarga imágenes localmente** a `public/images/`
6. 🏷️ **Procesa hashtags** como tags (con normalización y filtros)
7. 🥣 **Extrae ingredientes** de la sección `🥣 Ingredientes 🥣`
8. 💾 **Guarda todo** en `recipes.json` ordenado por fecha

## 🛠️ Servicios

### InstagramService (`services/instagram_service.py`)

Maneja interacción con Instagram:

- **`login(username, password)`** - Opcional. Reutiliza sesión guardada; solo login fresco si no hay sesión. Usar únicamente para perfiles privados o si Instagram exige sesión
- **`get_posts(max_date)`** - Obtiene posts hasta fecha límite (anónimo si el perfil es público)
- **`download_image(url, shortcode, mtime)`** - Descarga imágenes localmente

#### Características especiales

- Respeta posts pineados (no los usa como límite de fecha)
- Acceso anónimo por defecto para perfiles públicos (sin login, sin riesgo de bloqueo)
- Rate limiting conservador (~1 request/30s anónimo) acorde a los límites de Instagram 2024+
- Reutiliza el session file de instaloader: nunca login con contraseña en cada corrida
- Soporta fotos, carruseles y reels
- Descarga inteligente (no re-descarga imágenes existentes)

### ParserService (`services/parser_service.py`)

Procesa y parsea datos:

- **`extract_hashtags(post)`** - Extrae y normaliza tags
- **`extract_ingredients(caption)`** - Parsea ingredientes del caption
- **`extract_description(caption)`** - Limpia descripción (sin hashtags)
- **`extract_recipe_name(caption)`** - Obtiene nombre de primera línea
- **`post_to_recipe(post, local_image)`** - Convierte post a objeto receta
- **`save_recipes(recipes)`** - Guarda JSON ordenado por fecha

#### Inteligencia de parsing

- Normaliza sinónimos de tags (`vegan` → `vegano`)
- Filtra tags genéricos (`food`, `instagood`, etc.)
- Detecta sección de ingredientes por emoji 🥣
- Preserva saltos de línea en descripciones

## ⚙️ Configuración Avanzada

### Autenticación 2FA

El script detecta automáticamente si necesitas 2FA y te pedirá el código:

```
Ingresa el código de verificación de dos factores: 123456
```

### Personalizar procesamiento de tags

En `constants.py` ajusta:

```python
# Agregar tags a omitir
TAGS_TO_SKIP.append("mitag")

# Definir sinónimos
TAG_SYNONYMS["minutri"] = ["saludable", "healthy", "fitness"]
```

### Cambiar formato de ingredientes

Modifica `parser_service.py` → `extract_ingredients()` para ajustar:

- Marcadores de inicio/fin de sección
- Formato de bullets (• ◦ - *)
- Lógica de parsing

## 🔍 Solución de Problemas

### ❌ No se encontraron posts

- Verifica que `INSTAGRAM_USERNAME` sea correcto
- Si es cuenta privada, configura `LOGIN_USERNAME` y `LOGIN_PASSWORD`
- Comprueba que el perfil tenga posts recientes

### ❌ Error de login

- Verifica credenciales en `constants.py`
- Si tienes 2FA habilitado, ingresa el código cuando se solicite
- Instagram puede requerir verificación en navegador

### ⚠️ Imágenes no se descargan

- Verifica permisos de escritura en `public/images/`
- Comprueba conexión a Internet
- El script usa la URL original como fallback

## 📊 Formato de Salida

El script genera `recipes.json` con esta estructura:

```json
[
  {
    "id": 3283787029367823611,
    "name": "Nombre de la receta",
    "description": "Descripción sin hashtags...",
    "tags": ["Vegano", "Chocolate"],
    "instagramUrl": "https://www.instagram.com/p/ABC123/",
    "facebookUrl": "",
    "imageUrl": "images/ABC123.jpg",
    "ingredients": [
      "100g harina",
      "2 huevos"
    ],
    "date": "2026-01-02T10:30:00"
  }
]
```

## 📝 Notas Importantes

- ✅ Solo agrega posts nuevos (por ID, evita duplicados)
- 🔄 Re-ejecutar es seguro (no duplica contenido)
- 🖼️ Imágenes se descargan localmente (mejor performance)
- 📅 Ordenamiento automático por fecha (más recientes primero)
- 📌 Posts pineados se incluyen siempre, no limitan búsqueda
- 🏷️ Normalización inteligente de tags (sinónimos y filtros)

# 🍳 Al Horno Con Papá

Aplicación web para compartir recetas de cocina en familia. Diseño mobile-first con búsqueda inteligente, filtros, paginación y videos de Instagram embebidos.

🌐 **[Ver Demo](https://fedeg.github.io/al_horno_con_papa)**

---

## ✨ Características

- 🔍 Búsqueda con autocompletado
- 🏷️ Filtros por tags
- 📄 Paginación (6 recetas por página)
- 🎥 Videos de Instagram embebidos
- 📱 Responsive design
- 🔗 Recetas relacionadas

---

## 🚀 Uso

```bash
# Instalar dependencias (primera vez)
yarn install

# Desarrollo
yarn start

# Build producción
yarn build

# Deploy a GitHub Pages
yarn deploy
```

---

## 📁 Estructura

```
src/
├── components/          # Componentes React
├── data/recipes.js     # Datos de recetas
├── App.js              # Componente principal
└── App.css             # Estilos
```

---

## 🎨 Personalizar

### Actualizar desde Instagram (Automático)

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configura tu usuario en update_recipes.py
python update_recipes.py
```

Ver [scripts/README.md](scripts/README.md) para más detalles.

### Agregar/Editar Recetas Manualmente

Edita `src/data/recipes.js`:

```javascript
{
  id: 13,
  name: "Nueva Receta",
  description: "Descripción...",
  tags: ["Tag1", "Tag2"],
  instagramUrl: "https://www.instagram.com/reel/...",
  facebookUrl: "https://facebook.com/...",
  imageUrl: "https://images.unsplash.com/...",
  ingredients: ["ingrediente1", "ingrediente2"]
}
```

### Cambiar Colores

En `src/App.css`, modifica:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Cambiar URL del sitio

En `package.json`:

```json
"homepage": "https://TU_USUARIO.github.io/NOMBRE_REPO"
```

---

## 🌐 Deploy a GitHub Pages

### Método 1: Manual

```bash
yarn deploy
```

### Método 2: Automático con GitHub Actions

1. Sube el código a GitHub
2. Settings → Pages → Source: "GitHub Actions"
3. Cada push a `main` despliega automáticamente

El workflow ya está en `.github/workflows/deploy.yml`

---

## 🛠️ Stack

- React 18
- Lucide React (iconos)
- CSS3
- GitHub Pages

---

## 🐛 Troubleshooting

**Build falla:**

```bash
rm -rf node_modules yarn.lock
yarn install
yarn build
```

**Deploy falla:**

- Verifica `homepage` en `package.json`
- Espera 2-5 minutos después del deploy

---

## 📝 Licencia

MIT

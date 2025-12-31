# 🐍 Scripts de Automatización

Scripts para actualizar recetas desde Instagram.

## Setup

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Uso

1. **Configura tu usuario de Instagram:**
   Edita `update_recipes.py` línea 15:
   ```python
   INSTAGRAM_USERNAME = "tu_usuario_instagram"
   ```

2. **Ejecuta el script:**
   ```bash
   python update_recipes.py
   ```

3. **Revisa los cambios:**
   El script actualiza `src/data/recipes.js` automáticamente

## ⚙️ Configuración Avanzada

### Login (cuenta privada)
Si tu cuenta es privada, descomenta y configura:
```python
L.login('tu_usuario', 'tu_password')
```

### Personalizar extracción
En `update_recipes.py` puedes modificar:
- `extract_hashtags()` - Cómo se extraen tags
- `extract_ingredients()` - Detección de ingredientes
- `extract_description()` - Limpieza de descripción

## 📝 Notas

- Solo agrega posts nuevos (evita duplicados)
- Extrae hashtags como tags automáticamente
- Intenta detectar ingredientes del caption
- Mantiene el orden (nuevos primero)

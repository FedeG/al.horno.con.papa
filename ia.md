# 🤖 IA Local con Ollama - Roadmap de Implementación

> **Estado:** 📋 Planeado | **Prioridad:** Alta | **Estimación:** 2-3 semanas

Esta feature agregará capacidades de procesamiento inteligente usando modelos de lenguaje (LLM) 100% locales mediante Ollama, sin necesidad de APIs externas ni costos recurrentes.

---

## 🎯 Objetivos

1. **Enriquecer recetas existentes** con datos generados por IA
2. **Optimizar sistema de tags** para mejores relaciones entre recetas
3. **Mejorar búsqueda** con capacidades semánticas
4. **Generar contenido** automático para redes sociales

---

## 🚀 Instalación de Ollama en Ubuntu

### Paso 1: Instalar Ollama

Abre la terminal y ejecuta el instalador oficial:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verifica la instalación:

```bash
ollama --version
```

### Paso 2: Descargar los Modelos

Para este proyecto, utilizaremos estos modelos según la necesidad:

```bash
ollama pull llama3.2    # El más rápido (ideal para GTX 1050 - 2GB VRAM)
ollama pull llama3      # El más equilibrado y potente (8B parámetros)
ollama pull mistral     # Excelente para razonamiento y cocina
```

**Tiempo estimado de descarga:** 10-30 minutos dependiendo de tu conexión.

### Paso 3: Instalar Dependencias Python

```bash
cd scripts
source venv/bin/activate  # o crear el venv si no existe
pip install ollama
```

---

## 📊 Comparativa de Modelos

| Feature | Llama 3.2 (3B) | Llama 3 (8B) | Mistral (7B) |
|---------|----------------|--------------|--------------|
| Peso en Disco | ~2.0 GB | ~4.7 GB | ~4.1 GB |
| Uso de VRAM | Muy bajo (2GB) | Medio (8GB) | Medio (8GB) |
| Velocidad | ⚡ Instantánea | 🐢 Moderada (usa RAM) | 🐢 Moderada (usa RAM) |
| Ideal para | Clasificación rápida | Tareas complejas | Creatividad/Estructura |
| **Recomendado para este proyecto** | ✅ Sí (GPU 2GB) | ⚠️ Con 8GB+ RAM | ⚠️ Con 8GB+ RAM |

**Recomendación:** Usa `llama3.2` como modelo principal para desarrollo. Los modelos de 7B-8B son más potentes pero requerirán usar RAM del sistema si tu GPU tiene solo 2GB VRAM.

---

## 🗺️ Roadmap de Implementación

### Fase 1: Setup (Semana 1)

- [x] Documentar arquitectura de IA
- [x] Instalar Ollama en servidor de desarrollo
- [x] Descargar y probar modelos (llama3.2, llama3)
- [ ] Crear estructura de carpetas `scripts/ai/`
- [ ] Testear integración básica Python + Ollama

### Fase 2: Optimizador de Tags (Semana 2)

- [ ] Implementar análisis de tags existentes
- [ ] Crear generador de sistema estándar de tags
- [ ] Implementar reglas de relación automáticas
- [ ] Procesar recetas con contexto completo
- [ ] Testear con 50 recetas
- [ ] Ejecutar sobre las ~500 recetas completas
- [ ] Actualizar frontend para usar nuevos tags

### Fase 3: Enriquecedor de Recetas (Semana 3)

- [ ] Implementar estandarizador de ingredientes
- [ ] Crear clasificador de dificultad
- [ ] Generar estimaciones de tiempo
- [ ] Agregar sugerencias de maridaje
- [ ] Integrar con pipeline de actualización

### Fase 4: Features Avanzadas (Futuro)

- [ ] Búsqueda semántica en frontend
- [ ] Analizador de posts de Instagram
- [ ] Sistema de recomendaciones personalizado
- [ ] Generador de descripciones para redes sociales

---

## ⚙️ Integración con el Proyecto

### Estructura de Archivos

```
scripts/
├── ai/                          # 🆕 Nueva carpeta para scripts de IA
│   ├── __init__.py
│   ├── process_recipes.py       # Procesador básico de recetas
│   ├── optimize_tags.py         # Optimizador de tags con contexto
│   ├── search_recipes.py        # Búsqueda semántica
│   └── analyze_posts.py         # Analizador de Instagram
├── services/
│   ├── instagram_service.py     # Existente
│   ├── parser_service.py        # Existente
│   └── ai_service.py            # 🆕 Servicio compartido de IA
├── main.py                      # Script principal de Instagram
├── ia_main.py                   # 🆕 Script principal de IA
├── run_ia.sh                    # 🆕 Script bash para ejecutar IA
├── local_update.py              # Actualizar para incluir IA (opcional)
└── requirements.txt             # Agregar: ollama
```

### 🚀 Scripts Principales

#### 1. Script de Python: [`ia_main.py`](scripts/ia_main.py)

Script principal para procesar recetas con IA. Soporta modo dry-run y procesamiento por lotes.

**Características:**
- ✅ Modo `--dry-run` para visualizar sin guardar
- ✅ Parámetro `--recipes N` para limitar cantidad
- ✅ **Carga contexto global automáticamente** (todas las recetas, tags, categorías)
- ✅ Opción `--no-context` para desactivar contexto (más rápido)
- ✅ Selección de modelo con `--model`
- ✅ Rutas personalizables de entrada/salida
- ✅ Verificación automática de modelos disponibles

**Uso:**
```bash
cd scripts

# Procesar 3 recetas en modo dry-run (CON contexto global)
python ia_main.py --recipes 3 --dry-run

# Procesar 10 recetas y guardar (contexto activado por defecto)
python ia_main.py --recipes 10

# Procesar sin contexto global (más rápido, menos consistente)
python ia_main.py --recipes 5 --no-context

# Procesar todas con modelo específico
python ia_main.py --model llama3

# Ver ayuda completa
python ia_main.py --help
```

**¿Qué es el contexto global?**

Antes de procesar las N recetas solicitadas, el script:
1. Carga **todas** las recetas del sistema
2. Extrae tags existentes, categorías, y patrones
3. Genera un contexto informativo con estadísticas
4. Envía ese contexto a Ollama junto con cada receta a procesar

**Beneficios:**
- 🎯 **Mayor consistencia** en tags y categorías
- 🔗 **Mejor coherencia** con recetas existentes
- 📊 **Reutiliza nomenclatura** establecida
- 🎨 **Mantiene estilo** uniforme en toda la base de datos

**Ejemplo de contexto generado:**
```
CONTEXTO GLOBAL DE LA BASE DE DATOS DE RECETAS:

Total de recetas en el sistema: 487

Tags más utilizados actualmente (formato: tag → cantidad):
  • pasta → 45
  • vegetariano → 38
  • rápido → 35
  • italiano → 28
  • postres → 25
  ...

Muestra de recetas existentes:
  • Pasta Carbonara
  • Tarta de Manzana
  • Ensalada César
  ...

Categorías de cocina encontradas: italiana, mexicana, argentina, asiática
Niveles de dificultad utilizados: Fácil, Media, Difícil
```

Este contexto se envía a la IA antes de procesar cada receta, permitiendo que mantenga consistencia.

#### 2. Script Bash: [`run_ia.sh`](scripts/run_ia.sh)

Script automatizado que gestiona todo el flujo de trabajo:

**Funcionalidades:**
- ✅ Verifica instalación de Ollama
- ✅ Inicia Ollama automáticamente si no está corriendo
- ✅ Descarga el modelo si no existe
- ✅ Activa entorno virtual de Python
- ✅ Instala dependencias faltantes
- ✅ Ejecuta `ia_main.py` con parámetros configurables
- ✅ Opción para detener Ollama al finalizar

**Uso:**
```bash
cd scripts

# Ejecutar script completo (incluye dry-run con 3 recetas)
./run_ia.sh

# Para modificar parámetros, edita el script o ejecuta ia_main.py directamente
```

**Configuración en el script:**
```bash
# Dentro de run_ia.sh, línea ~17:
OLLAMA_AUTO_STOP=false  # Cambiar a true para detener Ollama automáticamente

# Dentro de run_ia.sh, última línea del paso 6:
python3 ia_main.py --dry-run --recipes 3  # Modificar parámetros aquí
```

**Servicio Compartido de IA:** [`scripts/services/ai_service.py`](scripts/services/ai_service.py)

Este servicio proporciona funciones comunes para interactuar con Ollama. Incluye:

- Generación de respuestas con control de temperatura
- Extracción automática de JSON de respuestas
- Verificación de modelos disponibles
- Gestión de errores

**Uso del servicio:**

```python
from services.ai_service import crear_servicio_ia

# Crear instancia del servicio
ai = crear_servicio_ia('llama3.2')

# Generar respuesta JSON
resultado = ai.generar_json(
    prompt="Analiza esta receta...",
    temperatura=0.3
)
```

### Flujo de Trabajo

**Flujo Manual (paso a paso):**
```
Instagram → main.py → recipes.json
              ↓
         local_update.py (normaliza tags básicos)
              ↓
         ia_main.py (enriquece con IA)
              ↓
         recipes_enriquecidas.json → Frontend
```

**Flujo Automatizado (con bash):**
```
./run_ia.sh
    ↓
 Verifica/Inicia Ollama
    ↓
 Ejecuta ia_main.py
    ↓
 Muestra resultados
```

---

## 📋 Features a Implementar

### 1. 🏷️ Optimizador de Tags (Prioridad Alta)

**Objetivo:** Analizar todas las recetas con contexto completo y optimizar tags para mejorar relaciones entre recetas.

**Script:** `scripts/ai/optimize_tags.py`

**Funcionalidades:**

- Analiza tags existentes y detecta redundancias
- Genera sistema estándar de 20-30 tags consistentes
- Crea reglas de relación automáticas
- Sugiere tags optimizados por receta
- Identifica recetas similares para relacionar

**Integración:**

- Se ejecuta sobre `src/data/recipes.json`
- Genera `src/data/recipes_tags_optimizados.json`
- Compatible con sistema actual de tags

### 2. 🍝 Enriquecedor de Recetas (Prioridad Media)

**Objetivo:** Agregar campos adicionales a recetas existentes.

**Script:** `scripts/ai/enrich_recipes.py`

**Funcionalidades:**

- Estandariza ingredientes (cantidad + unidad + ingrediente)
- Genera tags de salud (vegano, sin gluten, etc)
- Estima dificultad (Fácil/Media/Difícil)
- Calcula tiempo de preparación
- Sugiere maridajes
- Categoriza tipo de cocina (italiana, mexicana, etc)

**Output adicional:**

```json
{
  "name": "Pasta al Pesto",
  "ingredientes_estandarizados": ["400g pasta", "50g albahaca"],
  "tags_salud": ["vegetariano", "rico en proteína"],
  "dificultad": "Fácil",
  "tiempo_preparacion": "20",
  "sugerencia_maridaje": "Vino blanco italiano",
  "categoria_cocina": "italiana"
}
```

### 3. 📱 Analizador de Posts de Instagram (Prioridad Baja)

**Objetivo:** Analizar captions de Instagram para generar insights.

**Script:** `scripts/ai/analyze_posts.py`

**Funcionalidades:**

- Detecta sentimiento del post
- Identifica call-to-action
- Sugiere hashtags optimizados
- Genera resumen corto
- Identifica temas principales

### 4. 🔍 Búsqueda Semántica (Prioridad Media-Alta)

**Objetivo:** Permitir búsquedas en lenguaje natural.

**Script:** `scripts/ai/semantic_search.py`

**Ejemplos de búsqueda:**

- "Cena rápida sin gluten"
- "Postre vegano fácil para niños"
- "Algo con pollo para el almuerzo"

**Integración frontend:**

- Nuevo endpoint en `src/utils/index.js`
- Compatible con SearchBar existente
- Resultados ordenados por relevancia

---

## 🐍 Scripts Implementados

### A. Procesador Básico de Recetas

**Archivo:** [`scripts/ai/process_recipes.py`](scripts/ai/process_recipes.py)

Este script enriquece recetas individuales con datos generados por IA.

**Ejecución:**

```bash
cd scripts
python -m ai.process_recipes
```

**Ejemplo de salida:**

```json
{
  "name": "Pasta al Pesto",
  "ingredients": "pasta, albahaca, ajo, piñones, queso parmesano",
  "ingredientes_estandarizados": [
    "400g pasta",
    "50g albahaca fresca",
    "2 dientes ajo",
    "30g piñones",
    "50g queso parmesano"
  ],
  "tags_salud": ["vegetariano", "rico en proteína"],
  "dificultad": "Fácil",
  "tiempo_preparacion": "20",
  "sugerencia_maridaje": "Vino blanco italiano (Pinot Grigio)",
  "categoria_cocina": "italiana"
}
```

### B. Procesador de Posts de Instagram (Engagement)

**Archivo:** [`scripts/ai/analyze_posts.py`](scripts/ai/analyze_posts.py)

Si tienes posts de IG genéricos, usa este script para extraer información de marketing.

**Ejecución:**

```bash
cd scripts
python -m ai.analyze_posts
```

### C. Optimizador de Tags para Relacionar Recetas

**Archivo:** [`scripts/ai/optimize_tags.py`](scripts/ai/optimize_tags.py)

Este script analiza todas tus recetas con contexto completo y sugiere tags optimizados para mejorar las relaciones entre recetas y la búsqueda.

**Ejecución:**

```bash
cd scripts
python -m ai.optimize_tags
```

**⚠️ IMPORTANTE:** Este proceso puede tardar 10-20 minutos para 500 recetas. Usa `llama3` (8B) para mejor análisis, o `llama3.2` si tienes poca VRAM.

**Funcionalidades:**

- Analiza tags existentes y detecta redundancias
- Genera sistema estándar de 20-30 tags consistentes
- Crea reglas de relación automáticas
- Sugiere tags optimizados por receta
- Identifica recetas similares para relacionar

Ver código completo en [`scripts/ai/optimize_tags.py`](scripts/ai/optimize_tags.py).

1. **Análisis Global**: La IA recibe todas las recetas y analiza:
   - Qué tags existen actualmente
   - Cuáles son redundantes o inconsistentes
   - Qué tags nuevos deberían agregarse
   - Crea un sistema estándar de tags

2. **Reglas de Relación**: Genera reglas automáticas como:

   ```json
   {
     "si_tiene": "pasta",
     "agregar": ["italiano", "carbohidratos", "comfort food"]
   }
   ```

3. **Optimización Individual**: Cada receta se procesa con:
   - El contexto del sistema estándar de tags
   - Reglas automáticas aplicadas
   - Sugerencias de recetas relacionadas

**Ejemplo de resultado:**

```json
{
  "name": "Pasta Carbonara",
  "tags_originales": ["rapido", "italiano", "pasta"],
  "tags_optimizados": [
    "italiano",
    "pasta",
    "comfort food",
    "rico en proteína",
    "cena",
    "tradicional"
  ],
  "tags_relacionados": [
    "Pasta al Pesto",
    "Spaghetti Bolognese",
    "Risotto de Hongos"
  ],
  "razon_optimizacion": "Agregados 'comfort food' y 'cena' para mejor categorización. Estandarizado 'rapido' a sistema uniforme."
}
```

**Uso del resultado para búsquedas:**

Una vez optimizados los tags, tu buscador puede:

- Encontrar recetas relacionadas fácilmente
- Sugerir "Si te gustó X, prueba Y"
- Filtrar por categorías consistentes
- Buscar por ocasión (cena, almuerzo, postre)

## 🛠 4. Gestión de Recursos en Ubuntu

Dado que tienes una GTX 1050 (2GB VRAM) y 24GB de RAM, aquí unos tips vitales:

### Monitoreo en Tiempo Real

Abre una terminal y usa:

```bash
watch -n 1 nvidia-smi
```

Esto te mostrará cada segundo:

- Temperatura de la GPU
- Uso de VRAM
- Procesos activos usando la GPU

### Liberar Memoria

Ollama mantiene el modelo cargado en memoria por **5 minutos** después del último uso. Si necesitas la RAM/VRAM para otra cosa:

```bash
# Detener un modelo específico
ollama stop llama3.2

# O reiniciar el servicio completamente
sudo systemctl restart ollama
```

### Optimización para GTX 1050

Dado que tu GPU tiene solo 2GB de VRAM:

```bash
# Configurar Ollama para usar más RAM del sistema
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_PARALLEL=1

# Reiniciar ollama con estas variables
sudo systemctl restart ollama
```

### Uso de Swap

Con 24GB de RAM estás bien, pero si procesas las 500 recetas de un tirón con Llama 3 (8B):

1. Cierra Chrome/Firefox con muchas pestañas
2. Cierra editores de imagen/video
3. Monitorea con `htop` el uso de RAM

```bash
# Instalar htop si no lo tienes
sudo apt install htop

# Ejecutar
htop
```

## 💡 5. Detalles Importantes

### Control de Temperatura

Si quieres que la IA sea muy precisa y no invente datos:

```python
options={'temperature': 0}    # Muy preciso, nada de creatividad
options={'temperature': 0.3}  # Balance recomendado para recetas
options={'temperature': 0.7}  # Más creativo para descripciones
```

### Formato de Salida

Los modelos a veces escriben texto adicional como "Aquí tienes el JSON:". El script incluye limpieza automática:

```python
start = clean_res.find("{")
end = clean_res.rfind("}") + 1
data = json.loads(clean_res[start:end])
```

### Privacidad Total

✅ Nada de lo que proceses sale de tu computadora  
✅ Ideal para datos privados o de clientes  
✅ No requiere internet después de descargar los modelos  
✅ Sin cuotas ni límites de API  

### Procesamiento por Lotes

Para las 500 recetas, considera procesar en lotes:

```python
def procesar_por_lotes(archivo_entrada, archivo_salida, tamaño_lote=50):
    """Procesa recetas en lotes para mejor gestión de memoria"""
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        todas_recetas = json.load(f)
    
    total_recetas = len(todas_recetas)
    resultados = []
    
    for i in range(0, total_recetas, tamaño_lote):
        lote = todas_recetas[i:i+tamaño_lote]
        print(f"\n📦 Procesando lote {i//tamaño_lote + 1}/{(total_recetas-1)//tamaño_lote + 1}")
        
        # Procesa el lote
        for receta in lote:
            # ... tu lógica de procesamiento
            pass
        
        # Guarda progreso intermedio
        with open(f'temp_lote_{i}.json', 'w', encoding='utf-8') as f:
            json.dump(resultados, f, indent=2, ensure_ascii=False)
    
    # Guarda resultado final
    with open(archivo_salida, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)
```

## 🔍 6. Buscador de Recetas con IA

**Archivo:** [`scripts/ai/search_recipes.py`](scripts/ai/search_recipes.py)

Ahora que tienes `tags_salud` y categorías, puedes crear un buscador inteligente.

**Ejecución:**

```bash
cd scripts
python -m ai.search_recipes
```

**Ejemplos de búsqueda en lenguaje natural:**

- "Cena rápida sin gluten"
- "Postre vegano fácil para niños"
- "Algo con pollo para el almuerzo"

Ver código completo en [`scripts/ai/search_recipes.py`](scripts/ai/search_recipes.py).

## 🚨 7. Troubleshooting

### Error: "Ollama not found"

```bash
# Verificar si está instalado
which ollama

# Si no está, reinstalar
curl -fsSL https://ollama.com/install.sh | sh
```

### Error: "Failed to load model"

```bash
# Verificar modelos descargados
ollama list

# Descargar el modelo necesario
ollama pull llama3.2
```

### La GPU no se usa (solo CPU)

```bash
# Verificar drivers NVIDIA
nvidia-smi

# Si no funciona, instalar drivers:
sudo ubuntu-drivers autoinstall
sudo reboot
```

### Proceso muy lento

1. **Usa modelo más pequeño:** Cambia a `llama3.2` (3B)
2. **Reduce el contexto:** Limita `num_predict` a 300-400 tokens
3. **Procesa en lotes más pequeños:** 10-20 recetas por vez

### Out of Memory

```bash
# Limpiar memoria GPU
sudo systemctl restart ollama

# Monitorear uso
watch -n 1 'free -h && nvidia-smi'
```

## 📈 8. Métricas de Éxito

### KPIs del Proyecto

Una vez implementado, mediremos el éxito con:

- **Consistencia de Tags:** Reducir tags únicos de ~200 a ~30 estándar
- **Calidad de Relaciones:** Cada receta debe tener 3-5 recetas relacionadas relevantes
- **Cobertura de Datos:** 100% de recetas con todos los campos enriquecidos
- **Tiempo de Procesamiento:** < 30 minutos para 500 recetas
- **Uso de Recursos:** Funcionar en GPU de 2GB VRAM

### Antes vs Después

| Métrica | Antes | Después (Objetivo) |
|---------|-------|-------------------|
| Tags únicos | ~200 | ~30 estándar |
| Recetas con ingredientes estandarizados | 0% | 100% |
| Recetas con dificultad | 0% | 100% |
| Recetas con tiempo estimado | 0% | 100% |
| Recetas relacionadas por receta | 0 | 3-5 relevantes |

---

## 🔮 9. Futuras Expansiones

Ideas adicionales una vez consolidado el sistema básico:

1. **🌐 API de Búsqueda Semántica:**
   - Endpoint REST para búsqueda en lenguaje natural
   - Integración con frontend React
   - Cache de embeddings para mejor performance

2. **📊 Dashboard de Analytics:**
   - Visualización de tags más populares
   - Gráficos de distribución de dificultad
   - Mapa de relaciones entre recetas

3. **🤖 Generador de Contenido:**
   - Crear posts para Instagram automáticamente
   - Generar descripciones atractivas
   - Sugerir hashtags optimizados

4. **🔄 Pipeline Automático:**
   - Integrar IA en `main.py`
   - Enriquecer recetas al momento de scrapear
   - Deploy automático de cambios

5. **🎨 Generación de Imágenes:**
   - Integrar Stable Diffusion local
   - Generar imágenes para recetas sin foto
   - Crear variaciones visuales

---

## 📚 10. Recursos y Referencias

### Documentación Técnica

- **Ollama Docs:** <https://github.com/ollama/ollama/blob/main/docs/api.md>
- **Ollama Python Library:** <https://github.com/ollama/ollama-python>
- **Modelos disponibles:** <https://ollama.com/library>

### Comunidad y Soporte

- **Ollama Discord:** <https://discord.gg/ollama>
- **Ubuntu AI Community:** <https://discourse.ubuntu.com/>
- **Llama Index (para RAG):** <https://www.llamaindex.ai/>

### Tutoriales Relacionados

- Ollama + Python: <https://ollama.com/blog/python-javascript-libraries>
- Fine-tuning local models: <https://ollama.com/blog/how-to-fine-tune>
- Optimización de prompts: <https://www.promptingguide.ai/>

---

## 🚀 Cómo Empezar AHORA

### Quick Start (5 minutos)

1. **Instala Ollama:**

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.2
   ```

2. **Ejecuta el script automatizado:**

   ```bash
   cd scripts
   ./run_ia.sh
   ```
   
   Este script hace todo por ti:
   - ✅ Verifica/inicia Ollama
   - ✅ Descarga el modelo si falta
   - ✅ Instala dependencias Python
   - ✅ Procesa 3 recetas en modo dry-run
   
3. **O usa el script Python directamente:**

   ```bash
   cd scripts
   
   # Test con 3 recetas (sin guardar)
   python ia_main.py --recipes 3 --dry-run
   
   # Procesar y guardar 10 recetas
   python ia_main.py --recipes 10
   ```

4. **Ver ayuda completa:**

   ```bash
   python ia_main.py --help
   ```

3. **Primer test con el servicio de IA:**

   Ver [`scripts/services/ai_service.py`](scripts/services/ai_service.py) para el servicio completo.

   ```python
   from services.ai_service import crear_servicio_ia
   
   # Crear servicio
   ai = crear_servicio_ia('llama3.2')
   
   # Verificar modelos disponibles
   print(ai.listar_modelos_disponibles())
   
   # Generar respuesta
   respuesta = ai.generar_respuesta("Sugiere 5 tags para una pasta carbonara")
   print(respuesta)
   ```

4. **Ejecutar scripts de procesamiento:**

   ```bash
   # Procesar recetas
   cd scripts
   python -m ai.process_recipes
   
   # Optimizar tags
   python -m ai.optimize_tags
   
   # Buscar recetas
   python -m ai.search_recipes
   ```

---

## 💡 Notas Finales

### Privacidad y Ventajas

- ✅ **100% Local:** Nada sale de tu computadora
- ✅ **Sin Costos:** No hay APIs de pago ni suscripciones
- ✅ **Personalizable:** Ajusta prompts a tus necesidades
- ✅ **Escalable:** Funciona con 50 o 5000 recetas

### Limitaciones Conocidas

- ⚠️ Requiere GPU/RAM significativa para modelos grandes
- ⚠️ Procesamiento más lento que APIs cloud (OpenAI, etc)
- ⚠️ Calidad depende del modelo y prompts
- ⚠️ Necesita ajustes y experimentación inicial

### Próximos Pasos Recomendados

1. **Ejecutar el script automatizado:** `./run_ia.sh`
2. **Probar con pocas recetas:** `python ia_main.py --recipes 3 --dry-run`
3. **Ajustar prompts según resultados** en [`ia_main.py`](scripts/ia_main.py)
4. **Procesar dataset completo:** `python ia_main.py --recipes 50`
5. **Probar optimización de tags:** `python -m ai.optimize_tags`
6. **Probar búsqueda semántica:** `python -m ai.search_recipes`
7. **Integrar con frontend**
8. **Documentar aprendizajes**

**Scripts principales disponibles:**

- **⭐ [`ia_main.py`](scripts/ia_main.py)** - Script principal con CLI (recomendado)
- **⭐ [`run_ia.sh`](scripts/run_ia.sh)** - Script bash automatizado (más fácil)
- [`scripts/ai/process_recipes.py`](scripts/ai/process_recipes.py) - Módulo de procesamiento
- [`scripts/ai/optimize_tags.py`](scripts/ai/optimize_tags.py) - Optimizador de tags
- [`scripts/ai/search_recipes.py`](scripts/ai/search_recipes.py) - Búsqueda semántica
- [`scripts/ai/analyze_posts.py`](scripts/ai/analyze_posts.py) - Análisis de posts
- [`scripts/services/ai_service.py`](scripts/services/ai_service.py) - Servicio compartido

---

**¿Listo para comenzar?** Consulta el [README principal](README.md) para entender el contexto del proyecto completo.

**¿Necesitas ayuda?** Abre un issue en el repositorio o consulta la documentación oficial de Ollama.
